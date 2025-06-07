from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForCausalLM
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Load model
tokenizer = AutoTokenizer.from_pretrained("./chatbot_finetuned")
model = AutoModelForCausalLM.from_pretrained("./chatbot_finetuned")
tokenizer.pad_token = tokenizer.eos_token

# Load FAQ once at start-up
with open("faq.json", "r") as f:
    faq_data = json.load(f)

def log_chat(user_message, bot_reply):
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "user": user_message,
        "bot": bot_reply
    }
    try:
        with open("chat_logs.json", "r+") as file:
            logs = json.load(file)
            logs.append(log_entry)
            file.seek(0)
            json.dump(logs, file, indent=2)
    except FileNotFoundError:
        with open("chat_logs.json", "w") as file:
            json.dump([log_entry], file, indent=2)

@app.route("/chat", methods=["POST"])
def chat():
    try:
        user_input = request.json.get("message", "").strip()
        if not user_input:
            return jsonify({"reply": "Please ask a question about waste management."})

        # Check FAQ (case-insensitive match)
        faq_reply = None
        for question, answer in faq_data.items():
            if user_input.lower() == question.lower():
                faq_reply = answer
                break

        if faq_reply:
            response = faq_reply
        else:
            # Format exactly like training
            prompt = f"Input: {user_input}{tokenizer.eos_token}Response:"

            inputs = tokenizer(
                prompt,
                return_tensors="pt",
                max_length=128,
                padding="max_length",
                truncation=True
            )

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

        return jsonify({"reply": response})

    except Exception as e:
        return jsonify({"reply": f"Error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(port=5001, debug=True)
