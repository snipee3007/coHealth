const sliderImagesContainer = document.querySelector('.sliderImagesContainer');
const dotsContainer = document.querySelector('.dotsContainer');
const newsContainer = document.querySelector('.newsContainer');
class Slider {
  #images;
  #length;
  templateHTML = '';
  #currentSlide;
  #time;
  _interval;
  _initActiveDot() {
    const activeDot = document.querySelector('.slider-dot');
    activeDot.classList.add('active-dot');
  }
  _setActiveDot() {
    const dots = document.querySelectorAll('.slider-dot');

    dots.forEach(
      ((dot) => {
        if (this.#currentSlide === Number(dot.id)) {
          dot.classList.add('active-dot');
        } else if (this.#currentSlide !== Number(dot.id)) {
          dot.classList.remove('active-dot');
        }
      }).bind(this)
    );
  }
  setTime(time) {
    this.#time = time * 1000;
  }

  _moveSlide(item) {
    const image = item.querySelector('.sliderImage');
    image.style.transform = `translateX(-${90 * this.#currentSlide}vw)`;
    this._setActiveDot();
  }
  _transitionSlide() {
    const sliderImagesItem = document.querySelectorAll('.sliderImagesItem');
    sliderImagesItem.forEach((item) => this._moveSlide(item));
  }
  _nextSlide() {
    ++this.#currentSlide;
    if (this.#length === this.#currentSlide) {
      this.#currentSlide = 0;
    }
    this._transitionSlide();
  }
  _createDots() {
    this.#length = this.#images.length;
    let html = '';
    for (let i = 0; i < this.#length; ++i) {
      html += `<div class="slider-dot" id="${i}"></div>`;
    }
    dotsContainer.insertAdjacentHTML('beforeend', html);
    this._initActiveDot();
  }

  _createImage() {
    let html = '';
    this.#images.forEach(function (image) {
      html += `<div class="sliderImagesItem">
      <img
        class="sliderImage"
        src="../${image.src}"
        alt="${image.alt}"
        id="${image.id}"
      />
      </div>`;
    });
    sliderImagesContainer.insertAdjacentHTML('afterbegin', html);
    this.#currentSlide = 0;
  }
  async _loadImage() {
    await fetch(`./../../data/images-slider.json`)
      .then((res, err) => res.json())
      .then((res, err) => (this.#images = res))
      .catch((err) => console.log('Can not load images'));
  }
  _dotsInteract() {
    const dots = document.querySelectorAll('.slider-dot');
    dots.forEach((dot) =>
      dot.addEventListener(
        'click',
        function () {
          this.#currentSlide = Number(dot.id);
          this._transitionSlide();
          clearInterval(this._interval);
          this._autoMove();
          this._setActiveDot();
        }.bind(this)
      )
    );
  }
  _hovering() {
    newsContainer.addEventListener(
      'mouseover',
      function () {
        clearInterval(this._interval);
      }.bind(this)
    );
    newsContainer.addEventListener('mouseout', this._autoMove.bind(this));
  }
  _autoMove() {
    this._interval = setInterval(this._nextSlide.bind(this), this.#time);
  }

  async run() {
    await this._loadImage();
    this._createImage();
    this._createDots();
    this.setTime(5);
    this._dotsInteract();
    this._autoMove();
    this._hovering();
  }
}

export default new Slider();
