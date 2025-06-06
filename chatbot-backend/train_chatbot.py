from transformers import AutoTokenizer, AutoModelForCausalLM, Trainer, TrainingArguments
from datasets import Dataset
import json
import torch

# Configuration
MODEL_NAME = "microsoft/DialoGPT-small"
OUTPUT_DIR = "./chatbot_finetuned"
TRAINING_DATA = "training_data.json"

# Load model and tokenizer
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
tokenizer.pad_token = tokenizer.eos_token
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)

# Prepare training data with special formatting
with open(TRAINING_DATA) as f:
    data = json.load(f)

# Format: "input [EOS] response [EOS]"
formatted_data = [f"Input: {d['input']}{tokenizer.eos_token}Response: {d['response']}{tokenizer.eos_token}" for d in data]

# Tokenization
def tokenize_function(examples):
    return tokenizer(
        examples["text"],
        max_length=128,
        padding="max_length",
        truncation=True,
        return_tensors="pt"
    )

dataset = Dataset.from_dict({"text": formatted_data})
tokenized_dataset = dataset.map(tokenize_function, batched=True)

# Add labels
def add_labels(examples):
    examples["labels"] = examples["input_ids"].copy()
    return examples

tokenized_dataset = tokenized_dataset.map(add_labels, batched=True)

# Training arguments - updated for newer Transformers versions
training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    num_train_epochs=50,  # Higher for memorization
    per_device_train_batch_size=2,
    save_steps=1000,
    logging_steps=100,
    learning_rate=3e-5,
    weight_decay=0.01,
    eval_strategy="no",  # Changed from evaluation_strategy
    remove_unused_columns=True,
    fp16=torch.cuda.is_available(),
)

# Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset,
)

# Train
print("Starting training...")
trainer.train()
trainer.save_model(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)
print("Training complete! Model saved to:", OUTPUT_DIR)