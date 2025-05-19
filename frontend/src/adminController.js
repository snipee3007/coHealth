import { renderPopup, renderAlert } from './utils/popup.js';
import Loader from './utils/loader.js';
import { charAndNumberOnly, numberOnly } from './utils/inputRestrict.js';

class Admin {
  constructor() {
    this.#deleteDoctor();
    this.#deleteUser();
    this.#deleteHospital();
    this.#deleteNews();
    this.#addHospital();
    this.#addDoctor();
  }

  #deleteDoctor() {
    const deleteDoctorsButton = document.querySelectorAll('.deleteDoctor');
    deleteDoctorsButton.forEach((button) => {
      button.addEventListener(
        'click',
        async function (e) {
          const response = await renderAlert(
            `Do you want to delete ${
              e.target.closest('.doctorItem').dataset['fullname']
            }`
          );
          if (response) {
            deleteDoctor(e.target.closest('.doctorItem').dataset['slug']);
          }
        }.bind(this)
      );
    });
  }

  #deleteUser() {
    const deleteUserButton = document.querySelectorAll('.deleteUser');
    deleteUserButton.forEach((button) => {
      button.addEventListener(
        'click',
        async function (e) {
          const response = await renderAlert(
            `Do you want to delete ${
              e.target.closest('.userItem').dataset['fullname']
            }`
          );
          if (response) {
            deleteUser(e.target.closest('.userItem').dataset['slug']);
          }
        }.bind(this)
      );
    });
  }

  #deleteHospital() {
    const deleteHospitalButton = document.querySelectorAll('.deleteHospital');
    deleteHospitalButton.forEach((button) => {
      button.addEventListener(
        'click',
        async function (e) {
          const response = await renderAlert(
            `Do you want to delete ${
              e.target.closest('.hospitalItem').dataset['name']
            }`
          );
          if (response) {
            deleteHospital(e.target.closest('.hospitalItem').dataset['slug']);
          }
        }.bind(this)
      );
    });
  }
  #deleteNews() {
    const deleteNewsButton = document.querySelectorAll('.deleteNews');
    deleteNewsButton.forEach((button) => {
      button.addEventListener(
        'click',
        async function (e) {
          const response = await renderAlert(
            `Do you want to delete ${
              e.target.closest('.newsListItem').dataset['title']
            }`
          );
          if (response) {
            deleteNews(e.target.closest('.newsListItem').dataset['slug']);
          }
        }.bind(this)
      );
    });
  }
  #addDoctor() {
    document
      .querySelector('.addDoctorButton')
      .addEventListener('click', function (e) {
        if (e.target.closest('.addDoctorButton')) {
          e.target.closest('.addDoctorButton').classList.add('hidden');
          document.querySelector('form.doctorForm').classList.remove('hidden');
        }
      });

    const fullname = document.querySelector(
      '.doctorForm input[name="fullname"]'
    );
    const phoneNumber = document.querySelector(
      '.doctorForm input[name="phoneNumber"]'
    );
    charAndNumberOnly(fullname);
    numberOnly(phoneNumber);
    document
      .querySelector('form.doctorForm')
      .addEventListener('submit', function (e) {
        e.preventDefault();
        const fullname = document.querySelector('input[name="fullname"]').value;
        const email = document.querySelector('input[name="email"]').value;
        const gender = document.querySelector('select[name="gender"]').value;
        const phoneNumber = document.querySelector(
          'input[name="phoneNumber"]'
        ).value;
        const yearOfBirth = document.querySelector(
          'input[name="yearOfBirth"]'
        ).value;
        const major = document.querySelector('input[name="major"]').value;
        const workAt = document.querySelector('input[name="workAt"]').value;
        const yearEXP = document.querySelector('input[name="yearEXP"]').value;
        addDoctor({
          fullname,
          email,
          gender,
          phoneNumber,
          yearOfBirth,
          major,
          workAt,
          yearEXP,
          role: 'doctor',
        });
      });
  }

  #addHospital() {
    document
      .querySelector('.addHospitalButton')
      .addEventListener('click', function (e) {
        if (e.target.closest('.addHospitalButton')) {
          e.target.closest('.addHospitalButton').classList.add('hidden');
          document
            .querySelector('form.hospitalForm')
            .classList.remove('hidden');
        }
      });

    const name = document.querySelector('.hospitalForm input[name="name"]');
    const phone = document.querySelector('.hospitalForm input[name="phone"]');
    charAndNumberOnly(name);
    numberOnly(phone);

    document
      .querySelector('form.hospitalForm')
      .addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.querySelector('input[name="name"]').value;
        const image = document.querySelector('input[name="image"]').value;
        const address = document.querySelector('input[name="address"]').value;
        const web = document.querySelector('input[name="web"]').value;
        const phone = document.querySelector('input[name="phone"]').value;
        const latitude = document.querySelector('input[name="latitude"]').value;
        const longitude = document.querySelector(
          'input[name="longitude"]'
        ).value;
        addHospital({
          name,
          image,
          address,
          web,
          phone,
          coordinates: [longitude, latitude],
        });
      });
  }
}

const addDoctor = async function (data) {
  try {
    Loader.create();
    const res = await axios({
      method: 'post',
      url: `/api/doctor/`,
      data,
    });
    Loader.destroy();
    if (res.status == 200) {
      renderPopup(
        res.status,
        'Add doctor',
        'Add doctor to database successful!',
        'reload'
      );
    }
  } catch (err) {
    Loader.destroy();
    renderPopup(err.response.status, 'Add doctor', err.response.data.message);
  }
};

const deleteDoctor = async function (slug) {
  try {
    Loader.create();
    const res = await axios({
      method: 'DELETE',
      url: `/api/doctor/${slug}`,
    });
    Loader.destroy();
    if (res.status == 204) {
      renderPopup(
        res.status,
        'Delete doctor',
        'Delete doctor successful!',
        'reload'
      );
    }
  } catch (err) {
    Loader.destroy();
    renderPopup(err.response.status, 'Delete user', err.response.data.message);
  }
};

const deleteUser = async function (slug) {
  try {
    Loader.create();
    const res = await axios({
      method: 'DELETE',
      url: `/api/user/${slug}`,
    });
    Loader.destroy();
    if (res.status == 204) {
      renderPopup(
        res.status,
        'Delete user',
        'Delete user successful!',
        'reload'
      );
    }
  } catch (err) {
    Loader.destroy();
    renderPopup(err.response.status, 'Delete user', err.response.data.message);
  }
};

const addHospital = async function (data) {
  try {
    Loader.create();
    const res = await axios({
      method: 'post',
      url: '/api/hospital',
      data,
    });
    Loader.destroy();
    if (res.status == 200) {
      renderPopup(
        res.status,
        'Add Hospital',
        'Add hospital to database successful!',
        'reload'
      );
    }
  } catch (err) {
    Loader.destroy();
    renderPopup(err.response.status, 'Add Hospital', err.response.data.message);
  }
};

const deleteHospital = async function (id) {
  try {
    Loader.create();
    const res = await axios({
      method: 'delete',
      url: `/api/hospital/${id}`,
    });
    Loader.destroy();
    if (res.status == 204) {
      renderPopup(
        res.status,
        'Delete Hospital',
        'Delete hospital from database successful!',
        'reload'
      );
    }
  } catch (err) {
    Loader.destroy();
    renderPopup(
      err.response.status,
      'Delete Hospital',
      err.response.data.message
    );
  }
};

const deleteNews = async function (slug) {
  try {
    Loader.create();
    const res = await axios({
      method: 'delete',
      url: `/api/news/${slug}`,
    });
    Loader.destroy();
    if (res.status == 204) {
      renderPopup(
        res.status,
        'Delete News',
        'Delete news from database successful!',
        'reload'
      );
    }
  } catch (err) {
    Loader.destroy();
    renderPopup(err.response.status, 'Delete News', err.response.data.message);
  }
};

new Admin();
