from datasets import load_dataset
from transformers import AutoTokenizer, AutoModelForCausalLM, TrainingArguments, Trainer, DataCollatorForLanguageModeling

# Load dataset
data_files = {"train": "model_training/property_data.jsonl"}
dataset = load_dataset("json", data_files=data_files, split="train")

# Load tokenizer and model
model_name = "distilgpt2"
tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token  # ✅ Fix: set a pad token
model = AutoModelForCausalLM.from_pretrained(model_name)

# Format the data
def tokenize(example):
    prompt = f"Input: {example['input']}\nOutput:"
    target = example['output']
    full_text = prompt + " " + target
    return tokenizer(full_text, truncation=True, padding="max_length", max_length=256)

tokenized_dataset = dataset.map(tokenize)

# Training configuration
training_args = TrainingArguments(
    output_dir="./output",
    per_device_train_batch_size=2,
    num_train_epochs=3,
    logging_dir="./logs",
    logging_steps=10,
    save_steps=100,
    save_total_limit=1,
    fp16=False,
    overwrite_output_dir=True
)

# Trainer setup
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset,
    data_collator=DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)
)

# Train the model
trainer.train()

# Save final model
model.save_pretrained("./output/final_model")
tokenizer.save_pretrained("./output/final_model")
