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
      translationArea.textContent = response.result;
      filterAndDisplayWords(response.result);
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

function filterAndDisplayWords(text) {
  const words = text.split(' ');
  chrome.runtime.sendMessage({action: "filterWords", words: words}, response => {
    if (response.error) {
      console.error('Error:', response.error);
    } else {
      wordList.innerHTML = '';
      response.filteredWords.forEach(word => {
        if (!displayedWords.has(word)) {
          const wordElement = document.createElement('div');
          wordElement.textContent = word;
          wordElement.classList.add('word');
          wordElement.addEventListener('click', () => addToFlashcard(word));
          wordList.appendChild(wordElement);
          displayedWords.add(word);
        }
      });
    }
  });
}

function addToFlashcard(word) {
  chrome.runtime.sendMessage({action: "addWord", word: word}, response => {
    if (response.success) {
      updateFlashcardDisplay(response.wordList);
    } else {
      console.log(response.message);
    }
  });
}

function updateFlashcardDisplay(wordList) {
  flashcardContent.innerHTML = '';
  wordList.forEach(word => {
    const wordElement = document.createElement('div');
    wordElement.textContent = word;
    wordElement.classList.add('flashcard-word');
    flashcardContent.appendChild(wordElement);
  });
}

// 初期表示時にバックグラウンドのwordListを取得して表示
chrome.runtime.sendMessage({action: "getWordList"}, response => {
  updateFlashcardDisplay(response.wordList);
});