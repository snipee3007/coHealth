const language = document.querySelector('.language');
const languageContent = document.querySelector('.language-content');
const arrow = document.querySelector('.arrow');
const dropdownContent = document.querySelector('.dropdown-content');

const spinArrow = function () {
  if (arrow.classList.contains('down')) {
    arrow.style.transform = 'rotate(180deg)';
  } else {
    arrow.style.transform = 'rotate(0deg)';
  }
  arrow.classList.toggle('down');
};

const renderLanguage = function () {
  dropdownContent.style.opacity = arrow.classList.contains('down') ? 1 : 0;
  if (dropdownContent.style.opacity === '0') {
    const languageItem = document.querySelectorAll('.language-item');
    languageItem.forEach((item) => (item.style.cursor = 'default'));
  }
  if (dropdownContent.style.opacity === '1') {
    const languageItem = document.querySelectorAll('.language-item');
    languageItem.forEach((item) => (item.style.cursor = 'pointer'));
  }
  spinArrow();
  languageContent.textContent =
    language.dataset.language[0].toUpperCase() +
    language.dataset.language.slice(1);
};

const languageController = async function () {
  language.addEventListener('click', renderLanguage);

  dropdownContent.addEventListener('click', function (e) {
    if (e.target.closest('.language-item')) {
      const type = e.target.closest('.language-item').dataset.language;
      language.dataset.language = type;
    }
  });
};

export default languageController;
