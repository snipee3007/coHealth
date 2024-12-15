class Navbar {
  init() {
    const toolsButton = document.querySelector('.tools');
    const toolbarContainer = document.querySelector('toolbarContainer');
    toolsButton.addEventListener('mouseover', function () {
      console.log('Hello');
      document.querySelector('.toolbarContainer').classList.remove('unshown');
      document
        .querySelector('.toolbarContainer')
        .classList.add('pointer-events-auto');
      document
        .querySelector('.toolbarContainer')
        .classList.remove('pointer-events-none');
    });
    toolsButton.addEventListener('mouseout', function () {
      document.querySelector('.toolbarContainer').classList.add('unshown');
      document
        .querySelector('.toolbarContainer')
        .classList.remove('pointer-events-auto');
      document
        .querySelector('.toolbarContainer')
        .classList.add('pointer-events-none');
    });
  }
}

export default new Navbar();
