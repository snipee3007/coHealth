const renderPopup = function (statusCode, action, message, href) {
  const template = renderPopupTemplate(statusCode, action, message);
  let time;
  if (statusCode.toString().startsWith('2')) {
    time = 3000;
  } else if (
    statusCode.toString().startsWith('4') ||
    statusCode.toString().startsWith('5')
  ) {
    time = 5000;
  }
  const body = document.querySelector('.body');
  body.insertAdjacentHTML('afterbegin', template);
  const popup = document.querySelector('.actionPopup');
  setTimeout(function () {
    popup.classList.toggle('opacity-0');
    popup.classList.add('translate-y-2');
    const timeout = setTimeout(function () {
      popup.classList.remove('translate-y-2');
      popup.classList.toggle('opacity-0');
      popup.remove();
      if (href == 'reload') {
        location.reload();
      } else if (href) window.location = href;
    }, time);
    popup.addEventListener('click', function (e) {
      e.target.closest('.actionPopup').remove();
      clearTimeout(timeout);
      if (href == 'reload') {
        location.reload();
      } else if (href) window.location = href;
    });
  }, 200);
};

const renderPopupTemplate = function (statusCode, action, message) {
  let imgPath = '';
  let actionStatus = '';
  if (statusCode.toString().startsWith('2')) {
    imgPath = 'success.png';
    actionStatus = 'successful!';
  } else if (
    statusCode.toString().startsWith('4') ||
    statusCode.toString().startsWith('5')
  ) {
    imgPath = 'failed.png';
    actionStatus = 'failed!';
  }
  return `
    <div class="fixed actionPopup bottom-8 left-8 w-1/3 px-3 py-2 flex flex-row gap-2 opacity-0 duration-200 bg-white border rounded-xl z-40 shadow-2xl cursor-pointer">
        <img src="/images/png/${imgPath}" class="w-6 h-6 mt-1 "/>
        <div class="flex flex-col gap-1">
            <div class="popupTitle font-Inter text-[#384FC0] font-medium text-lg">
                ${action} ${actionStatus}
            </div>
            <div class="popupMessage font-Inter text-black">
                ${message}
            </div>
        </div>
    </div>
  `;
};

const renderAlertTemplate = function ({ message = '' }) {
  return `
    <div class="alertOverlay w-full min-h-screen fixed z-40 flex items-center justify-center font-Cormorant opacity-0 pointer-events-none duration-100 bg-black/50">
      <div class="alertBox flex flex-col gap-4 bg-white w-1/2 translate-y-10 py-10 items-center rounded-xl duration-100">
        <svg class="w-24 h-24">
          <use href="/images/png/icons.svg#orange-info"></use>
        </svg>
      <div class="alertMessage text-2xl w-2/3 text-center">
        ${message}
      </div>
      <div class="alertConfirm flex flex-1 justify-between w-2/3">
        <div class="cancelAlertButton flex items-center text-xl gap-4 cursor-pointer">
          <img class="w-8 h-8" src="/images/failed.png" alt="failed icon"/>
          <p>Quay lại</p>
        </div>
        <div class="confirmAlertButton flex items-center text-xl gap-4 cursor-pointer">
          <img class="w-8 h-8" src="/images/success.png" alt="success icon"/>
          <p>Xác nhận</p>
        </div>
      </div>
    </div>
  `;
};

const renderAlert = (message) => {
  return new Promise((resolve, reject) => {
    const template = renderAlertTemplate({
      message: 'Bạn có chắc chắ muốn xóa bài học này không?',
    });
    const body = document.querySelector('.body');
    body.insertAdjacentHTML('afterbegin', template);
    toggleAlertPopup();
    document
      .querySelector('.alertOverlay')
      .addEventListener('click', function (e) {
        if (e.target == document.querySelector('.alertOverlay')) {
          toggleAlertPopup();
          resolve(false);
        }
      });
    document
      .querySelector('.cancelAlertButton')
      .addEventListener('click', function (e) {
        toggleAlertPopup();
        resolve(false);
      });
    document
      .querySelector('.confirmAlertButton')
      .addEventListener('click', function (e) {
        if (e.target.closest('.confirmAlertButton')) {
          toggleAlertPopup();
          resolve(true);
        }
      });
  });
};

// HELPER FUNCTION
const toggleAlertPopup = function () {
  setTimeout(function () {
    const alertPopup = document.querySelector('.alertOverlay');
    const alertBox = document.querySelector('.alertBox');
    alertPopup.classList.toggle('opacity-0');
    alertPopup.classList.toggle('pointer-events-none');
    alertBox.classList.toggle('translate-y-10');
  }, 50);
};
export { renderPopup, renderAlert };
