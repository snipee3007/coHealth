import { renderPopup } from './utils/popup.js';
import Loader from './utils/loader.js';

class ResetPassword {
  constructor() {
    this.#resetPassword();
  }

  #resetPassword() {
    document
      .querySelector('.resetPasswordForm')
      .addEventListener('submit', function (e) {
        e.preventDefault();
        const password = document.querySelector(
          'input[name="password"]'
        )?.value;
        const confirmPassword = document.querySelector(
          'input[name="confirmPassword"]'
        )?.value;
        resetPassword({ password, confirmPassword });
      });
  }
}

// HELPER FUNCTION
const resetPassword = async function (data) {
  try {
    Loader.create();
    const res = await axios({
      method: 'post',
      url: `/api/user/resetPassword/${location.pathname.split('/')[2]}`,
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
    Loader.destroy();
    renderPopup(
      err.response.status,
      'Change password',
      err.response.data.message
    );
  }
};

// Create class
new ResetPassword();
