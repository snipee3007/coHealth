class signup {
  async signup() {
    const signUpForm = document.querySelector('.signupForm');

    signUpForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const inputs = signUpForm.querySelectorAll('input');
      let email,
        password,
        confirmPassword,
        gender,
        birthdate,
        firstName,
        lastName,
        image;
      inputs.forEach((element, i) => {
        if (element.name === 'email') {
          email = element.value;
        } else if (element.name === 'password') {
          password = element.value;
        } else if (element.name === 'gender') {
          gender = element.value;
        } else if (element.name === 'birthdate') {
          birthdate = element.value;
        } else if (element.name === 'firstName') {
          firstName = element.value;
        } else if (element.name === 'lastName') {
          lastName = element.value;
        } else if (element.name === 'confirmPassword') {
          confirmPassword = element.value;
        } else if (element.name === 'image') {
          image = element.value;
        }
      });
      const token = await fetch('users/signup', {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          gender,
          birthdate,
          firstName,
          lastName,
          confirmPassword,
          image,
        }),
      })
        .then((data) => data.json())
        .then((data) => data)
        .catch((err) => {
          console.log('This is a error', err);
        });
      window.location.href = '/home';
    });
  }
}

export default new signup();
