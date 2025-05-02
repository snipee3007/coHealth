import { renderPopup } from './utils/popup.js';
import Loader from './utils/loader.js';
const socket = io('http://127.0.0.1:3000');

const sendAppointment = async function (data) {
  try {
    // console.log(data);
    Loader.create();
    const res = await axios({
      method: 'POST',
      url: '/api/appointment/create',
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

function ableButtonDate(i) {
  document
    .querySelector('#listTime')
    .children[i].classList.remove('cursor-not-allowed');
  document
    .querySelector('#listTime')
    .children[i].classList.remove('opacity-20');
  document.querySelector('#listTime').children[i].disabled = false;
}

function disableButtonDate(i) {
  document
    .querySelector('#listTime')
    .children[i].classList.add('cursor-not-allowed');
  document.querySelector('#listTime').children[i].classList.add('opacity-20');
  document.querySelector('#listTime').children[i].disabled = true;
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
  #listBooked;
  constructor() {
    this.#listSpecialityAndDoctor();
    this.#listTime();
    this.#getTimeButton();
    this.#sendForm();
    this.#time = '';
    this.#listBooked = [];
    this.#getListBooked();
  }

  async #getListBooked() {
    const res = await axios({
      method: 'GET', // viết hoa
      url: `/api/appointment/get`,
    });
    const appointments = res.data.data;
    // de coi la luu vao db co can luu doctorID khong hay luu doctorFullname voi doctorSpecialty thoi
    appointments.forEach((appointment) =>
      this.#listBooked.push({
        fullname: appointment.doctorID.fullname,
        specialty: appointment.doctorID.doctorInfo[0].major,
        time: new Date(appointment.time),
      })
    );
    // console.log(this.#listBooked);
  }

  #listTime() {
    // chuyển cái input date biến mất khi chọn lại specialty
    document.querySelector('#specialtyList').addEventListener('change', () => {
      document.querySelector('input[name="schedule"]').value = '';
      document.querySelector('#doctorList').value = 'noInfo';
      document.querySelector('#listTime').classList.add('hidden');
    });

    const submitDatePicker = document.querySelector('.submitDatepicker');
    // chọn xong doctor rồi mới hiện lịch cho xài
    document.querySelector('#doctorList').addEventListener('change', (e) => {
      document.querySelector('#datepicker').disabled = false;
      document.querySelector('input[name="schedule"]').value = '';

      submitDatePicker.addEventListener('click', (e) => {
        const listTime = document.querySelector('#listTime');
        listTime.classList.remove('hidden');

        const schedule = document.querySelector('input[name="schedule"]').value;
        const today = new Date();
        const date = new Date(
          schedule.split('/')[2],
          schedule.split('/')[1] - 1,
          schedule.split('/')[0],
          23,
          59
        );
        // nếu thời điểm đang xét có ngày lớn hơn mình chọn (ví dụ ngày 14 > ngày 13) thì hiện thông báo rằng phải chọn ngày khác vì hết đặt được
        if (today > date) {
          console.log(today - date);
          listTime.classList.add('hidden');
          document.querySelectorAll('.notice').forEach((e) => e.remove());
          document.querySelector('form .time').insertAdjacentHTML(
            'beforeend',
            `
            <p class='mt-4 notice'>Please choose another day.</p>
          `
          );
        }
        // nếu như ngày hiện tại là chủ nhật thì khỏi tính - hiện luôn bảng hôm nay cho nghỉ
        else if (date.getDay() === 0) {
          document.querySelectorAll('.notice').forEach((e) => e.remove());
          listTime.classList.add('hidden');
          document.querySelector('form .time').insertAdjacentHTML(
            'beforeend',
            `
            <p class='mt-4 notice'>Doctors are not working this day. Please choose another day.</p>
          `
          );
        } else {
          // kiểm tra nếu hôm nay là ngày trùng thì xét giờ hiện tại có lố giờ để đặt lịch hay chưa
          function checkToday() {
            // tìm kiếm coi cái giờ hiện tại nó nằm ở vị trí nào trong arrayTime
            let index = arrayTime.findIndex(checkTime);
            function checkTime(time) {
              return time > today;
            }
            // nếu giờ hiện tại nó lố giờ trong arrayTime thì
            if (index == -1) {
              document.querySelectorAll('.notice').forEach((e) => e.remove());
              listTime.classList.add('hidden');
              // console.log(document.querySelector('form .time'))
              document.querySelector('form .time').insertAdjacentHTML(
                'beforeend',
                `
                <p class='mt-4 notice'>Please choose another day.</p>
              `
              );
            } else {
              document.querySelectorAll('.notice').forEach((e) => e.remove());
              if (date.getDay() === 6) {
                if (index >= 5) {
                  document.querySelector('form .time').insertAdjacentHTML(
                    'beforeend',
                    `
                    <p class='mt-4 notice'>Please choose another day.</p>
                  `
                  );
                } else {
                  for (index; index >= 0; index--) {
                    disableButtonDate(index);
                  }
                  for (let i = 6; i < listTime.children.length; i++) {
                    disableButtonDate(i);
                  }
                }
              } else {
                for (index; index >= 0; index--) {
                  disableButtonDate(index);
                }
                listTime.classList.remove('hidden');
              }
            }
          }
          // reset lại tất cả đều chọn được
          for (let i = 0; i < listTime.children.length; i++) {
            ableButtonDate(i);
          }
          // bắt đầu xét với cùng bác sĩ, cùng chuyên môn, cùng ngày thì 0 được xài nút này
          const listAppointment = this.#listBooked.filter(
            (appointment) =>
              appointment.specialty ==
                document.querySelector('#specialtyList').value &&
              appointment.fullname ==
                document.querySelector('#doctorList').value
          );
          listAppointment.forEach((appointment) => {
            if (
              appointment.time.getDate() === date.getDate() &&
              Math.abs(date - appointment.time) / 1000 < 2592000
            ) {
              let hour =
                appointment.time.getHours() === 9
                  ? '09'
                  : appointment.time.getHours();
              let minute = appointment.time.getMinutes() == 0 ? '00' : '30';
              let time = hour + ':' + minute;
              // lặp qua các nút, coi cái nào trùng giờ thì cho disabled
              console.log(time);
              document
                .querySelectorAll('#listTime button')
                .forEach((button) => {
                  if (button.textContent.trim() === time) {
                    button.disabled = true;
                    button.classList.add('cursor-not-allowed');
                    button.classList.add('opacity-20');
                  }
                });
            }
          });
          // vô điều kiện check cùng ngày để thực hiện hàm checkToday
          if (
            date.getDate() === today.getDate() &&
            Math.abs(date - today) / 1000 < 2592000
          ) {
            checkToday();
          }
          // nếu không ngày thì
          else {
            // nếu vô ngày thứ 7
            if (date.getDay() === 6) {
              for (let i = 6; i < listTime.children.length; i++) {
                disableButtonDate(i);
              }
            }
            document.querySelectorAll('.notice').forEach((e) => e.remove());
          }
        }
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
      console.log(date);
      const specialty = document.querySelector('#specialtyList').value;
      const docFullname = document.querySelector('#doctorList').value;
      const fullname = document.querySelector('input[name="fullname"]').value;
      const email = document.querySelector('input[name="email"]').value;
      const phoneNumber = document.querySelector(
        'input[name="phoneNumber"]'
      ).value;
      const reason = document
        .querySelector('textarea[name="reason"]')
        .value.trim();
      const objAppointment = {
        time: date,
        specialty: specialty,
        docFullname: docFullname,
        fullname: fullname,
        email: email,
        phoneNumber: phoneNumber,
        reason: reason,
      };
      sendAppointment(objAppointment);
    });
  }

  async #listSpecialityAndDoctor() {
    // canh rồi sửa lại distinct cho cái này
    let speciality = document.querySelector('#specialtyList');
    let doctor = document.querySelector('#doctorList');

    // document.querySelector('').innerHTML = ''
    // lấy dữ liệu spec ở trên để lập list bác sĩ
    speciality.addEventListener('change', async function (e) {
      const doctorData = await axios({
        method: 'GET',
        url: `/api/doctor?major=${e.target.value}`,
      });
      const elements = document.querySelectorAll('.delete');
      elements.forEach((element) => {
        element.remove();
      });
      doctorData.data.data.forEach((doc) => {
        doctor.insertAdjacentHTML(
          'beforeend',
          `
          <option value='${doc.fullname}' class='delete'>${doc.fullname}</option>
        `
        );
      });
    });
  }
}

new Appointment();
