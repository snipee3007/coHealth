class News {
  constructor() {
    this.#init();
  }
  #init() {
    new Swiper('.swiper', {
      pagination: {
        el: '.swiper-pagination-1',
        clickable: true,
        bulletClass: 'swiper-pagination-bullet swiper-pagination-bullet-news',
        dynamicBullets: true,
        dynamicMainBullets: 6,
        bulletActiveClass: 'swiper-pagination-bullet-active-news',
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

new News();
