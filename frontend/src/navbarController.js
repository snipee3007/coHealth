class Navbar {
  constructor() {
    this.#init();
    this.#active();
    this.#toggleNotification();
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
    } else if (window.location.pathname === '/findHospital') {
      document
        .querySelector('.tools')
        .querySelector('.nav_links')
        .classList.add('active');
    } else if (
      window.location.pathname.includes('/appointment') ||
      window.location.pathname.includes('/doctor')
    ) {
      document
        .querySelector('.tools')
        .querySelector('.nav_links')
        .classList.add('active');
    }
  }
  #toggleNotification() {
    const notificationButton = document.querySelector('.notificationButton');
    notificationButton?.addEventListener('click', function (e) {
      if (e.target.closest('.notificationButton')) {
        const notificationContainer = document.querySelector(
          '.notificationsContainer'
        );
        notificationContainer.classList.toggle('pointer-events-none');
        notificationContainer.classList.toggle('opacity-0');
      }
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.notifications')) {
        const notificationContainer = document.querySelector(
          '.notificationsContainer'
        );
        notificationContainer?.classList.add(
          'pointer-events-none',
          'opacity-0'
        );
      }
    });
  }
}

new Navbar();
