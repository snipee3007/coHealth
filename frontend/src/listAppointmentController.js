const socket = io('http://127.0.0.1:3000');

// 2 function dưới để thêm hiệu ứng khi chuyển trang
function fadeOutContent() {
  document
    .querySelector('#appointment-container')
    .classList.remove('opacity-100');
  document.querySelector('#appointment-container').classList.add('opacity-0');
}

function fadeInContent() {
  document
    .querySelector('#appointment-container')
    .classList.remove('opacity-0');
  document.querySelector('#appointment-container').classList.add('opacity-100');
}

class ListAppointment {
  #currentPage;
  constructor() {
    this.#currentPage = 1;
    this.#changeColorSetting();
    this.#loadAppointments();
  }

  #loadAppointments() {
    async function showPage(page) {
      const res = await axios({
        method: 'GET',
        url: `/api/appointment/list/get?page=${page}`,
      });
      const container = document.querySelector('#appointment-container');
      while (container.firstChild) {
        container.removeChild(container.lastChild);
      }
      const appointments = res.data.data.appointments;
      const totalPages = res.data.data.totalPages;
      console.log(res);
      console.log(appointments);
      appointments.forEach((appointment) => {
        // cột đầu, nếu là doctor thì hiện tên người dùng, nếu là người dùng kia thì hiện tên bác sĩ
        let name =
          document.querySelector('.role').textContent === 'Doctor'
            ? `${appointment.doctorID.fullname}`
            : `${appointment.fullname}`;

        const createdDate = new Date(appointment.time);
        const days = [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ];
        const months = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ];
        let date = createdDate.getDate();
        if (date == 1) date = `${date}st`;
        else if (date == 2) date = `${date}nd`;
        else if (date == 3) date = `${date}rd`;
        else date = `${date}th`;
        let details =
          appointment.status == -1
            ? `<span class="inline-block bg-gray-200 rounded-xl px-4 py-2">Unchecked</span>`
            : appointment.status == 1
            ? `<span class='inline-block text-[#4461F2] bg-white rounded-xl px-4 py-2'>Accepted</span>`
            : `<span class="bg-white rounded-xl p-4 text-red-300">Decline</span>`;
        document.querySelector('#appointment-container').insertAdjacentHTML(
          'beforeend',
          `
                    <div class="flex mt-4 p-4 justify-between space-x-4 text-center">
                        <p class="text-xl my-4 w-1/5">${name}</p>
                        <p class="text-xl my-4 w-1/5"> ${
                          days[createdDate.getDay()]
                        }, ${
            months[createdDate.getMonth()]
          } ${date} ${createdDate.getFullYear()} </p>
                        <p class="text-xl my-4 w-1/5">
                            ${
                              createdDate.getHours() === 9
                                ? '09'
                                : createdDate.getHours()
                            } : ${createdDate.getMinutes() === 0 ? '00' : '30'}
                        </p>
                        <p class="text-xl my-4 w-1/5">
                            ${details}
                        </p>
                        <a href='./list/${
                          appointment.appointmentCode
                        }' class='text-xl my-4 w-1/5 text-[#4461F2] underline underline-offset-2'>
                            Details
                        </p>
                        
                    </div>
                    <hr class='border-[#9C9991] w-full my-4'>
                `
        );
      });
      document.querySelector('#prevPage').disabled = false;
      document.querySelector('#nextPage').disabled = false;

      document.querySelector('#pageNumber').innerHTML = page;
      if (page === totalPages) {
        document.querySelector('#nextPage').disabled = true;
      }
      if (page === 1) {
        document.querySelector('#prevPage').disabled = true;
      }
    }

    // dùng debounce() để chặn spam nút
    const debouncedChangePage = _.debounce((direction) => {
      // nếu như giảm trang và nó không ở trang 1 hoặc tăng trang và không phải ở trang cuối, check totalPages để bỏ nút next trên dom luôn
      console.log('nó vô debounced để xem');
      console.log('currentPage', this.#currentPage);
      if ((direction === -1 && this.#currentPage > 1) || direction === 1) {
        console.log('nhảy điều kiện đúng chưa?');
        this.#currentPage += direction;
        console.log(this.#currentPage);
        fadeInContent();
        showPage(this.#currentPage);
      }
    }, 300).bind(this);

    document.querySelector('#prevPage').addEventListener('click', () => {
      fadeOutContent();
      debouncedChangePage(-1);
    });

    document.querySelector('#nextPage').addEventListener('click', () => {
      fadeOutContent();
      debouncedChangePage(1);
    });
  }

  #changeColorSetting() {
    document.querySelector('a.appointment p').classList.add('text-[#4461F2]');
    document.querySelector('a.profile p').classList.remove('text-[#4461F2]');
    document.querySelector('a.appointment img').src =
      './../images/png/calendar-active.png';
    document.querySelector('a.profile img').src =
      './../images/png/icon-inactive.png';
  }
}

new ListAppointment();
