from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import sys

# 👂 Get prompt from command-line
prompt = sys.argv[1] if len(sys.argv) > 1 else "3 bedrooms, 2 bathrooms, Cape Town, pool, garage"

# Load your fine-tuned model
model_path = "./output/final_model"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForCausalLM.from_pretrained(model_path)

def generate_description(input_text):
    prompt = f"Input: {input_text}\nOutput:"
    inputs = tokenizer(prompt, return_tensors="pt")
    outputs = model.generate(
        **inputs,
        max_length=256,
        do_sample=True,
        temperature=0.7,
        top_k=50,
        top_p=0.92,
        no_repeat_ngram_size=3,
        pad_token_id=tokenizer.eos_token_id
    )
    generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return generated_text.split("Output:")[-1].strip()

# ✅ Use dynamic input
if __name__ == "__main__":
    result = generate_description(prompt)

    # Keep only the first paragraph or sentence
    clean_result = result.split("\n")[0].strip()

    # Output only the clean description (no emojis, no debug lines)
    print(clean_result)



