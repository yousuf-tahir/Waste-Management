from dotenv import load_dotenv
load_dotenv()
import os
import json
import re
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForCausalLM
from datetime import datetime

from app.pathfinder import a_star
from app.logic_engine import handle_logic
from app.knowledge_base import search_knowledge_base

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'dev_fallback_key')
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # Better for CORS
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])  # Specify your frontend URL

# ===== STATIC GRID & LOCATIONS =====
sample_grid = [
    [0, 0, 0, 0],
    [0, 1, 0, 1],
    [0, 0, 0, 0],
    [0, 1, 0, 0]
]

locations = {
    "main entrance": (0, 0),
    "cafeteria": (1, 0),
    "paper recycling": (2, 0),
    "metal recycling": (3, 0),
    "information desk": (0, 1),
    "parking lot": (2, 1),
    "reception": (0, 2),
    "loading dock": (1, 2),
    "plastic recycling": (2, 2),
    "compost area": (3, 2),
    "security office": (0, 3),
    "electronics recycling": (2, 3),
    "recycling zone": (3, 3)
}

# ===== AI MODEL =====
tokenizer = AutoTokenizer.from_pretrained("./chatbot_finetuned")
model = AutoModelForCausalLM.from_pretrained("./chatbot_finetuned")
tokenizer.pad_token = tokenizer.eos_token

# ===== DATA FILES =====
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

# ===== HELPERS =====
def extract_locations(text):
    patterns = [
        r"(?:from|at)\s+([^\s]+(?:\s+[^\s]+)*?)\s+(?:to|until|till|through)\s+([^\s]+(?:\s+[^\s]+)*)",
        r"(?:how to get|path|route|directions)\s+(?:from|at)\s+([^\s]+(?:\s+[^\s]+)*)\s+(?:to|until)\s+([^\s]+(?:\s+[^\s]+)*)",
        r"([^\s]+(?:\s+[^\s]+)*)\s+to\s+([^\s]+(?:\s+[^\s]+)*)"
    ]
    text = text.lower().strip()
    for pattern in patterns:
        match = re.search(pattern, text)
        if match and len(match.groups()) >= 2:
            return [g.strip() for g in match.groups()[:2]]
    return []

def validate_location(name):
    name = name.lower().strip()
    best_match = None
    highest_score = 0
    
    # Exact match first
    for loc in locations:
        if name == loc.lower():
            return loc
    
    # Partial match
    for loc in locations:
        score = 0
        name_words = name.split()
        loc_words = loc.lower().split()
        
        # Count word matches
        for word in name_words:
            if word in loc_words:
                score += 2
            elif any(word in loc_word for loc_word in loc_words):
                score += 1
        
        if score > highest_score:
            highest_score = score
            best_match = loc
    
    return best_match if highest_score >= 1 else None

# ===== PATHFINDING CORE =====
def handle_pathfinding(user_input):
    locations_found = extract_locations(user_input)
    if len(locations_found) < 2:
        return "❗ Please specify both start and end locations like: 'path from cafeteria to reception'"

    start_name = validate_location(locations_found[0])
    end_name = validate_location(locations_found[1])

    if not start_name:
        return f"❌ Unknown starting location: '{locations_found[0]}'. Valid options: {', '.join(list(locations.keys()))}"
    if not end_name:
        return f"❌ Unknown destination: '{locations_found[1]}'. Valid options: {', '.join(list(locations.keys()))}"

    path = a_star(locations[start_name], locations[end_name], sample_grid)
    if not path:
        return f"🚫 No available path from {start_name} to {end_name} due to obstacles"

    coord_to_name = {v: k for k, v in locations.items()}
    steps = [coord_to_name[coord] for coord in path if coord in coord_to_name]

    return "🗺️ Path:\n" + " → ".join(steps) if steps else f"🛣️ Direct path: {path}"

# ===== FLASK ROUTE =====
@app.route("/chat", methods=["POST"])
def chat():
    try:
        user_input = request.json.get("message", "").strip()
        if not user_input:
            return jsonify({"reply": "Please ask a question about waste management.", "timestamp": datetime.now().isoformat()})

        # Initialize session context
        if 'context' not in session:
            session['context'] = {
                'last_topic': None, 
                'last_locations': [], 
                'history': [],
                'expecting_next_location': False,
                'current_start_location': None
            }

        lower_input = user_input.lower()
        context = session['context']

        print(f"DEBUG: User input: {user_input}")
        print(f"DEBUG: Current context: {context}")

        # Handle continuation requests (yes, continue, more)
        continuation_words = ["yes", "continue", "more", "next"]
        if any(word in lower_input for word in continuation_words) and context.get('last_topic') == "pathfinding":
            if context.get('last_locations') and len(context['last_locations']) >= 2:
                # Use the destination from the last pathfinding as the new starting point
                last_destination = context['last_locations'][1]
                context['expecting_next_location'] = True
                context['current_start_location'] = last_destination
                session.modified = True
                
                return jsonify({
                    "reply": f"Great! You're currently at {last_destination}. Where would you like to go next?",
                    "timestamp": datetime.now().isoformat()
                })

        # Handle next location input when expecting it
        if context.get('expecting_next_location') and context.get('current_start_location'):
            start_location = context['current_start_location']
            
            # Try to validate the entire input as a destination
            destination = validate_location(user_input)
            
            if destination:
                # Create pathfinding request
                path_response = handle_pathfinding(f"from {start_location} to {destination}")
                
                # Update context
                context['last_locations'] = [start_location, destination]
                context['last_topic'] = "pathfinding"
                context['expecting_next_location'] = False
                context['current_start_location'] = None
                session.modified = True
                
                # Add follow-up question
                path_response += "\n\nWould you like to continue from here? (Say 'yes' or 'continue')"
                
                return jsonify({
                    "reply": path_response,
                    "timestamp": datetime.now().isoformat()
                })
            else:
                available_locations = ", ".join(list(locations.keys()))
                return jsonify({
                    "reply": f"I couldn't find the location '{user_input}'. Available locations are: {available_locations}. Please try again.",
                    "timestamp": datetime.now().isoformat()
                })

        # Handle regular pathfinding requests
        path_patterns = [r"\bpath\b", r"\broute\b", r"\bhow to get\b", r"from .* to", r"directions"]
        if any(re.search(pattern, lower_input) for pattern in path_patterns):
            path_response = handle_pathfinding(user_input)
            
            if path_response and not path_response.startswith("❗") and not path_response.startswith("❌"):
                # Extract locations for session storage
                extracted_locations = extract_locations(user_input)
                if len(extracted_locations) >= 2:
                    start_name = validate_location(extracted_locations[0])
                    end_name = validate_location(extracted_locations[1])
                    
                    if start_name and end_name:
                        context['last_topic'] = "pathfinding"
                        context['last_locations'] = [start_name, end_name]
                        session.modified = True
                        
                        # Add follow-up question
                        path_response += "\n\nWould you like to continue from here? (Say 'yes' or 'continue')"
                
                return jsonify({
                    "reply": path_response,
                    "timestamp": datetime.now().isoformat()
                })

        # Handle other types of queries
        response = (
            handle_logic(user_input) or
            search_knowledge_base(user_input) or
            next((a for q, a in faq_data.items() if user_input.lower() == q.lower()), None) or
            generate_ai_response(user_input)
        )

        # Save conversation history
        context['history'].append({
            "user": user_input,
            "bot": response,
            "timestamp": datetime.now().isoformat()
        })
        session.modified = True

        log_chat(user_input, response)
        return jsonify({"reply": response, "timestamp": datetime.now().isoformat()})

    except Exception as e:
        print(f"ERROR: {str(e)}")
        return jsonify({"reply": f"💥 Internal error: {str(e)}", "timestamp": datetime.now().isoformat()}), 500

# ===== OTHER UTILITIES =====
def generate_ai_response(user_input):
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
    return full_text.split("Response:")[1].strip() if "Response:" in full_text else full_text

def log_chat(user_message, bot_reply):
    chat_logs.append({
        "timestamp": datetime.now().isoformat(),
        "user": user_message,
        "bot": bot_reply
    })
    with open(os.path.join(BASE_DIR, "..", "data", "chat_logs.json"), "w") as f:
        json.dump(chat_logs, f, indent=2)

# Debug route to check session
@app.route("/debug-session", methods=["GET"])
def debug_session():
    return jsonify({"session": dict(session)})

if __name__ == "__main__":
    app.run(host="localhost", port=5001, debug=True)