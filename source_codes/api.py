from flask import Flask, request, jsonify
from flask_cors import CORS
import MeCab
import logging

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

logging.basicConfig(level=logging.DEBUG)
app.logger.setLevel(logging.DEBUG)

mecab = MeCab.Tagger('-r /opt/homebrew/etc/mecabrc -d /opt/homebrew/lib/mecab/dic/mecab-ipadic-neologd')

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
        
        result = mecab.parse(text).strip()
        
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
        filtered_words = []
        
        for word in words:
            node = mecab.parseToNode(word)
            while node:
                features = node.feature.split(',')
                if features[0] in ['名詞', '動詞', '形容詞']:
                    filtered_words.append(node.surface)
                node = node.next
        
        return jsonify({'filtered_words': filtered_words})
    except Exception as e:
        app.logger.error(f'Error during word filtering: {str(e)}', exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/')
def home():
    return "Hello, this is the RydeeNLP API server."

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)