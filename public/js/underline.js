const home = document.querySelector('.home');
const aboutUs = document.querySelector('.aboutUs');
const howToUse = document.querySelector('.howToUse');
const underlineContainer = document.querySelector('.underline');
const underlineBox = document.querySelector('.underline-box');

const width = [
  0,
  aboutUs.getBoundingClientRect().left - home.getBoundingClientRect().left,
  howToUse.getBoundingClientRect().left - home.getBoundingClientRect().left,
];

class underline {
  render(nav, i) {
    underlineContainer.style.transform = `translateX(${width[i]}px)`;
    underlineContainer.style.width = `${
      Number.parseFloat(getComputedStyle(nav).width, 10) -
      Number.parseFloat(getComputedStyle(nav)['margin-left'], 10) -
      Number.parseFloat(getComputedStyle(nav)['margin-right'], 10)
    }px`;
    nav.style = 'font-weight: bold';
    underlineContainer.style.width = `${
      Number.parseFloat(getComputedStyle(nav).width, 10) -
      Number.parseFloat(getComputedStyle(nav)['margin-left'], 10) -
      Number.parseFloat(getComputedStyle(nav)['margin-right'], 10)
    }px`;
  }
}
export default new underline();
