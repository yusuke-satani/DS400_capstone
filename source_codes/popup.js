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
  
  chrome.runtime.sendMessage({action: "analyze", text: text}, response => {
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