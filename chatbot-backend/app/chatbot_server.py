import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForCausalLM
from datetime import datetime
import json
import re

from app.pathfinder import a_star

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)
CORS(app)

# Sample grid for pathfinding (0 = walkable, 1 = blocked)
# Updated grid (0 = walkable, 1 = blocked) with clear vertical paths
sample_grid = [
    [0, 0, 0, 0],  # Row 0 - completely walkable
    [0, 1, 0, 1],  # Row 1 - columns 1 and 3 blocked
    [0, 0, 0, 0],  # Row 2 - completely walkable
    [0, 1, 0, 0]   # Row 3 - column 1 blocked
]

# Locations with clear vertical pathways
locations = {
    # Column 0 (fully open vertical path)
    "main entrance": (0, 0),
    "cafeteria": (1, 0),
    "paper recycling": (2, 0),
    "metal recycling": (3, 0),
    
    # Column 1 (partial vertical path)
    "information desk": (0, 1),
    # (1,1) is blocked by sample_grid
    "parking lot": (2, 1),
    # (3,1) is blocked by sample_grid
    
    # Column 2 (fully open vertical path)
    "reception": (0, 2),
    "loading dock": (1, 2),
    "plastic recycling": (2, 2),
    "compost area": (3, 2),
    
    # Column 3 (partial vertical path)
    "security office": (0, 3),
    # (1,3) is blocked by sample_grid
    "electronics recycling": (2, 3),
    "recycling zone": (3, 3)
}
# Load the chatbot model
tokenizer = AutoTokenizer.from_pretrained("./chatbot_finetuned")
model = AutoModelForCausalLM.from_pretrained("./chatbot_finetuned")
tokenizer.pad_token = tokenizer.eos_token

# Load FAQ data
with open(os.path.join(BASE_DIR, "..", "data", "faq.json"), "r") as f:
    faq_data = json.load(f)

# Function to log chat conversations
def log_chat(user_message, bot_reply):
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "user": user_message,
        "bot": bot_reply
    }
    try:
        with open(os.path.join(BASE_DIR, "..", "data", "chat_logs.json"), "r+") as file:
            logs = json.load(file)
            logs.append(log_entry)
            file.seek(0)
            json.dump(logs, file, indent=2)
    except FileNotFoundError:
        with open("chat_logs.json", "w") as file:
            json.dump([log_entry], file, indent=2)

# === CHAT ROUTE ===
@app.route("/chat", methods=["POST"])
def chat():
    try:
        user_input = request.json.get("message", "").strip()
        if not user_input:
            return jsonify({
                "reply": "Please ask a question about waste management.",
                "timestamp": datetime.now().isoformat()
            })

        # === PATHFINDER FEATURE ===
        if "path" in user_input.lower():
            # Try matching location names: e.g. "path from main entrance to recycling zone"
            pattern = re.compile(r"from\s+([\w\s]+)\s+to\s+([\w\s]+)", re.IGNORECASE)
            match = pattern.search(user_input)

            if match:
                start_name = match.group(1).strip().lower()
                end_name = match.group(2).strip().lower()

                if start_name in locations and end_name in locations:
                    start = locations[start_name]
                    end = locations[end_name]
                    path = a_star(start, end, sample_grid)

                    if path:
                        # Reverse map coordinates to location names if available
                        coord_to_name = {v: k for k, v in locations.items()}
                        named_path = [coord_to_name.get(p, None) for p in path]

                        journey = []
                        for i, name in enumerate(named_path):
                            if name:
                                journey.append(name)

                        if len(journey) >= 2:
                            response = f"🛣️ Starting from **{journey[0]}**, pass through " + \
                            ", ".join(journey[1:-1]) + \
                            f", and finally reach **{journey[-1]}**."
                        elif len(journey) == 1:
                            response = f"🛣️ You are already at **{journey[0]}**!"
                        else:
                            response = f"🛣️ Shortest path found, but no named locations were on the way: {path}"
                    else:
                        response = "🚫 No path found between those points."
                else:
                    response = "❗ One or both location names are invalid. Try something like: 'path from main entrance to recycling zone'."
            else:
                response = "❗ Please format the command like: 'path from [location] to [location]'"
        else:
            # === FAQ CHECK ===
            faq_reply = None
            for question, answer in faq_data.items():
                if user_input.lower() == question.lower():
                    faq_reply = answer
                    break

            if faq_reply:
                response = faq_reply
            else:
                # === GENERATE RESPONSE FROM MODEL ===
                prompt = f"Input: {user_input}{tokenizer.eos_token}Response:"
                inputs = tokenizer(prompt, return_tensors="pt", max_length=128, padding="max_length", truncation=True)
                outputs = model.generate(
                    inputs.input_ids,
                    attention_mask=inputs.attention_mask,
                    max_new_tokens=100,
                    temperature=0.3,
                    top_p=0.9,
                    do_sample=True,
                    pad_token_id=tokenizer.eos_token_id,
                    no_repeat_ngram_size=2,
                    early_stopping=True
                )
                full_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
                response = full_text.split("Response:")[1].strip() if "Response:" in full_text else full_text

        # Log the conversation
        log_chat(user_input, response)

        return jsonify({
            "reply": response,
            "timestamp": datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({
            "reply": f"💥 Internal error: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }), 500

if __name__ == "__main__":
    app.run(port=5001, debug=True)