import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForCausalLM
from datetime import datetime
import json
import re
from app.pathfinder import a_star
from app.logic_engine import handle_logic
from app.knowledge_base import search_knowledge_base

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)
CORS(app)

# ===== PATHFINDING SYSTEM =====
sample_grid = [
    [0, 0, 0, 0],  # Row 0 - completely walkable
    [0, 1, 0, 1],  # Row 1 - columns 1 and 3 blocked
    [0, 0, 0, 0],  # Row 2 - completely walkable
    [0, 1, 0, 0]   # Row 3 - column 1 blocked
]

locations = {
    # Column 0 (fully open vertical path)
    "main entrance": (0, 0),
    "cafeteria": (1, 0),
    "paper recycling": (2, 0),
    "metal recycling": (3, 0),
    
    # Column 1 (partial vertical path)
    "information desk": (0, 1),
    "parking lot": (2, 1),
    
    # Column 2 (fully open vertical path)
    "reception": (0, 2),
    "loading dock": (1, 2),
    "plastic recycling": (2, 2),
    "compost area": (3, 2),
    
    # Column 3 (partial vertical path)
    "security office": (0, 3),
    "electronics recycling": (2, 3),
    "recycling zone": (3, 3)
}

# ===== AI MODEL SETUP =====
tokenizer = AutoTokenizer.from_pretrained("./chatbot_finetuned")
model = AutoModelForCausalLM.from_pretrained("./chatbot_finetuned")
tokenizer.pad_token = tokenizer.eos_token

# ===== DATA LOADING =====
def load_or_create_json(filepath, default=[]):
    try:
        with open(filepath, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w") as f:
            json.dump(default, f, indent=2)
        return default

faq_data = load_or_create_json(os.path.join(BASE_DIR, "..", "data", "faq.json"), {})
chat_logs = load_or_create_json(os.path.join(BASE_DIR, "..", "data", "chat_logs.json"), [])

# ===== CORE CHAT FUNCTIONALITY =====
@app.route("/chat", methods=["POST"])
def chat():
    try:
        user_input = request.json.get("message", "").strip()
        if not user_input:
            return jsonify({
                "reply": "Please ask a question about waste management.",
                "timestamp": datetime.now().isoformat()
            })

        response = None

        # First check logic engine (pathfinding, commands, etc)
        logic_reply = handle_logic(user_input)
        if logic_reply:
            response = logic_reply
        # If no logic match, try pathfinding
        elif "path" in user_input.lower():
            response = handle_pathfinding(user_input)
        # Then check knowledge base
        elif not response:
            kb_reply = search_knowledge_base(user_input)
            if kb_reply:
                response = kb_reply
        # Then check FAQ
        elif not response:
            response = next((answer for q, answer in faq_data.items() 
                          if user_input.lower() == q.lower()), None)
        # Finally use AI model
        if not response:
            response = generate_ai_response(user_input)

        # Log and return
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

# ===== HELPER FUNCTIONS =====
def handle_pathfinding(user_input):
    pattern = re.compile(r"from\s+([\w\s]+)\s+to\s+([\w\s]+)", re.IGNORECASE)
    match = pattern.search(user_input)
    
    if not match:
        return "❗ Please format as: 'path from [location] to [location]'"
    
    start_name = match.group(1).strip().lower()
    end_name = match.group(2).strip().lower()
    
    if start_name not in locations or end_name not in locations:
        return "❗ Invalid locations. Try: " + ", ".join(locations.keys())
    
    path = a_star(locations[start_name], locations[end_name], sample_grid)
    if not path:
        return "🚫 No path found between those points"
    
    # Convert path to named locations
    coord_to_name = {v: k for k, v in locations.items()}
    named_path = [coord_to_name.get(p, f"({p[0]},{p[1]})") for p in path]
    
    if len(named_path) == 1:
        return f"🛣️ You're already at {named_path[0]}!"
    
    return (f"🛣️ Path: Start at {named_path[0]}, then go via " +
           " → ".join(named_path[1:-1]) + 
           f" to reach {named_path[-1]}")

def generate_ai_response(user_input):
    prompt = f"Input: {user_input}{tokenizer.eos_token}Response:"
    inputs = tokenizer(prompt, return_tensors="pt", 
                      max_length=128, padding="max_length", truncation=True)
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
    return full_text.split("Response:")[1].strip() if "Response:" in full_text else full_text

def log_chat(user_message, bot_reply):
    chat_logs.append({
        "timestamp": datetime.now().isoformat(),
        "user": user_message,
        "bot": bot_reply
    })
    with open(os.path.join(BASE_DIR, "..", "data", "chat_logs.json"), "w") as f:
        json.dump(chat_logs, f, indent=2)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)