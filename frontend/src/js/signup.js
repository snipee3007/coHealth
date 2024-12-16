const signUp = async function (data) {
  try {
    if (data.gender == 'male') {
      data.image = 'menAnonymous.jpg';
    } else {
      data.image = 'womanAnonymous.jpg';
    }
    const res = await axios({
      method: 'POST',
      url: '/users/signUp',
      data,
    });
    if (res.data.status == 'success') {
      alert('Sign Up successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    alert(err.response.data.message);
  }
};

class SignUp {
  async init() {
    await this.#signUp();
    this.#togglePasswordAndConfirmPassword();
    this.#handleYearOfBirthField();
    this.#handleConfirmPassword();
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

  #handleConfirmPassword() {
    const confirmPassword = document.getElementById('confirmPassword');
    confirmPassword.addEventListener('input', function () {
      confirmPassword.value !== document.getElementById('password').value
        ? confirmPassword.setCustomValidity('Invalid field.')
        : confirmPassword.setCustomValidity('');
    });
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

export default new SignUp();
