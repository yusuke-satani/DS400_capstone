const pasteArea = document.querySelector('#pasteArea');
const generateBtn = document.querySelector('#generateBtn');
const translationArea = document.querySelector('#translationArea pre');
const wordListElement = document.querySelector('#wordList');
const flashcardContent = document.querySelector('#flashcardContent');

let displayedWords = new Set();
let wordList = [];
let selectedLevel = 0;  // デフォルトレベル

document.addEventListener('DOMContentLoaded', () => {
    loadWordList();
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

// レベルボタンのイベントリスナーを追加
document.querySelectorAll('.levelBtn').forEach(button => {
    button.addEventListener('click', (e) => {
        selectedLevel = parseInt(e.target.dataset.level);
        document.querySelectorAll('.levelBtn').forEach(btn => btn.classList.remove('selected'));
        e.target.classList.add('selected');
    });
});

generateBtn.addEventListener('click', () => {
    const text = pasteArea.value;

    // Translation と Words セクションをクリア
    translationArea.textContent = 'Translating...';
    wordListElement.innerHTML = '';
    displayedWords.clear();

    chrome.runtime.sendMessage({action: "translate", text: text, level: selectedLevel}, response => {
        if (response && response.error) {
            console.error('Error:', response.error);
            translationArea.textContent = 'Error occurred during translation: ' + response.error;
        } else if (response && response.translatedText) {
            translationArea.textContent = response.translatedText;
            filterAndDisplayWords(response.translatedText.split(' '));
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
            response.filteredWords.forEach(item => {
                if (!displayedWords.has(item.word)) {
                    const wordElement = document.createElement('div');
                    const displayWord = item.features[6] || item.word;
                    wordElement.textContent = displayWord;
                    wordElement.classList.add('word');
                    wordElement.addEventListener('click', () => addToFlashcard(displayWord, item.word));
                    wordListElement.appendChild(wordElement);
                    displayedWords.add(item.word);
                }
            });
        }
    });
}

function addToFlashcard(displayWord, originalForm) {
    if (!wordList.some(item => item.word === displayWord)) {
        wordList.push({ word: displayWord, definition: '' });
        saveWordList();
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
            wordList = [];
            saveWordList();
            updateFlashcardDisplay(wordList);
        }
    });
}

document.querySelector('#generateAnkiBtn').addEventListener('click', generateAnkiDeck);

chrome.runtime.sendMessage({action: "getWordList"}, response => {
    updateFlashcardDisplay(response.wordList);
});