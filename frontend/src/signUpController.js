import { renderPopup } from './utils/popup.js';
import Loader from './utils/loader.js';
const signUp = async function (data) {
  try {
    if (data.gender == 'male') {
      data.image = 'menAnonymous.jpg';
    } else {
      data.image = 'womanAnonymous.jpg';
    }
    Loader.create();
    const res = await axios({
      method: 'POST',
      url: '/api/signUp',
      data,
    });
    if (res.data.status == 'success') {
      Loader.destroy();
      renderPopup(
        res.status,
        'Sign Up',
        `Welcome aboard, ${data.fullname}`,
        '/'
      );
    }
  } catch (err) {
    Loader.destroy();
    renderPopup(err.response.status, 'Sign Up', err.response.data.message);
  }
};

class SignUp {
  constructor() {
    this.#signUp();
    this.#togglePasswordAndConfirmPassword();
    this.#handleYearOfBirthField();
    this.#handlePassword();
  }

  async #signUp() {
    document.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      const fullname = document.getElementById('fullname').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const yearOfBirth = document.getElementById('yearOfBirth').value;
      const gender = document.getElementById('gender').value;

      signUp({
        fullname,
        email,
        password,
        confirmPassword,
        yearOfBirth,
        gender,
      });
    });
  }

  #handlePassword() {
    const confirmPassword = document.getElementById('confirmPassword');
    const password = document.getElementById('password');

    [confirmPassword, password].forEach((field) =>
      field.addEventListener('input', function () {
        confirmPassword.value && password.value;
        confirmPassword.value !== password.value
          ? confirmPassword.setCustomValidity('Invalid field.')
          : confirmPassword.setCustomValidity('');
      })
    );
  }

  #handleYearOfBirthField() {
    const yearOfBirthInput = document.getElementById('yearOfBirth');

    yearOfBirthInput.addEventListener('input', function (e) {
      const regex = /^[0-9]+(e[0-9]*)?$/;
      if (!yearOfBirthInput.value.match(regex)) {
        yearOfBirthInput.value = yearOfBirthInput.value.slice(0, -1);
      }
      yearOfBirthInput.value.split('e')[1] === ''
        ? yearOfBirthInput.setCustomValidity('Invalid field.')
        : yearOfBirthInput.setCustomValidity('');
    });
  }

  #togglePasswordAndConfirmPassword() {
    const togglePasswordButton = document.querySelector('.togglePassword');
    const toggleConfirmPassword = document.querySelector(
      '.toggleConfirmPassword'
    );
    [togglePasswordButton, toggleConfirmPassword].forEach((button) => {
      button.addEventListener('click', function () {
        const field =
          button == togglePasswordButton
            ? document.querySelector('input[name="password"]')
            : document.querySelector('input[name="confirmPassword"]');
        field.type = field.type == 'password' ? 'text' : 'password';
        button.src =
          field.type == 'text'
            ? `./../images/png/eye-svgrepo-com.png`
            : './../images/png/eye-slash-svgrepo-com.png';
      });
    });
  }
}

new SignUp();
