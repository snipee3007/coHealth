import { renderPopup } from './utils/popup.js';

const editProfile = async function (data) {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/user',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data,
    });
    if (res.data.status == 'success') {
      renderPopup(
        res.status,
        'Update profile',
        'Your profile has been updated!',
        'reload'
      );
    }
  } catch (err) {
    renderPopup(
      err.response.status,
      'Update profile',
      err.responee.data.message
    );
  }
};

const signOut = async function () {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/signOut',
    });
    if (res.data == '') {
      renderPopup(
        res.status,
        'Sign Out',
        'You will be redirected to home page!',
        '/'
      );
    }
  } catch (err) {
    renderPopup(err.response.status, 'Sign Out', err.response.data.message);
  }
};

class Profile {
  #data;
  constructor() {
    this.#init();
  }
  #init() {
    this.#initData();
    this.#signOutButton();
    this.#submitForm();
    this.#numberOnlyField();
    this.#inputChange();
  }
  #initData() {
    const fullname = document.querySelector('.fullname input').value;
    const gender = document.querySelector('.gender select').value;
    const address = document.querySelector('.address input').value;
    const yearOfBirth = document.querySelector('.yearOfBirth input').value;
    const email = document.querySelector('.email input').value;
    const phoneNumber = document.querySelector('.phoneNumber input').value;
    const profileImage = document
      .querySelector('.profileImage input')
      .value.split('\\')
      .pop()
      .split('/')
      .pop();
    this.#data = {
      fullname: { value: fullname, isChanged: false },
      gender: { value: gender, isChanged: false },
      address: { value: address, isChanged: false },
      yearOfBirth: { value: yearOfBirth, isChanged: false },
      email: { value: email, isChanged: false },
      phoneNumber: { value: phoneNumber, isChanged: false },
      userProfile: { value: profileImage, isChanged: false },
      totalChanged: 0,
    };
  }

  #signOutButton() {
    const signOutButton = document.querySelector('.signOut');
    signOutButton.addEventListener('click', function (e) {
      if (e.target.closest('.signOut')) {
        signOut();
      }
    });
  }

  #numberOnlyField() {
    const numberOnlyFields = document.querySelectorAll('.numberOnly');

    numberOnlyFields.forEach((field) => {
      field.addEventListener('input', function (e) {
        if (e.data !== null) {
          const numberRegex = /^[\+\-]?\d+?$/;
          if (!e.target.value.match(numberRegex)) {
            e.target.value = e.target.value.slice(0, -1);
          }
        }
      });

      ['input', 'focusout'].forEach((event) => {
        field.addEventListener(event, function (e) {
          if (
            e.target.value.length !== 0 &&
            isNaN(parseFloat(e.target.value))
          ) {
            e.target.setCustomValidity(
              'Wrong number input format! Please input again!'
            );
          } else if (
            (e.target.closest('.yearOfBirth') &&
              parseFloat(e.target.value) > 9999) ||
            parseFloat(e.target.value) <= 0
          ) {
            e.target.setCustomValidity(
              'The input digits must below 5 digits! Please input again!'
            );
          } else if (
            e.target.closest('.phoneNumber') &&
            e.target.value.length > 16
          ) {
            e.target.setCustomValidity(
              'The input digits must between 0 and 16 digits! Please input again!'
            );
          } else {
            e.target.setCustomValidity('');
          }
        });
      });
    });
  }

  #inputChange() {
    const inputFields = document.querySelectorAll('.formInput');

    inputFields.forEach(
      ((field) =>
        field.addEventListener(
          'input',
          function () {
            let checkField = field.value;
            if (field.name == 'userProfile') {
              checkField = field.value.split('\\').pop().split('/').pop();
            }
            if (field.name == 'email') {
              field.classList.add('inputCheck');
            }
            if (
              checkField !== this.#data[field.name].value &&
              !this.#data[field.name].isChanged
            ) {
              ++this.#data.totalChanged;
              this.#data[field.name].isChanged = true;
            } else if (
              checkField === this.#data[field.name].value &&
              this.#data[field.name].isChanged
            ) {
              --this.#data.totalChanged;
              this.#data[field.name].isChanged = false;
            }

            if (this.#data.totalChanged > 0) {
              document.querySelector('.editProfile').disabled = false;
            } else {
              document.querySelector('.editProfile').disabled = true;
            }
          }.bind(this)
        )).bind(this)
    );
  }

  #submitForm() {
    const submitForm = document.querySelector('form');
    this.#profilePicture();

    submitForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const fullname = document.querySelector('.fullname input').value;
      const gender = document.querySelector('.gender select').value;
      const address = document.querySelector('.address input').value;
      const yearOfBirth = document.querySelector('.yearOfBirth input').value;
      const email = document.querySelector('.email input').value;
      const phoneNumber = document.querySelector('.phoneNumber input').value;
      const profileImage = document
        .querySelector('.profileImage input')
        .value.split('\\')
        .pop()
        .split('/')
        .pop();
      const files = document.querySelector('.profileImage input').files;
      const data = {
        fullname,
        gender,
        address,
        yearOfBirth,
        email,
        phoneNumber,
        profileImage,
        userProfile: files[0],
      };

      editProfile(data, files);
    });
  }

  #profilePicture() {
    const profile = document.querySelector('#userProfile');

    profile.addEventListener('change', function (e) {
      if (e.target.files[0]) {
        const previewProfile = document.getElementById('profile');
        previewProfile.src = URL.createObjectURL(e.target.files[0]);
        previewProfile.onload = function () {
          URL.revokeObjectURL(previewProfile.src);
        };
      }
    });
  }
}

new Profile();
