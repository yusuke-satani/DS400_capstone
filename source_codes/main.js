// 拡張機能の表示領域を作成
const extensionDiv = document.createElement('div');
extensionDiv.id = 'twitter-template-extension';
extensionDiv.innerHTML = `
  <div id="copyRangeHashTag">
    <button id="copyBtnTwitterTemp">Copy</button>
    <pre>
#webデザイナー
#web制作
#駆け出しエンジニア
    </pre>
  </div>
  <textarea id="pasteArea" placeholder="ここにペーストしてください"></textarea>
  <button id="generateBtn">Generate</button>
  <div id="originalArea" class="resultArea">
    <h4>Original</h4>
    <pre></pre>
  </div>
  <div id="generatedArea" class="resultArea">
    <h4>Generated</h4>
    <pre></pre>
  </div>
`;
document.body.appendChild(extensionDiv);

// コピー機能の実装
const copyBtnTwitterTemp = document.querySelector('#copyBtnTwitterTemp');
copyBtnTwitterTemp.addEventListener('click', copyOriginalHashTag);

function copyOriginalHashTag() {
  const copyRangePre = document.querySelector('#copyRangeHashTag > pre');
  navigator.clipboard.writeText(copyRangePre.textContent.trim());
  copyBtnTwitterTemp.innerHTML = 'Copied';
  setTimeout(() => {
    copyBtnTwitterTemp.innerHTML = 'Copy';
  }, 1000);
}

// ペースト機能の実装
const pasteArea = document.querySelector('#pasteArea');
pasteArea.addEventListener('paste', (event) => {
  event.preventDefault();
  const text = event.clipboardData.getData('text/plain');
  pasteArea.value = text;
});


const generateBtn = document.querySelector('#generateBtn');
const originalArea = document.querySelector('#originalArea pre');
const generatedArea = document.querySelector('#generatedArea pre');

generateBtn.addEventListener('click', () => {
  const text = pasteArea.value;
  originalArea.textContent = text;
  
  // MeCab解析のためのAPI呼び出し
  fetch('http://localhost:5000/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: text }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    generatedArea.textContent = data.result;
  })
  .catch(error => {
    console.error('Error:', error);
    generatedArea.textContent = 'Error occurred during analysis';
  });

  generateBtn.innerHTML = 'Generated';
  setTimeout(() => {
    generateBtn.innerHTML = 'Generate';
  }, 1000);
});


function resizeWebContent() {
  document.body.style.width = 'calc(100% - 150px)';
}

window.addEventListener('load', resizeWebContent);
window.addEventListener('resize', resizeWebContent);