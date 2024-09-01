from flask import Flask, request, jsonify
import MeCab
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/analyze', methods=['POST'])
def analyze():
    text = request.json['text']
    print(text)
    mecab = MeCab.Tagger('-r /opt/homebrew/etc/mecabrc -d /opt/homebrew/lib/mecab/dic/mecab-ipadic-neologd -Owakati')
    result = mecab.parse(text).strip()
    print(result)
    return jsonify({'result': result})

if __name__ == '__main__':
    app.run(debug=True)
