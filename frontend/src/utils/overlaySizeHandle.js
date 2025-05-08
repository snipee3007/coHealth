// HANDLE OVERLAY SIZE
const resize = function () {
  const body = document.querySelector('.body');
  const oeverlays = document.querySelectorAll('.overlay');
  body.style.height = '';
  oeverlays.forEach((overlay) => {
    overlay.style.height = '';
    if (
      overlay.getBoundingClientRect().height <
      body.getBoundingClientRect().height
    ) {
      overlay.style.height = body.getBoundingClientRect().height + 'px';
    } else {
      body.style.height = overlay.getBoundingClientRect().height + 'px';
    }
  });
};

export { resize };
