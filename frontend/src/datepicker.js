const maxDate = (month, year) => {
  if (month < 0 || month > 11) return undefined;
  if ([0, 2, 4, 6, 7, 9, 11].includes(month)) return 31;
  else if ([3, 5, 8, 10].includes(month)) return 30;
  else if (month == 1 && year % 4 == 0 && year % 100 != 0) return 29;
  else if (month == 1 && year % 100 == 0 && year % 400 == 0) return 29;
  else return 28;
};

const getMonthString = (month) => {
  const monthArray = [
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
  return monthArray[month];
};

class Datepicker {
  constructor(date, month, year) {
    const now = new Date(Date.now());
    this.date = date ? date : now.getDate();
    this.month = month ? month : now.getMonth();
    this.year = year ? year : now.getFullYear();
    this.#nextMonthButton();
    this.#prevMonthButton();
    this.#returnDate();
    this.#cancelButton();
    this.#checkInputField();
    this.#init();
  }

  setDatepicker(date, month, year) {
    this.date = date;
    this.month = month;
    this.year = year;
    this.#init();
  }

  #init() {
    document.querySelector('.datepicker_day').innerHTML = '';
    this.#toggleDatepicker();
    this.#renderDatepickerDays(this.date, this.month, this.year);
    this.#renderDatepickerMonthYear(this.month, this.year);
    this.#renderDatepickerPickDate();
  }

  #createDatepickerDays() {
    let html = ``;
    const firstDate = new Date(this.year, this.month, 1);
    const lastDate = new Date(
      this.year,
      this.month,
      maxDate(this.month, this.year)
    );
    const firstDay = firstDate.getDay() == 0 ? 7 : firstDate.getDay();
    const lastDay = lastDate.getDay() == 0 ? 7 : lastDate.getDay();
    for (let i = 1; i < firstDay; ++i) {
      const prevMonth = this.month - 1 < 0 ? 11 : this.month - 1;
      const prevYear = prevMonth == 11 ? this.year - 1 : this.year;
      html =
        `<button type="button" class="p-1 w-8 h-8 day text-[#C4C4C4] bg-white rounded-lg" disabled date-value="${maxDate(
          prevMonth,
          prevYear
        )}">${maxDate(prevMonth, prevYear) - i + 1}</button>` + html;
    }

    for (let i = 1; i <= maxDate(this.month, this.year); ++i) {
      const timeNow = new Date(Date.now());
      if (
        i == timeNow.getDate() &&
        this.month == timeNow.getMonth() &&
        this.year == timeNow.getFullYear()
      ) {
        if (!this.currentPickenDate || this.currentPickenDate == i)
          html += `<button type="button" class="day p-1 w-8 h-8 text-white linearBackground rounded-lg pickenDate border-2 border-white cursor-pointer" data-value="${i}">${i}</button>`;
        else
          html += `<button type="button" class="day p-1 w-8 h-8 text-white linearBackground rounded-lg border-2 border-dark-moderate-orange cursor-pointer" data-value="${i}">${i}</button>`;
      } else if (
        i == this.currentPickenDate &&
        this.month == this.currentPickenMonth &&
        this.year == this.currentPickenYear
      )
        html += `<button type="button" class="day p-1 w-8 h-8 text-black bg-gray-300 rounded-lg pickenDate cursor-pointer">${i}</button>`;
      else
        html += `<button type="button" class="day p-1 w-8 h-8 text-black bg-gray-300 rounded-lg cursor-pointer">${i}</button>`;
    }
    for (let i = 1; i <= 7 - lastDay; ++i) {
      html += `<button type="button" class="p-1 w-8 h-8 text-[#C4C4C4] bg-white rounded-lg" disabled>${i}</button>`;
    }
    return html;
  }

  #renderDatepickerDays() {
    const datepickerDay = document.querySelector('.datepicker_day');
    let html = ``;
    html += this.#createDatepickerDays(this.date, this.month, this.year);
    datepickerDay.insertAdjacentHTML('afterbegin', html);
  }

  #renderDatepickerMonthYear() {
    let html = `
            <span class="datepicker_month" data-value="">${getMonthString(
              this.month
            )}</span>
            <span class="datepicker_year">${this.year}</span>
          `;
    document.querySelector('.datepicker_monthYear').innerHTML = '';
    document
      .querySelector('.datepicker_monthYear')
      .insertAdjacentHTML('afterbegin', html);
  }

  #renderDatepickerPickDate() {
    const days = document.querySelectorAll('.day');
    days.forEach((day) => {
      day.addEventListener('click', function (e) {
        const target = e.target;
        const pickenDate = document.querySelector('.pickenDate');
        if (pickenDate) pickenDate.classList.remove('pickenDate');
        target.classList.add('pickenDate');
      });
    });
  }

  #toggleDatepicker() {
    const inputSchedule = document.querySelector('.schedule');
    inputSchedule.addEventListener('click', function () {
      const datepicker = document.querySelector('.datepickerContainer');
      if (datepicker.classList.contains('hidden'))
        datepicker.classList.remove('hidden');
    });
    inputSchedule.addEventListener('keypress', function (e) {
      if (e.key == 'Enter') {
        e.preventDefault();
        const datepicker = document.querySelector('.datepickerContainer');

        if (!datepicker.classList.contains('hidden'))
          datepicker.classList.add('hidden');
        inputSchedule.blur();
      }
    });
    window.addEventListener('click', function (e) {
      if (
        !e.target.closest('.datepickerContainer') &&
        !e.target.closest('.schedule')
      ) {
        const datepicker = document.querySelector('.datepickerContainer');
        if (!datepicker.classList.contains('hidden'))
          datepicker.classList.add('hidden');
      }
    });
    document.querySelectorAll('.datepicker_optionButton').forEach((ele) => {
      ele.addEventListener('click', function (e) {
        if (e.target.classList.contains('.datepicker_optionButton')) {
          const datepicker = document.querySelector('.datepickerContainer');
          if (!datepicker.classList.contains('hidden'))
            datepicker.classList.add('hidden');
        }
      });
    });
  }

  #prevMonthButton() {
    document.querySelector('.datepicker_prevMonth').addEventListener(
      'click',
      function () {
        this.month == 0
          ? this.setDatepicker(this.date, 11, this.year - 1)
          : this.setDatepicker(this.date, this.month - 1, this.year);
      }.bind(this)
    );
  }

  #nextMonthButton() {
    document.querySelector('.datepicker_nextMonth').addEventListener(
      'click',
      function () {
        this.month == 11
          ? this.setDatepicker(this.date, 0, this.year + 1)
          : this.setDatepicker(this.date, this.month + 1, this.year);
      }.bind(this)
    );
  }

  #returnDate() {
    document.querySelector('.submitDatepicker').addEventListener(
      'click',
      function () {
        const date = document.querySelector('.pickenDate').innerHTML;
        document.querySelector('.schedule').value = `${date
          .toString()
          .padStart(2, '0')}/${(this.month + 1).toString().padStart(2, '0')}/${
          this.year
        }
          `.trim();
        const today = new Date(Date.now());
        if (
          new Date(today.getFullYear(), today.getMonth(), today.getDate()) <=
          new Date(this.year, +this.month, date)
        ) {
          this.currentPickenDate = +date;
          this.currentPickenMonth = +this.month;
          this.currentPickenYear = +this.year;
          document.querySelector('.schedule').setCustomValidity('');
        } else {
          document
            .querySelector('.schedule')
            .setCustomValidity(
              'Thời gian bạn chọn đã qua! Vui lòng chọn ngày khác'
            );
        }

        document.querySelector('.datepickerContainer').classList.add('hidden');
      }.bind(this)
    );
  }

  #cancelButton() {
    document
      .querySelector('.cancelDatepicker')
      .addEventListener('click', function (e) {
        if (e.target.closest('.cancelDatepicker'))
          document
            .querySelector('.datepickerContainer')
            .classList.add('hidden');
      });
  }

  #checkInputField() {
    const schedule = document.querySelector('.schedule');
    ['input', 'change'].forEach(
      ((event) => {
        schedule.addEventListener(
          event,
          function (e) {
            if (e.data == '/') {
              if (schedule.value.split('/').length == 4)
                schedule.value = schedule.value.slice(0, -1);
            } else if (e.data && e.data !== '0' && !+e.data) {
              schedule.value = schedule.value.slice(0, -1);
            }
            const [day, month, year] = schedule.value.split('/');
            const today = new Date(Date.now());
            if (
              !day ||
              !month ||
              !year ||
              +day < 1 ||
              +day > maxDate(+month - 1, year) ||
              +month < 1 ||
              +month > 12 ||
              new Date(today.getFullYear(), today.getMonth(), today.getDate()) >
                new Date(year, +month - 1, day)
            ) {
              document
                .querySelector('input[name="schedule"]')
                .setCustomValidity(
                  'Ngày bạn chọn không phù hợp! Vui lòng điền lại ngày khác'
                );
            } else {
              document
                .querySelector('input[name="schedule"]')
                .setCustomValidity('');
              this.currentPickenDate = +day;
              this.currentPickenMonth = +month - 1;
              this.currentPickenYear = +year;
              this.setDatepicker(this.date, +month - 1, +year);
            }
          }.bind(this)
        );
      }).bind(this)
    );
  }
}

new Datepicker();
