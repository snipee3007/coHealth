const signIn = async function (data) {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/signIn',
      data,
    });
    if (res.data.status == 'success') {
      alert('Sign In successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 500);
    }
  } catch (err) {
    console.log(err);
    alert(err.response.data.message);
  }
};

class SignIn {
  constructor() {
    this.#signIn();
    this.#togglePassword();
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
