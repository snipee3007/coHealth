const updateStatusAppointment = async function (appointmentCode, status) {
  try {
    const res = await fetch('/api/appointment/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appointmentCode: appointmentCode,
        status: status,
      }),
    });
    // do cái fetch này phải kèm res.json() mới ra được data.status chứ không là 0 có lên được
    const data = await res.json();
    console.log(data);
    if (data.message == 'success') {
      // alert("Update appointment successfully")
      // // window.location.assign('/appointment/list')
      // location.reload()
      console.log(data.data);
    }
  } catch (err) {
    alert(err.message);
  }
};

const sendAcceptedEmail = async function (objAppointment) {
  try {
    const res = await fetch('/api/appointment/sendEmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullname: objAppointment.fullname,
        date: objAppointment.date,
        time: objAppointment.time,
        email: objAppointment.email,
        status: objAppointment.status,
      }),
    });
    // do cái fetch này phải kèm res.json() mới ra được data.status chứ không là 0 có lên được
    const data = await res.json();
    console.log(data);
    if (data.message == 'success') {
      alert('Confirm message and send email success!');
      location.replace('/appointment/list');
    }
  } catch (err) {
    alert(err.message);
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
        console.log(objAppointment.status);
        sendAcceptedEmail(objAppointment);
      });
  }
}

new AppointmentDetails();
