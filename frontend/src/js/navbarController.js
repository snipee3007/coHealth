class Navbar {
  constructor() {
    this.#init();
    this.#active();
  }

  #init() {
    const toolsButton = document.querySelector('.tools');
    toolsButton.addEventListener('mouseover', function () {
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

  #active() {
    if (
      window.location.pathname === '/home' ||
      window.location.pathname === '/'
    ) {
      document
        .querySelector('.home')
        .querySelector('a')
        .classList.add('active');
    } else if (window.location.pathname === '/news') {
      document
        .querySelector('.news')
        .querySelector('a')
        .classList.add('active');
    } else if (window.location.pathname === '/aboutUs') {
      document
        .querySelector('.aboutUs')
        .querySelector('a')
        .classList.add('active');
    } else if (
      window.location.pathname === '/signIn' ||
      window.location.pathname === '/signUp'
    ) {
      document
        .querySelector('.auth')
        .querySelector('a')
        .classList.add('active');
    } else if (
      window.location.pathname === '/findHospital' 
    ) {
      document
        .querySelector('.tools')
        .querySelector('.nav_links')
        .classList.add('active');
    }  
    else if (window.location.pathname.includes('/result')) {
    }
  }
}

export default Navbar;
