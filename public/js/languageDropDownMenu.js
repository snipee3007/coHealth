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
  if (arrow.classList.contains('down')) {
    spinArrow();
    languageContent.textContent =
      language.dataset.language[0].toUpperCase() +
      language.dataset.language.slice(1);
    dropdownContent.style.opacity = 1;
  } else {
    spinArrow();
    languageContent.textContent =
      language.dataset.language[0].toUpperCase() +
      language.dataset.language.slice(1);
    dropdownContent.style.opacity = 0;
  }
};
export default function () {
  language.addEventListener('click', renderLanguage);

  dropdownContent.addEventListener('click', function (e) {
    if (e.target.closest('.language-item')) {
      const type = e.target.closest('.language-item').dataset.language;
      language.dataset.language = type;
    }
  });
}
