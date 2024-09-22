const pasteArea = document.querySelector('#pasteArea');
const generateBtn = document.querySelector('#generateBtn');
const translationArea = document.querySelector('#translationArea pre');
const wordList = document.querySelector('#wordList');
const flashcardContent = document.querySelector('#flashcardContent');

let displayedWords = new Set();

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
      wordList.innerHTML = '';
      Object.entries(response.filteredWords).forEach(([word, features]) => {
        if (!displayedWords.has(word)) {
          const wordElement = document.createElement('div');
          wordElement.textContent = features[6] ; // 対応する値の[6]番目、なければ単語そのものを表示
          wordElement.classList.add('word');
          wordElement.addEventListener('click', () => addToFlashcard(word));
          wordList.appendChild(wordElement);
          displayedWords.add(word);
        }
      });
    }
  });
}

let wordDefinitions = {};
let originalToDisplayMap = {}; // 追加: 元の形式と表示用単語のマッピング

function addToFlashcard(displayWord, originalForm) {
  chrome.runtime.sendMessage({action: "addWord", word: displayWord}, response => {
    if (response.success) {
      originalToDisplayMap[originalForm] = displayWord; // 追加: マッピングを保存
      // 定義を取得
      chrome.runtime.sendMessage({action: "getDefinition", word: displayWord}, defResponse => {
        if (defResponse.definition) {
          wordDefinitions[displayWord] = defResponse.definition;
        } else {
          console.error('Error getting definition:', defResponse.error);
          wordDefinitions[displayWord] = ["No definition available"];
        }
        updateFlashcardDisplay(response.wordList);
      });
    } else {
      console.log(response.message);
    }
  });
}

function updateFlashcardDisplay(wordList) {
  flashcardContent.innerHTML = '';
  wordList.forEach(word => {
    const wordElement = document.createElement('div');
    wordElement.classList.add('flashcard-item');
    
    const wordText = document.createElement('div');
    wordText.textContent = word;
    wordText.classList.add('flashcard-word');
    wordElement.appendChild(wordText);
    
    const definitionElement = document.createElement('div');
    definitionElement.classList.add('flashcard-definition');
    if (wordDefinitions[word]) {
      definitionElement.textContent = wordDefinitions[word].join(', ');
    } else {
      definitionElement.textContent = "Loading definition...";
      // 定義がまだ取得されていない場合、ここで取得を試みる
      chrome.runtime.sendMessage({action: "getDefinition", word: word}, defResponse => {
        if (defResponse.definition) {
          wordDefinitions[word] = defResponse.definition;
          definitionElement.textContent = defResponse.definition.join(', ');
        } else {
          definitionElement.textContent = "No definition available";
        }
      });
    }
    wordElement.appendChild(definitionElement);
    
    // クリックイベントを追加
    wordElement.addEventListener('click', () => {
      chrome.runtime.sendMessage({action: "removeWord", word: word}, response => {
        if (response.success) {
          updateFlashcardDisplay(response.wordList);
        }
      });
    });
    
    flashcardContent.appendChild(wordElement);
  });
}

function filterAndDisplayWords(words) {
  chrome.runtime.sendMessage({action: "filterWords", words: words}, response => {
    if (response.error) {
      console.error('Error:', response.error);
    } else {
      wordList.innerHTML = '';
      Object.entries(response.filteredWords).forEach(([originalForm, features]) => {
        if (!displayedWords.has(originalForm)) {
          const wordElement = document.createElement('div');
          const displayWord = features[6] || originalForm; // 対応する値の[6]番目、なければ単語そのものを表示
          wordElement.textContent = displayWord;
          wordElement.classList.add('word');
          wordElement.addEventListener('click', () => addToFlashcard(displayWord, originalForm));
          wordList.appendChild(wordElement);
          displayedWords.add(originalForm);
        }
      });
    }
  });
}

// 初期表示時にバックグラウンドのwordListを取得して表示
chrome.runtime.sendMessage({action: "getWordList"}, response => {
  updateFlashcardDisplay(response.wordList);
});