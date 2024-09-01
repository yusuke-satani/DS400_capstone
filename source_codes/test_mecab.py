import MeCab

text = '彼はいつもパソコンを使っている。'
mecab = MeCab.Tagger('-r /opt/homebrew/etc/mecabrc -d /opt/homebrew/lib/mecab/dic/mecab-ipadic-neologd -Owakati')
result = mecab.parse(text).strip()



print(result)