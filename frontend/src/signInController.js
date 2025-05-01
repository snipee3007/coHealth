import { renderPopup } from './utils/popup.js';

const signIn = async function (data) {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/signIn',
      data,
    });
    if (res.data.status == 'success') {
      renderPopup(
        res.status,
        'Sign In',
        `Welcome back, ${res.data.data.user.fullname}`,
        '/'
      );
    }
  } catch (err) {
    renderPopup(err.response.status, 'Sign In', err.response.data.message);
  }
};

class SignIn {
  constructor() {
    this.#signIn();
    this.#deleteIcon();
    this.#togglePassword();
  }

  #deleteIcon() {
    document
      .querySelector('.deleteValue')
      .addEventListener('click', function (e) {
        if (e.target.closest('.deleteValue')) {
          document.querySelector('input#signInField').value = '';
        }
      });
  }

  #togglePassword() {
    const togglePasswordButton = document.querySelector('.togglePassword');
    togglePasswordButton.addEventListener('click', function () {
      const passwordField = document.querySelector('input[name="password"]');
      passwordField.type =
        passwordField.type == 'password' ? 'text' : 'password';
      togglePasswordButton.src =
        passwordField.type == 'text'
          ? `./../images/png/eye-svgrepo-com.png`
          : './../images/png/eye-slash-svgrepo-com.png';
    });
  }

  async #signIn() {
    const loginForm = document.querySelector('.loginForm');

    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const signInField = document.getElementById('signInField').value;
      const password = document.getElementById('password').value;
      signIn({ signInField, password });
    });
  }
}

new SignIn();
