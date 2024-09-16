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
});