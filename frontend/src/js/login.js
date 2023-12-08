class Login {
  async login() {
    const loginForm = document.querySelector('.loginForm');

    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const inputs = loginForm.querySelectorAll('input');
      let email, password, rememberMe;
      inputs.forEach((element, i) => {
        if (element.name === 'email') {
          email = element.value;
        } else if (element.name === 'password') {
          password = element.value;
        } else if (element.name === 'rememberMe') {
          rememberMe = element.value;
        }
      });
      const token = await fetch('users/login', {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
      })
        .then((data) => data.json())
        .then((data) => data)
        .catch((err) => {
          console.log('This is a error', err);
        });
      if (token) {
        localStorage.setItem('token', token.token);
      }
      window.location.href = '/home';
    });
  }
}

export default new Login();
