import Loader from './utils/loader.js';
import { renderPopup } from './utils/popup.js';

class ForgotPassword {
  constructor() {
    this.#forgotPassword();
    this.#deleteIcon();
  }
  #deleteIcon() {
    document
      .querySelector('.deleteValue')
      .addEventListener('click', function (e) {
        if (e.target.closest('.deleteValue')) {
          document.querySelector('input#email').value = '';
        }
      });
  }
  #forgotPassword() {
    const form = document.querySelector('form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.querySelector('input[name="forgotEmail"]');
      // console.log(email);
      if (email.value) {
        forgotPassword({ email: email.value });
      }
    });
  }
}

const forgotPassword = async function (data) {
  try {
    Loader.create();
    const res = await axios({
      method: 'post',
      url: 'api/user/forgotPassword',
      data,
    });
    if (res.data.status == 'success') {
      renderPopup(
        res.status,
        'Send reset email',
        'Reset password email has been sent! Check your inbox or spam to reset your account password!'
      );
    }
    Loader.destroy();
  } catch (err) {
    Loader.destroy();
    renderPopup(
      err.response.status,
      'Send reset email',
      err.response.data.message
    );
  }
};

new ForgotPassword();
