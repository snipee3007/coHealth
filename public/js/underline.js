const nav_links = Array.from(document.querySelectorAll('.nav_links'));

class Underline {
  index;
  preIndex;
  updateClass(nav) {
    nav.classList.toggle('active');
    nav
      .closest('.nav-item')
      .querySelector('.underline-box')
      .classList.toggle('hidden');
  }
  updateHidden() {
    this.index = localStorage.getItem('currentActive') || 0;
    this.updateClass(nav_links[this.index]);
  }
  setLocalStorage(num) {
    localStorage.setItem('currentActive', num || 0);
  }
  getPath() {
    const path = window.location.pathname;
    let index;
    if (path.includes('/home') || path === '/')
      index = nav_links.findIndex((nav_link) => nav_link.innerHTML === 'Home');
    if (path.includes('/aboutUs'))
      index = nav_links.findIndex(
        (nav_link) => nav_link.innerHTML === 'About Us'
      );
    if (path.includes('/news'))
      index = nav_links.findIndex((nav_link) => nav_link.innerHTML === 'News');
    if (path.includes('/calculateBMI'))
      index = nav_links.findIndex(
        (nav_link) => nav_link.innerHTML === 'Calculate BMI'
      );
    if (path.includes('/findHospital'))
      index = nav_links.findIndex(
        (nav_link) => nav_link.innerHTML === 'Find Hospital'
      );
    this.index = index;
    return index;
  }
  async run() {
    // console.log(window.location.pathname);
    // console.log(nav_links);
    this.setLocalStorage(this.getPath());

    // this.setLocalStorage(this.getIndex());

    this.updateHidden();
  }
}
// console.log(localStorage.getItem('currentActive'));
export default new Underline();
