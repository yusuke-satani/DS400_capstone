const pasteArea = document.querySelector('#pasteArea');
const generateBtn = document.querySelector('#generateBtn');
const translationArea = document.querySelector('#translationArea pre');
const wordListElement = document.querySelector('#wordList');
const flashcardContent = document.querySelector('#flashcardContent');

let displayedWords = new Set();
let wordList = [];

document.addEventListener('DOMContentLoaded', () => {
  loadWordList();
  // 他の初期化コード...
});

function loadWordList() {
  chrome.storage.sync.get(['wordList'], (result) => {
    if (result.wordList) {
      wordList = result.wordList;
      updateFlashcardDisplay(wordList);
    }
  });
}

function saveWordList() {
  chrome.storage.sync.set({ wordList: wordList });
}

generateBtn.addEventListener('click', () => {
  const text = pasteArea.value;
  
  chrome.runtime.sendMessage({action: "analyze", text: text}, response => {
    console.log("Received response:", response);  // デバッグ用ログ
    if (response && response.error) {
      console.error('Error:', response.error);
      translationArea.textContent = 'Error occurred during analysis: ' + response.error;
    } else if (response && response.result) {
      translationArea.textContent = response.result.join('');  // 空白なしで結合
      filterAndDisplayWords(response.result);  // 直接 result を渡す
    } else {
      console.error('Unexpected response:', response);
      translationArea.textContent = 'Unexpected error occurred';
    }
  });

  generateBtn.innerHTML = 'Generated';
  setTimeout(() => {
    generateBtn.innerHTML = 'Generate';
  }, 1000);
});

function filterAndDisplayWords(words) {
  chrome.runtime.sendMessage({action: "filterWords", words: words}, response => {
    if (response.error) {
      console.error('Error:', response.error);
    } else {
      wordListElement.innerHTML = '';
      Object.entries(response.filteredWords).forEach(([originalForm, features]) => {
        if (!displayedWords.has(originalForm)) {
          const wordElement = document.createElement('div');
          const displayWord = features[6] || originalForm; // 対応する値の[6]番目、なければ単語そのものを表示
          wordElement.textContent = displayWord;
          wordElement.classList.add('word');
          wordElement.addEventListener('click', () => addToFlashcard(displayWord, originalForm));
          wordListElement.appendChild(wordElement);
          displayedWords.add(originalForm);
        }
      });
    }
  });
}

function addToFlashcard(displayWord, originalForm) {
  if (!wordList.some(item => item.word === displayWord)) {
    wordList.push({ word: displayWord, definition: '' });
    saveWordList();
    // 定義を取得
    chrome.runtime.sendMessage({action: "getDefinition", word: displayWord}, defResponse => {
      if (defResponse.definition) {
        const index = wordList.findIndex(item => item.word === displayWord);
        if (index !== -1) {
          wordList[index].definition = defResponse.definition.join(', ');
          saveWordList();
        }
      } else {
        console.error('Error getting definition:', defResponse.error);
      }
      updateFlashcardDisplay(wordList);
    });
  }
}

function updateFlashcardDisplay(wordList) {
  flashcardContent.innerHTML = '';
  wordList.forEach(item => {
    const wordElement = document.createElement('div');
    wordElement.classList.add('flashcard-item');
    
    const wordText = document.createElement('div');
    wordText.textContent = item.word;
    wordText.classList.add('flashcard-word');
    wordElement.appendChild(wordText);
    
    const definitionElement = document.createElement('div');
    definitionElement.classList.add('flashcard-definition');
    definitionElement.textContent = item.definition || "Loading definition...";
    wordElement.appendChild(definitionElement);
    
    // クリックイベントを追加
    wordElement.addEventListener('click', () => {
      const index = wordList.findIndex(w => w.word === item.word);
      if (index > -1) {
        wordList.splice(index, 1);
        saveWordList();
        updateFlashcardDisplay(wordList);
      }
    });
    
    flashcardContent.appendChild(wordElement);
  });
}

function generateAnkiDeck() {
  const flashcards = wordList.map(item => ({
    word: item.word,
    definition: item.definition
  }));

  chrome.runtime.sendMessage({action: "generateAnki", flashcards: flashcards}, response => {
    if (chrome.runtime.lastError) {
      console.error('Error:', chrome.runtime.lastError);
    } else if (response.error) {
      console.error('Error:', response.error);
    } else if (response.success) {
      console.log('Anki deck generated and download started');
      // フラッシュカードをクリア
      wordList = [];
      saveWordList();
      updateFlashcardDisplay(wordList);
    }
  });
}

// Generate Anki Deck ボタンのイベントリスナーを追加
document.querySelector('#generateAnkiBtn').addEventListener('click', generateAnkiDeck);

// 初期表示時にバックグラウンドのwordListを取得して表示
chrome.runtime.sendMessage({action: "getWordList"}, response => {
  updateFlashcardDisplay(response.wordList);
});