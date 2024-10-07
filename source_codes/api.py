from flask import Flask, request, jsonify
from flask_cors import CORS
import MeCab
import logging
import genanki
import random
import io
from flask import send_file
import torch
from transformers import MarianMTModel, MarianTokenizer

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
    

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

logging.basicConfig(level=logging.DEBUG)
app.logger.setLevel(logging.DEBUG)
mecab = MeCab.Tagger('-r /opt/homebrew/etc/mecabrc -d /opt/homebrew/lib/mecab/dic/mecab-ipadic-neologd -Owakati')
mecab_2 = MeCab.Tagger('-r /opt/homebrew/etc/mecabrc -d /opt/homebrew/lib/mecab/dic/mecab-ipadic-neologd')
@app.before_request
def log_request_info():
    app.logger.debug('Headers: %s', request.headers)
    app.logger.debug('Body: %s', request.get_data(as_text=True))

@app.route('/analyze', methods=['POST'])
def analyze():
    app.logger.info('Received analyze request')
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            app.logger.error('No text provided in the request')
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text']
        app.logger.debug('Received text: %s', text)
        
        result = mecab.parse(text).strip().split()
        
        app.logger.debug('Analyzed result: %s', result)
        return jsonify({'result': result})
    except Exception as e:
        app.logger.error('Error during analysis: %s', str(e), exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/filter_words', methods=['POST'])
def filter_words():
    try:
        data = request.get_json()
        if not data or 'words' not in data:
            return jsonify({'error': 'No words provided'}), 400
        
        words = data['words']
        filtered_words = {}
        
        for word in words:
            node = mecab_2.parseToNode(word)
            while node:
                features = node.feature.split(',')
                if features[0] in ['名詞', '動詞', '形容詞']:
                    filtered_words[node.surface] = features
                node = node.next
        
        return jsonify({'filtered_words': filtered_words})
    except Exception as e:
        app.logger.error(f'Error during word filtering: {str(e)}', exc_info=True)
        return jsonify({'error': str(e)}), 500
import requests

@app.route('/get_definition', methods=['POST'])
def get_definition():
    try:
        data = request.get_json()
        word = data['word']
        definition = search_word_in_dictionary(word)
        return jsonify({'definition': definition})
    except Exception as e:
        app.logger.error(f'Error getting definition: {str(e)}', exc_info=True)
        return jsonify({'error': str(e)}), 500

def search_word_in_dictionary(word):
    response = requests.get(f"https://jisho.org/api/v1/search/words?keyword={word}")
    if response.status_code == 200:
        data = response.json()
        meanings = []
        for entry in data['data']:
            senses = entry['senses']
            for sense in senses:
                eng_meaning = sense.get('english_definitions', [])
                meanings.extend(eng_meaning)
        return meanings[:3] if meanings else ["No definition found"]
    else:
        return ["Word not found or API error"]
    
@app.route('/generate_anki', methods=['POST'])
def generate_anki():
    try:
        data = request.get_json()
        if not data or 'flashcards' not in data:
            return jsonify({'error': 'No flashcards provided'}), 400
        
        flashcards = data['flashcards']
        
        # Create deck
        deck_id = random.randrange(1 << 30, 1 << 31)
        deck = genanki.Deck(deck_id, 'English Flashcards')
        
        # Create model
        model_id = random.randrange(1 << 30, 1 << 31)
        model = genanki.Model(
            model_id,
            'Simple Model',
            fields=[
                {'name': 'Question'},
                {'name': 'Answer'},
            ],
            templates=[
                {
                    'name': 'Card 1',
                    'qfmt': '{{Question}}',
                    'afmt': '{{FrontSide}}<hr id="answer">{{Answer}}',
                },
            ])
        
        # Add notes to deck
        for card in flashcards:
            note = genanki.Note(
                model=model,
                fields=[card['word'], card['definition']]
            )
            deck.add_note(note)
        
        # Generate package
        package = genanki.Package(deck)
        file_obj = io.BytesIO()
        package.write_to_file(file_obj)
        file_obj.seek(0)
        
        return send_file(
            file_obj,
            as_attachment=True,
            download_name='output.apkg',
            mimetype='application/octet-stream'
        )
    except Exception as e:
        app.logger.error(f'Error generating Anki deck: {str(e)}', exc_info=True)
        return jsonify({'error': str(e)}), 500
    
@app.route('/translate', methods=['POST'])
def translate():
    try:
        data = request.get_json()
        if not data or 'text' not in data or 'level' not in data:
            return jsonify({'error': 'No text or level provided'}), 400
        
        text = data['text']
        level = data['level']
        level = 2-level
        
        # Here, you would call your translation model function
        translated_text = generate_translation(text, level, exported_model, exported_tokenizer, device)
        
        return jsonify({'translated_text': translated_text})
    except Exception as e:
        app.logger.error(f'Error during translation: {str(e)}', exc_info=True)
        return jsonify({'error': str(e)}), 500
    
@app.route('/')
def home():
    return "Hello, this is the RydeeNLP API server."

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)