import dropdownMenu from './languageDropDownMenu.js';
import underline from './underline.js';

const home = document.querySelector('.home');
const aboutUs = document.querySelector('.aboutUs');
const howToUse = document.querySelector('.howToUse');
let currentActive = home;

[home, aboutUs, howToUse].forEach((nav, i) =>
  nav.addEventListener('click', function () {
    underline.render(nav, i);

    currentActive.style = 'font-weight: normal';
    currentActive = nav;
    nav.style = 'font-weight: bold';
  })
);

const init = function () {
  underline.render(currentActive);
  dropdownMenu();
};
init();
