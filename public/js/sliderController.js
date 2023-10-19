const newsContainer = document.querySelector('.newsContainer');
const sliderImagesContainer = document.querySelector('.sliderImagesContainer');
const dotsContainer = document.querySelector('.dotsContainer');
class Slider {
  images;
  length;
  templateHTML = '';
  initActiveDot() {
    const activeDot = document.querySelector('.slider-dot');
    activeDot.classList.add('active-dot');
  }
  setTime() {}
  autoSlide() {}
  createDots() {
    this.length = this.images.length;
    console.log(this.length);
    let html = '';
    for (let i = 0; i < this.length; ++i) {
      html += `<div class="slider-dot"></div>`;
    }
    console.log(html);
    dotsContainer.insertAdjacentHTML('beforeend', html);
    this.initActiveDot();
  }
  createImage() {
    let html = '';
    this.images.forEach(function (image) {
      html += `<div class="sliderImagesItem">
      <img
        class="sliderImage"
        src="../${image.src}"
        alt="${image.description}"
        id="${image.id}"
      />
      </div>`;
    });
    sliderImagesContainer.insertAdjacentHTML('afterbegin', html);
  }
  async loadImage() {
    await fetch(`./../../data/images-slider.json`)
      .then((res, err) => res.json())
      .then((res, err) => (this.images = res))
      .catch((err) => console.log('Can not load images'));
  }
  async run() {
    await this.loadImage();
    this.createImage();
    this.createDots();
  }
}

export default new Slider();
