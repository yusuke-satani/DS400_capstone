chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyze") {
    fetch('http://localhost:5000/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: request.text }),
    })
    .then(response => response.json())
    .then(data => {
      sendResponse({result: data.result});
    })
    .catch(error => {
      sendResponse({error: error.toString()});
    });
    return true;  // Will respond asynchronously
  }
});