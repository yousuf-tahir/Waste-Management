from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForCausalLM

app = Flask(__name__)
CORS(app)

# Load model
tokenizer = AutoTokenizer.from_pretrained("./chatbot_finetuned")
model = AutoModelForCausalLM.from_pretrained("./chatbot_finetuned")
tokenizer.pad_token = tokenizer.eos_token

@app.route("/chat", methods=["POST"])
def chat():
    try:
        user_input = request.json.get("message", "").strip()
        if not user_input:
            return jsonify({"reply": "Please ask a question about waste management."})

        # Format exactly like training
        prompt = f"Input: {user_input}{tokenizer.eos_token}Response:"
        
        inputs = tokenizer(
            prompt,
            return_tensors="pt",
            max_length=128,
            padding="max_length",
            truncation=True
        )

        # Generate with constrained parameters
        outputs = model.generate(
            inputs.input_ids,
            attention_mask=inputs.attention_mask,
            max_new_tokens=100,
            temperature=0.3,  # Lower for more predictable responses
            top_p=0.9,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id,
            no_repeat_ngram_size=2,
            early_stopping=True
        )

        # Extract only the response part
        full_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        response = full_text.split("Response:")[1].strip() if "Response:" in full_text else full_text
        
        return jsonify({"reply": response})

    except Exception as e:
        return jsonify({"reply": f"Error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(port=5001, debug=True)