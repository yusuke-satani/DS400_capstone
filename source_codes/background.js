let wordList = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received request:", request);
  
  if (request.action === "analyze") {
    fetch('http://127.0.0.1:5000/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: request.text }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        throw new Error(data.error);
      }
      sendResponse({result: data.result});
    })
    .catch(error => {
      console.error("Fetch error:", error);
      sendResponse({error: error.toString()});
    });
    return true;  // Will respond asynchronously
  }
  
  else if (request.action === "filterWords") {
    fetch('http://127.0.0.1:5000/filter_words', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ words: request.words }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        throw new Error(data.error);
      }
      sendResponse({filteredWords: data.filtered_words});
    })
    .catch(error => {
      console.error("Fetch error:", error);
      sendResponse({error: error.toString()});
    });
    return true;
  } 
  
  else if (request.action === "addWord") {
    if (!wordList.includes(request.word)) {
      wordList.push(request.word);
      sendResponse({success: true, wordList: wordList});
    } else {
      sendResponse({success: false, message: "Word already exists"});
    }
    return true;
  } 
  
  else if (request.action === "getWordList") {
    sendResponse({wordList: wordList});
    return true;
  }
  
  else if (request.action === "getDefinition") {
    fetch('http://127.0.0.1:5000/get_definition', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ word: request.word }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        throw new Error(data.error);
      }
      sendResponse({ definition: data.definition });
    })
    .catch(error => {
      console.error('Error:', error);
      sendResponse({ error: 'Failed to get definition' });
    });
    return true;  // Will respond asynchronously
  }
  
  else if (request.action === "removeWord") {
    const index = wordList.indexOf(request.word);
    if (index > -1) {
      wordList.splice(index, 1);
      sendResponse({success: true, wordList: wordList});
    } else {
      sendResponse({success: false, message: "Word not found"});
    }
    return true;
  }
  
  else if (request.action === "generateAnki") {
    fetch('http://127.0.0.1:5000/generate_anki', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ flashcards: request.flashcards }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.arrayBuffer();
    })
    .then(arrayBuffer => {
      const base64 = btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));
      const dataUrl = `data:application/octet-stream;base64,${base64}`;
      chrome.downloads.download({
        url: dataUrl,
        filename: 'output.apkg',
        saveAs: false // This will save the file directly to the default Downloads folder
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          sendResponse({error: chrome.runtime.lastError.message});
        } else {
          sendResponse({success: true, downloadId: downloadId});
        }
      });
    })
    .catch(error => {
      console.error('Error:', error);
      sendResponse({error: error.toString()});
    });
    return true; // Indicates that the response is sent asynchronously
  }
  
  else if (request.action === "translate") {
    fetch('http://127.0.0.1:5000/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: request.text, level: request.level }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        throw new Error(data.error);
      }
      sendResponse({translatedText: data.translated_text});
    })
    .catch(error => {
      console.error("Fetch error:", error);
      sendResponse({error: error.toString()});
    });
    return true;  // Will respond asynchronously
  }
  
  return false;  // Will not respond
});