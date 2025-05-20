import { renderPopup } from './utils/popup.js';
import Loader from './utils/loader.js';

class ChangePassword {
  constructor() {
    this.#changePassword();
  }

  #changePassword() {
    document
      .querySelector('.changePasswordForm')
      .addEventListener('submit', function (e) {
        e.preventDefault();
        const oldPassword = document.querySelector(
          'input[name="oldPassword"]'
        )?.value;
        const password = document.querySelector(
          'input[name="password"]'
        )?.value;
        const confirmPassword = document.querySelector(
          'input[name="confirmPassword"]'
        )?.value;
        changePassword({ password, confirmPassword, oldPassword });
      });
  }
}

// HELPER FUNCTION
const changePassword = async function (data) {
  try {
    Loader.create();
    const res = await axios({
      method: 'patch',
      url: `/api/user`,
      data,
    });
    if (res.data.status == 'success') {
      renderPopup(
        res.status,
        'Change password',
        'Change password successful! Now you will be redirected to home page!',
        '/'
      );
      Loader.destroy();
    }
  } catch (err) {
    console.log(err);
    Loader.destroy();
    renderPopup(
      err.response.status,
      'Change password',
      err.response.data.message
    );
  }
};

// Create class
new ChangePassword();
