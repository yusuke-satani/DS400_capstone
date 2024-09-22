import MeCab

text = '彼はひどく感動した。'
mecab = MeCab.Tagger('-r /opt/homebrew/etc/mecabrc -d /opt/homebrew/lib/mecab/dic/mecab-ipadic-neologd')

result = mecab.parse(text).strip().split()
print(result)
