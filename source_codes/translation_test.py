import torch
from transformers import MarianMTModel, MarianTokenizer

# MPS デバイスが利用可能かチェック
device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
print(f"Using device: {device}")

model_save_path = "../../../exported_model"
exported_model = MarianMTModel.from_pretrained(model_save_path)
exported_tokenizer = MarianTokenizer.from_pretrained(model_save_path)

# モデルの状態をロード（map_location を使用）
exported_model.load_state_dict(torch.load(f"{model_save_path}/model_state.pt", map_location=device))

# モデルをデバイスに移動
exported_model = exported_model.to(device)
exported_model.eval()

print("\nAfter export and reload:")

model_name = "staka/fugumt-en-ja"
tokenizer = MarianTokenizer.from_pretrained(model_name)

def generate_translation(input_text, level, model, tokenizer, device):
    model.eval()
    with torch.no_grad():
        level_token = f">>L{level}<<"
        expanded_input_text = f"{level_token} {input_text}"
        inputs = tokenizer(expanded_input_text, return_tensors="pt", padding=True, truncation=True, max_length=512)
        inputs = {k: v.to(device) for k, v in inputs.items()}

        outputs = model.generate(**inputs, max_length=512, num_beams=4, do_sample=False, temperature=1.0, no_repeat_ngram_size=3)
        translated_sentence = tokenizer.decode(outputs[0], skip_special_tokens=True)
        return translated_sentence
    
user_input="In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since."
#user_input = "when you feared he'd confess to the police, you lured into the house, planning to kill him as well."
for level in [0, 1, 2]:
    translated_sentence = generate_translation(user_input, level, exported_model, exported_tokenizer, device)
    print(f"Generated text for level {level}:", translated_sentence)