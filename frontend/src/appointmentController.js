import { renderPopup } from './utils/popup.js';
import Loader from './utils/loader.js';

const sendAppointment = async function (data) {
  try {
    // console.log(data);
    Loader.create();
    const res = await axios({
      method: 'POST',
      url: '/api/appointment',
      headers: {
        'Content-Type': 'application/json',
      },
      data,
    });
    if (res.data.status == 'success') {
      renderPopup(
        res.status,
        'Creating appointment',
        'Your appointment has been created! Please wait for the doctor checking it!',
        'reload'
      );
      Loader.destroy();
    }
  } catch (err) {
    renderPopup(
      err.response.status,
      'Creating appointment',
      err.response.data.message
    );
    Loader.destroy();
  }
};

function renderNotificationButtonDate() {
  const buttons = document.querySelectorAll('.timeButton');

  if (
    buttons.length ==
    Array.from(buttons).filter((button) => button.disabled == true).length
  ) {
    document.querySelector(
      '#listTime .notice'
    ).innerHTML = `No available time! Please choose another day.`;
    document.querySelector('#listTime .notice').classList.remove('hidden');
    document
      .querySelector('#listTime .timeButtonContainer')
      .classList.add('hidden');
  } else {
    document.querySelector('#listTime .notice').classList.add('hidden');
    document
      .querySelector('#listTime .timeButtonContainer')
      .classList.remove('hidden');
  }
}

function ableButtonDate(button) {
  button.classList.remove('cursor-not-allowed');
  button.classList.remove('opacity-20');
  button.classList.add('cursor-pointer');
  button.disabled = false;
  renderNotificationButtonDate();
}

function disableButtonDate(button) {
  button.classList.add('cursor-not-allowed');
  button.classList.add('opacity-20');
  button.classList.remove('cursor-pointer');
  button.disabled = true;
  renderNotificationButtonDate();
}

let arrayTime = [];
for (let i = 9; i <= 17; i++) {
  // tạo arrayTime ngày hôm mở cái trang lên từ 9h đến 17h30 trừ buổi trưa
  if (i != 12) {
    arrayTime.push(
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate(),
        i,
        0
      )
    );
    arrayTime.push(
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate(),
        i,
        30
      )
    );
  }
}
class Appointment {
  #time;
  #bookedAppointment;
  constructor() {
    this.#renderUserInfo();

    this.#listSpecialityAndDoctor();
    this.#appointmentTimeManagement();
    this.#getTimeButton();
    this.#sendForm();
    this.#time = '';
    this.#numberOnlyField();
  }

  #renderUserInfo() {
    const emailInput = document.querySelector('input[name="email"]');
    const fullnameInput = document.querySelector('input[name="fullname"]');
    const phoneNumberInput = document.querySelector(
      'input[name="phoneNumber"]'
    );
    if (!emailInput.value) emailInput.value = localStorage.getItem('email');
    if (!fullnameInput.value)
      fullnameInput.value = localStorage.getItem('fullname');
    if (!phoneNumberInput.value)
      phoneNumberInput.value = localStorage.getItem('phoneNumber');
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

  #getTimeButton() {
    document.querySelectorAll('#listTime button').forEach((button) => {
      button.addEventListener('click', () => {
        document.querySelectorAll('#listTime button').forEach((btn) => {
          btn.classList.add('bg-gray-200');
          btn.classList.remove('linearBackground', 'text-white');
        });
        button.classList.remove('bg-gray-200');
        button.classList.add('linearBackground');
        button.classList.add('text-white');
        this.#time = button.textContent;
      });
    });
  }

  #sendForm() {
    document.querySelector('form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const schedule = document.querySelector('input[name="schedule"]').value;
      const time = this.#time;
      if (this.#time === '') {
        renderPopup(
          400,
          'Creating appointment',
          'Please provide the time of appointment!'
        );
        return;
      }
      // đống dữ liệu dưới đây để tạo cuộc hẹn
      const date = new Date(
        schedule.split('/')[2],
        schedule.split('/')[1] - 1,
        schedule.split('/')[0],
        time.split(':')[0],
        time.split(':')[1]
      );
      // console.log(date);
      const specialty = document.querySelector('#specialtyList').value;
      const doctorID = document.querySelector('#doctorList').value;
      const fullname = document.querySelector('input[name="fullname"]').value;
      const email = document.querySelector('input[name="email"]').value;
      const phoneNumber = document.querySelector(
        'input[name="phoneNumber"]'
      ).value;
      const reason = document
        .querySelector('textarea[name="reason"]')
        .value.trim();

      localStorage.setItem('email', email);
      localStorage.setItem('phoneNumber', phoneNumber);
      localStorage.setItem('fullname', fullname);

      const objAppointment = {
        time: date,
        specialty,
        doctorID,
        fullname,
        email,
        phoneNumber,
        reason,
      };
      sendAppointment(objAppointment);
    });
  }

  #listSpecialityAndDoctor() {
    let speciality = document.querySelector('#specialtyList');

    speciality.addEventListener('change', async function (e) {
      const doctorData = await fetchDoctorMajor(e.target.value);
      const elements = document.querySelectorAll('.doctorListItem');
      elements.forEach((element) => {
        element.remove();
      });
      doctorData.forEach((doc) => {
        const option = document.createElement('option');
        option.value = doc.id;
        option.classList.add('doctorListItem');
        option.textContent = doc.fullname;
        const doctorContainer = document.querySelector('#doctorList');
        doctorContainer.append(option);
      });
    });
  }

  #appointmentTimeManagement() {
    // chuyển cái input date biến mất khi chọn lại specialty
    document.querySelector('#specialtyList').addEventListener('change', () => {
      document.querySelector('input[name="schedule"]').value = '';
      document.querySelector('#doctorList').value = '';
      document.querySelector('#listTime').classList.add('hidden');
    });

    // chọn xong doctor rồi mới hiện lịch cho xài
    document.querySelector('#doctorList').addEventListener('change', (e) => {
      document.querySelector('#datepicker').disabled = false;
      document.querySelector('input[name="schedule"]').value = '';
    });

    // Check every time doctor change
    const doctorContainer = document.querySelector('#doctorList');
    doctorContainer.addEventListener(
      'change',
      async function (e) {
        const email = document.querySelector('input[name="email"]');
        const bookedAppointment = await fetchAvailableAppointmentTime(
          e.target.value,
          email.value
        );
        this.#bookedAppointment = bookedAppointment;
        console.log(this.#bookedAppointment);
      }.bind(this)
    );
    const submitDatePicker = document.querySelector('.submitDatepicker');

    submitDatePicker.addEventListener(
      'click',
      function () {
        const listTime = document.querySelector('#listTime');
        listTime.classList.remove('hidden');
        // reset button
        document
          .querySelectorAll('.timeButton')
          .forEach((button) => ableButtonDate(button));
        const schedule = document.querySelector('input[name="schedule"]').value;
        const now = new Date(Date.now());
        const pickedDate = new Date(
          schedule.split('/')[2],
          schedule.split('/')[1] - 1,
          schedule.split('/')[0]
        );

        // filter out if pickedDate is currently today
        if (
          pickedDate.getDate() == now.getDate() &&
          pickedDate.getMonth() == now.getMonth() &&
          pickedDate.getFullYear() == now.getFullYear()
        ) {
          document.querySelectorAll('.timeButton').forEach((button) => {
            const [hours, minutes] = button.textContent.split(':');
            const buttonDate = new Date(
              `${pickedDate.getFullYear()}-${
                pickedDate.getMonth() + 1
              }-${pickedDate.getDate()} ${hours}:${minutes}`
            );
            if (
              now.getTime() + 1000 * 60 * 60 * 3 >= buttonDate.getTime() ||
              buttonDate.getHours() < 10
            ) {
              disableButtonDate(button);
            }
          });
        }

        // filter out if pickedDate is previous date
        else if (pickedDate.getTime() < now.getTime()) {
          document
            .querySelectorAll('.timeButton')
            .forEach((button) => disableButtonDate(button));
        }

        // filter out based on some condition if pickedDate is in the future
        else {
          const nextDay = new Date(
            `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate() + 1}`
          );
          if (
            pickedDate.getDate() == nextDay.getDate() &&
            pickedDate.getMonth() == nextDay.getMonth() &&
            pickedDate.getFullYear() == nextDay.getFullYear()
          ) {
            // filter out if currently booking time has past 22:00 PM
            if (now.getHours() >= 22) {
              document.querySelectorAll('.timeButton').forEach((button) => {
                const [hours, minutes] = button.textContent.split(':');
                const buttonDate = new Date(
                  `${pickedDate.getFullYear()}-${
                    pickedDate.getMonth() + 1
                  }-${pickedDate.getDate()} ${hours}:${minutes}`
                );
                if (buttonDate.getHours() < 10) {
                  disableButtonDate(button);
                }
              });
            }
          }
          document
            .querySelectorAll('.timeButton')
            .forEach((button) => ableButtonDate(button));
        }

        // filter out already booked appointment of other user
        const bookedAppointment = this.#bookedAppointment.bookedAppointment;
        bookedAppointment.forEach((appointment) => {
          const time = new Date(appointment.time);
          if (
            time.getDate() == pickedDate.getDate() &&
            time.getMonth() == pickedDate.getMonth() &&
            time.getFullYear() == pickedDate.getFullYear()
          ) {
            document.querySelectorAll('.timeButton').forEach((button) => {
              const [hours, minutes] = button.textContent.split(':');
              if (time.getHours() == hours && time.getMinutes() == minutes) {
                disableButtonDate(button);
              }
            });
          }
        });

        // filter out already booked appointment of current user
        const personalBookedAppointment =
          this.#bookedAppointment.personalBookedAppointment;
        personalBookedAppointment.forEach((appointment) => {
          const time = new Date(appointment.time);
          if (
            time.getDate() == pickedDate.getDate() &&
            time.getMonth() == pickedDate.getMonth() &&
            time.getFullYear() == pickedDate.getFullYear()
          ) {
            document.querySelectorAll('.timeButton').forEach((button) => {
              const [hours, minutes] = button.textContent.split(':');
              const buttonDate = new Date(
                `${pickedDate.getFullYear()}-${
                  pickedDate.getMonth() + 1
                }-${pickedDate.getDate()} ${hours}:${minutes}`
              );
              console.log(time, buttonDate);
              if (
                time.getTime() - 1000 * 60 * 60 <= buttonDate.getTime() &&
                time.getTime() + 1000 * 60 * 60 >= buttonDate.getTime()
              ) {
                disableButtonDate(button);
              }
            });
          }
        });
      }.bind(this)
    );
  }
}

const fetchDoctorMajor = async function (major) {
  try {
    Loader.create();
    const doctorData = await axios({
      method: 'GET',
      url: `/api/doctor`,
      params: { major },
    });
    Loader.destroy();
    return doctorData.data.data;
  } catch (err) {
    Loader.destroy();
    renderPopup(
      err.response.status,
      'Fetch Doctor Data',
      err.response.data.message
    );
  }
};

const fetchAvailableAppointmentTime = async function (doctorID, email) {
  try {
    Loader.create();
    const doctorData = await axios({
      method: 'GET',
      url: `/api/appointment/booked`,
      params: { doctorID, email },
    });
    Loader.destroy();
    return doctorData.data.data;
  } catch (err) {
    console.log(err);
    Loader.destroy();
    renderPopup(
      err.response.status,
      'Fetch Doctor Data',
      err.response.data.message
    );
  }
};

new Appointment();
