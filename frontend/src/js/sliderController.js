class Slider {
  constructor() {
    this.#init();
  }
  #init() {
    const swiper = new Swiper('.swiper', {
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      autoplay: {
        delay: 5000,
        pauseOnMouseEnter: true,
      },
    });
    this.swiper = swiper;
  }
}

export default Slider;
