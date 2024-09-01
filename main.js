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

// Generate機能の実装
const generateBtn = document.querySelector('#generateBtn');
const originalArea = document.querySelector('#originalArea pre');
const generatedArea = document.querySelector('#generatedArea pre');

generateBtn.addEventListener('click', () => {
  const text = pasteArea.value;
  originalArea.textContent = text;
  
  // バックグラウンドスクリプトを介してMeCab解析のためのAPI呼び出し
  chrome.runtime.sendMessage({ action: 'analyze', text: text }, response => {
    if (response.error) {
      console.error('Error:', response.error);
      generatedArea.textContent = 'Error occurred during analysis';
    } else {
      generatedArea.textContent = response.result;
    }
  });

  generateBtn.innerHTML = 'Generated';
  setTimeout(() => {
    generateBtn.innerHTML = 'Generate';
  }, 1000);
});

// ウェブサイトのコンテンツをリサイズ
function resizeWebContent() {
  document.body.style.width = 'calc(100% - 150px)';
}

// ページロード時とリサイズ時にコンテンツを調整
window.addEventListener('load', resizeWebContent);
window.addEventListener('resize', resizeWebContent);