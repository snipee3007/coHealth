class Loader {
  create() {
    const template = `
      <div class="overlayLoader absolute w-screen bg-black/50 flex flex-1 justify-center items-center z-30 loaderContainer">
          <div class="loader"></div>
      </div>
      `;
    document.querySelector('.body').insertAdjacentHTML('afterbegin', template);
    resize();
  }
  destroy() {
    document.querySelector('.loaderContainer').remove();
    document.querySelector('.body').style.height = '';
  }
}

const resize = function () {
  const body = document.querySelector('.body');
  const overlay = document.querySelector('.overlayLoader');
  body.style.height = '';
  overlay.style.height = '';
  if (
    overlay.getBoundingClientRect().height < body.getBoundingClientRect().height
  )
    overlay.style.height = body.getBoundingClientRect().height + 'px';
  else body.style.height = overlay.getBoundingClientRect().height + 'px';
};
export default new Loader();
