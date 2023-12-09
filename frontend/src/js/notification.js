document.addEventListener('DOMContentLoaded', function () {
  var customizeModal = document.getElementById('customizeModal');
  var customizeBtn = document.getElementById('customizeBtn');
  var customizeCloseBtn = document.getElementById('customizeCloseBtn');
  var modal = document.getElementById('myModal');
  var btn = document.getElementById('plan');
  var closeBtn = document.getElementById('closeBtn');
  var overlay = document.getElementById('overlay');
  var summaryContainer = document.querySelector('.summaryContainer');
  var heartButtons = document.querySelectorAll('.heartBtn');
  var thingItems = document.querySelectorAll('.thing-item');

  heartButtons.forEach(function (heartBtn) {
    heartBtn.addEventListener('click', function () {
      heartBtn.classList.toggle('favorite-active');
      heartBtn.classList.toggle('red');
    });
  });

  customizeBtn.addEventListener('click', function (event) {
    event.preventDefault();
    customizeModal.style.display = 'block';
    overlay.style.display = 'block';
    summaryContainer.classList.add('darkenContainer');
  });
  btn.addEventListener('click', function () {
    modal.style.display = 'block';
    overlay.style.display = 'block';

    summaryContainer.classList.add('darkenContainer');
  });

  closeBtn.addEventListener('click', function () {
    modal.style.display = 'none';
    overlay.style.display = 'none';

    summaryContainer.classList.remove('darkenContainer');
  });

  customizeCloseBtn.addEventListener('click', function () {
    customizeModal.style.display = 'none';
    overlay.style.display = 'none';
    summaryContainer.classList.remove('darkenContainer');
  });

  thingItems.forEach(function (item) {
    item.addEventListener('click', function () {
      item.classList.toggle('clicked');
    });
  });

  window.addEventListener('click', function (event) {
    if (event.target === customizeModal) {
      customizeModal.style.display = 'none';
      overlay.style.display = 'none';
      summaryContainer.classList.remove('darkenContainer');
    }
  });

  const datePickerFrom = new Pikaday({
    field: document.getElementById('datepickerFrom'),
    format: 'YYYY-MM-DD',
    showYearDropdown: true,
    yearRange: [2000, moment().year()],
  });

  const datePickerTo = new Pikaday({
    field: document.getElementById('datepickerTo'),
    format: 'YYYY-MM-DD',
    showYearDropdown: true,
    yearRange: [2000, moment().year()],
  });
});
