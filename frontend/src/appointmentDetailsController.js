import { renderPopup } from './utils/popup.js';
import Loader from './utils/loader.js';
const updateStatusAppointment = async function (appointmentCode, status) {
  try {
    Loader.create();
    const res = await axios({
      method: 'update',
      url: '/api/appointment',
      data: {
        appointmentCode,
        status,
      },
    });
    if (res.data.status == 'success') {
      Loader.destroy();
    }
  } catch (err) {
    Loader.destroy();
  }
};

const sendAcceptedEmail = async function (data) {
  try {
    // console.log(data);
    Loader.create();
    const res = await axios({
      method: 'POST',
      url: '/api/appointment/sendEmail',
      data,
    });
    if (res.data.status == 'success') {
      Loader.destroy();
      renderPopup(
        res.status,
        'Confirm and send email',
        'The appointment has been confirmed and send the confirm email to client!',
        '/appointment/list'
      );
    }
  } catch (err) {
    renderPopup(
      err.response.status,
      'Confirm and send email',
      err.response.data.message
    );
    Loader.destroy();
  }
};

class AppointmentDetails {
  constructor() {
    this.#changeColorSetting();
    this.#togglePopUp();
    this.#submitChange();
  }

  #changeColorSetting() {
    document.querySelector('a.appointment p').classList.add('text-[#4461F2]');
    document.querySelector('a.profile p').classList.remove('text-[#4461F2]');
    document.querySelector('a.appointment img').src =
      '/images/png/calendar-active.png';
    document.querySelector('a.profile img').src =
      '/images/png/icon-inactive.png';
  }

  #togglePopUp() {
    document.querySelector('#statusList')?.addEventListener('change', () => {
      document.querySelector('#popupOverlay').classList.remove('hidden');
    });
    document.querySelector('#cancelBtn').addEventListener('click', () => {
      document.querySelector('#popupOverlay').classList.add('hidden');
      document.querySelector('#statusList').value = '';
    });
  }

  #submitChange() {
    document
      .querySelector('#confirmBtn')
      .addEventListener('click', async (e) => {
        e.preventDefault();
        e.target.closest('#popupOverlay').classList.add('hidden');
        const value = document.querySelector('#statusList').value;
        const appointmentCode = window.location.pathname.split('/')[3];
        updateStatusAppointment(appointmentCode, value);
        let fullname = document.querySelector('.fullname p').textContent;
        let date = document.querySelector('.date p').textContent;
        let time = document.querySelector('.time p').textContent;
        let email = document.querySelector('.email p').textContent;
        let objAppointment = {
          fullname: fullname,
          date: date,
          time: time,
          email: email,
          status: value,
        };
        // console.log(objAppointment.status);
        sendAcceptedEmail(objAppointment);
      });
  }
}

new AppointmentDetails();
