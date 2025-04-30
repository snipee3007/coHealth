class UserSetting {
  constructor() {
    this.#userSettingToolbarHandle();
  }

  #userSettingToolbarHandle() {
    const pathname = window.location.pathname.split('/')[1];
    if (pathname == 'healthHistory') {
      document
        .querySelector('.healthHistory p')
        .classList.add('activeUserSettings');
      document.querySelector('.healthHistory img').src = document
        .querySelector('.healthHistory img')
        .src.replace('inactive', 'active');
    } else if (pathname == 'profile') {
      document.querySelector('.profile p').classList.add('activeUserSettings');
      document.querySelector('.profile img').src = document
        .querySelector('.profile img')
        .src.replace('inactive', 'active');
    } else if (pathname == 'appointment') {
      document
        .querySelector('.appointment p')
        .classList.add('activeUserSettings');
      document
        .querySelector('.appointment p')
        .classList.add('activeUserSettings');
      document.querySelector('.appointment img').src = document
        .querySelector('.appointment img')
        .src.replace('inactive', 'active');
    }
  }
}

new UserSetting();
