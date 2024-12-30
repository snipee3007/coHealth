class CalculateForm {
  constructor() {
    this.#init();
  }

  #init() {
    this.#selectField();
    this.#numberOnlyField();
  }

  #selectField() {
    ['gender', 'training', 'target', 'speed'].forEach((field) => {
      const fieldButton = document.querySelector(`.${field}Selected`);
      const fieldOptionList = document.querySelectorAll(`.${field}Option`);

      fieldButton.classList.add('invalidInput');

      fieldButton.addEventListener('click', function (e) {
        if (e.target.closest(`.${field}Selected`)) {
          document.querySelector(`.${field}Options`).classList.toggle('hidden');
        }
      });
      document.addEventListener('click', function (e) {
        if (
          !e.target.closest(`.${field}Selected`) &&
          !e.target.closest(`.${field}Options`)
        ) {
          const fieldOptions = document.querySelector(`.${field}Options`);
          if (!fieldOptions.classList.contains('hidden')) {
            fieldOptions.classList.toggle('hidden');
          }
        }
      });

      fieldOptionList.forEach((fieldOption) => {
        fieldOption.addEventListener('click', function (e) {
          if (e.target.closest(`.${field}Option`)) {
            document
              .querySelector(`.${field}Options`)
              .classList.toggle('hidden');
            const fieldInput = document.querySelector(`input[name='${field}']`);
            fieldInput.value = e.target.dataset['value'];
            if (e.target.dataset['value'] == '') {
              fieldButton.classList.add('invalidInput');
              fieldButton.classList.remove('validInput');
              fieldInput.setCustomValidity(
                'Missing input field! Please select different option!'
              );
            } else {
              fieldButton.classList.remove('invalidInput');
              fieldButton.classList.add('validInput');
              fieldInput.setCustomValidity('');
            }

            if (fieldOption.closest('.target')) {
              if (
                e.target.dataset['value'] !== 'Maintain' &&
                e.target.dataset['value'] !== ''
              ) {
                document
                  .querySelector('.targetWeight')
                  .classList.remove('hidden');
              } else {
                document.querySelector('.targetWeight').classList.add('hidden');
              }
            }
          }
        });
      });
    });
  }

  #numberOnlyField() {
    const numberOnlyFields = document.querySelectorAll('.numberOnly');

    numberOnlyFields.forEach((field) => {
      field.addEventListener('input', function (e) {
        if (e.data == '.') {
          if ((e.target.value.match(/\./g) || []).length > 1) {
            e.target.value = e.target.value.slice(0, -1);
          }
        } else if (e.data == 'e' || e.data == 'E') {
          if ((e.target.value.match(/[eE]/g) || []).length > 1) {
            e.target.value = e.target.value.slice(0, -1);
          }
        } else if (e.data !== null) {
          const numberRegex = /^[\+\-]?\d*\.?\d+(?:[Ee][\+\-]?\d+)?$/;
          if (!e.target.value.match(numberRegex)) {
            e.target.value = e.target.value.slice(0, -1);
          }
        }
      });

      ['input', 'focusout'].forEach((event) => {
        field.addEventListener(event, function (e) {
          console.log(isNaN(parseFloat(e.target.value)));
          if (isNaN(parseFloat(e.target.value))) {
            e.target.setCustomValidity(
              'Wrong number input format! Please input again!'
            );
          } else if (
            parseFloat(e.target.value) > 999 ||
            parseFloat(e.target.value) <= 0
          ) {
            e.target.setCustomValidity(
              'The input range must between 0 and 999! Please input again!'
            );
          } else {
            e.target.setCustomValidity('');
          }
        });
      });
    });
  }
}

export default CalculateForm;
