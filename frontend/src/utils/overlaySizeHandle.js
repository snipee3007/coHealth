// HANDLE OVERLAY SIZE
const resize = function () {
  const body = document.querySelector('.body');
  const overlay = document.querySelector('.overlay');
  body.style.height = '';
  overlay.style.height = '';

  if (
    overlay.getBoundingClientRect().height < body.getBoundingClientRect().height
  ) {
    overlay.style.height = body.getBoundingClientRect().height + 'px';
  } else {
    body.style.height = overlay.getBoundingClientRect().height + 'px';
  }
};

export { resize };
