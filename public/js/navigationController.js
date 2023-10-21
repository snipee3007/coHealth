import underline from './underline.js';

const nav_items = Array.from(document.querySelectorAll('.nav-item'));

let currentActive = nav_items[0];

class Navigation {
  items = nav_items;
  updateClick() {
    this.items.forEach((nav, i) =>
      nav.addEventListener('click', function () {
        currentActive.style = 'font-weight: normal'; //Previous currentActive
        currentActive = nav; //Change to real currrentActive
        currentActive.style = 'font-weight: bold';
        underline.render();
      })
    );
  }
}

export default new Navigation();
export { currentActive };
