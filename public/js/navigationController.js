import underline from './underline.js';

const home = document.querySelector('.home');
const aboutUs = document.querySelector('.aboutUs');
const howToUse = document.querySelector('.howToUse');

let currentActive = home;

class Navigation {
  items = [home, aboutUs, howToUse];
  updateClick() {
    this.items.forEach((nav, i) =>
      nav.addEventListener('click', function () {
        underline.render(nav, i);

        currentActive.style = 'font-weight: normal';
        currentActive = nav;
        nav.style = 'font-weight: bold';
      })
    );
  }
}

export default new Navigation();
export { currentActive };
