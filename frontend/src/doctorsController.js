const socket = io('http://127.0.0.1:3000');

class Doctor {
  constructor() {
    this.#init();
  }
  #init() {
    this.#swiper();
  }
  #swiper() {
    new Swiper('.swiper', {
      pagination: {
        el: '.swiper-pagination-1',
        clickable: true,
        bulletClass:
          'swiper-pagination-bullet swiper-pagination-bullet-doctors',
        dynamicBullets: true,
        dynamicMainBullets: 6,
        bulletActiveClass: 'swiper-pagination-bullet-active-doctors',
        renderBullet: function (index, className) {
          return (
            '<span class="' +
            className +
            ' cursor-pointer font-Inter">' +
            (index + 1) +
            '</span>'
          );
        },
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      slidesPerView: 3,
      spaceBetween: 80,
      grid: {
        fill: 'row',
        rows: 2,
      },
    });
  }
}

new Doctor();
