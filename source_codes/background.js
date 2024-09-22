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
    .then(response => {
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      return response.text().then(text => {
        console.log("Raw response:", text);
        return text ? JSON.parse(text) : {};
      });
    })
    .then(data => {
      console.log("Parsed data:", data);
      if (data.error) {
        throw new Error(data.error);
      }
      sendResponse({result: data.result});
    })
    .catch(error => {
      console.error("Fetch error:", error);
      if (error instanceof TypeError) {
        console.error("Network error:", error.message);
      } else if (error instanceof SyntaxError) {
        console.error("JSON parsing error:", error.message);
      }
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
});