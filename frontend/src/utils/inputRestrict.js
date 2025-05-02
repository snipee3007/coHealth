// REGEX
const specialCharWithExecptionRegex = '[\\[\\]\\\\{}$&+=@#|_<>^*%`~]';
const allNotCharAndNumberRegex = '[!-\\/:-@[-`{-~]';
const numberRegex = '[^0-9]';
const charOnlyRegex = '[^A-Za-z]';
const restrictFunction = (inputField, regex) => {
  ['input', 'paste'].forEach((event) => {
    inputField.addEventListener(event, function (e) {
      if (inputField.value) {
        if (e.data && e.data.match(new RegExp(regex))) {
          e.preventDefault();
          inputField.value = inputField.value.slice(0, -1);
        } else if (event == 'paste') {
          let paste = (e.clipboardData || window.clipboardData).getData('text');
          e.preventDefault();
          inputField.value =
            inputField.value + paste.replace(new RegExp(regex, 'g'), '');
        }
      } else if (e.data && e.data.match(new RegExp(regex))) {
        e.preventDefault();
        inputField.textContent = inputField.textContent.slice(0, -1);
        setCadetLast(inputField);
      } else if (event == 'paste') {
        let paste = (e.clipboardData || window.clipboardData).getData('text');
        e.preventDefault();
        inputField.textContent =
          inputField.textContent + paste.replace(new RegExp(regex, 'g'), '');
        setCadetLast(inputField);
      }
    });
  });
};

const noSpecialChar = function (inputField) {
  restrictFunction(inputField, specialCharWithExecptionRegex);
};

const charAndNumberOnly = function (inputField) {
  restrictFunction(inputField, allNotCharAndNumberRegex);
};

const numberOnly = function (inputField) {
  restrictFunction(inputField, numberRegex);
};

const charOnly = function (inputField) {
  restrictFunction(inputField, charOnlyRegex);
};

// HELPER FUNCTION
const setCadetLast = function (inputField) {
  const range = document.createRange();
  const selection = window.getSelection();
  range.setStart(inputField, inputField.childNodes.length);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
};

export { noSpecialChar, charAndNumberOnly, numberOnly, charOnly };
