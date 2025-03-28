class CalculateBMI {
  constructor() {
    this.error = false;
    this.#selectField();
    this.#numberOnlyField();
    this.#activityHandle();
    this.#calculateMethod();
    this.#addActivityButton();
    this.#calculateButton();
  }

  #selectField() {
    ['gender', 'training', 'target', 'speed', 'method'].forEach((field) => {
      const fieldButton = document.querySelector(`.${field}Selected`);
      const fieldOptionList = document.querySelectorAll(`.${field}Option`);

      if (field !== 'method') fieldButton.classList.add('invalidInput');
      else fieldButton.classList.add('validInput');

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
                document.querySelector(
                  'input[name="targetWeight"]'
                ).disabled = false;
                document.querySelector('.speed').classList.remove('hidden');
                document.querySelector('input[name="speed"]').disabled = false;
              } else {
                document.querySelector('.targetWeight').classList.add('hidden');
                document.querySelector(
                  'input[name="targetWeight"]'
                ).disabled = true;
                document.querySelector('.speed').classList.add('hidden');
                document.querySelector('input[name="speed"]').disabled = true;
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
          if (e.target.value == '') {
            e.target.setCustomValidity(`Please input ${e.target.name} value!`);
          } else if (isNaN(parseFloat(e.target.value))) {
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

  #calculateButton() {
    const calculateForm = document.querySelector('.calculateForm');
    calculateForm.addEventListener(
      'submit',
      function (e) {
        e.preventDefault();
        console.log(this);
        if (this.error) return;
        const gender = document.querySelector('input[name="gender"]')?.value;
        const age = document.querySelector('input[name="age"]')?.value;
        const height = document.querySelector('input[name="height"]')?.value;
        const weight = document.querySelector('input[name="weight"]')?.value;
        const target = document.querySelector('input[name="target"]')?.value;
        const speed = document.querySelector('input[name="speed"]')?.value;
        const targetWeight = document.querySelector(
          'input[name="targetWeight"]'
        )?.value;
        const calculateMethod = document.querySelector('input[name="method"]');
        let data;
        if (calculateMethod?.value == 'Normal TDEE') {
          const training = document.querySelector(
            'input[name="training"]'
          )?.value;

          // Post Data using normal TDEE
          data = {
            gender,
            age,
            height,
            weight,
            training,
            target,
            speed,
            targetWeight,
            method: 'Normal TDEE',
          };
        } else {
          const activityItems = document.querySelectorAll('.activityItem');
          let activities = [];
          activityItems.forEach((item) => {
            activities.push(
              item.querySelector('input[name="activityCode"]').value
            );
          });

          // Post data using calculating TEE based on specific activity
          data = {
            gender,
            age,
            height,
            weight,
            activities,
            target,
            speed,
            targetWeight,
            method: 'TEE',
          };
        }

        calculateAPI(data);
      }.bind(this)
    );
  }

  #calculateMethod() {
    const methodInput = document.querySelector('input[name="method"]');
    setInterval(function () {
      if (methodInput.value == 'Normal TDEE') {
        document.querySelector('.trainingIntensity').classList.remove('hidden');
        document.querySelector('.activities').classList.add('hidden');
      } else if (methodInput.value == 'TEE') {
        document.querySelector('.activities').classList.remove('hidden');
        document.querySelector('.trainingIntensity').classList.add('hidden');
      }
    }, 200);
  }

  #addActivityButton() {
    const addActivityButton = document.querySelector('.addActivityButton');
    addActivityButton.addEventListener(
      'click',
      function (e) {
        if (e.target.closest('.addActivityButton')) {
          // Remove error String if click on activity button
          document.querySelector('.errorActivities').innerHTML = '';
          this.error = false;
          getAllActivityNames();
        }
      }.bind(this)
    );
  }
  #activityHandle() {
    // Render Handle Function
    document.addEventListener(
      'click',
      function (e) {
        // Toggle activity menu option
        ['activityName', 'activityIntensity'].forEach(
          ((field) => {
            if (e.target.closest(`.${field}`)) {
              // Remove error String if click on activity button
              document.querySelector('.errorActivities').innerHTML = '';
              this.error = false;
              // Toggle view
              if (
                e.target
                  .closest(`.${field}`)
                  .querySelector(`.${field}Options`)
                  .classList.contains('hidden')
              ) {
                const activityName = e.target.closest(`.${field}`);
                document
                  .querySelectorAll(`.${field}Options`)
                  .forEach((option) => option.classList.add('hidden'));
                activityName
                  .querySelector(`.${field}Options`)
                  .classList.remove('hidden');
              } else {
                const activityName = e.target.closest(`.${field}`);

                activityName
                  .querySelector(`.${field}Options`)
                  .classList.toggle('hidden');
              }
            } else {
              document
                .querySelectorAll(`.${field}Options`)
                .forEach((option) => option.classList.add('hidden'));
            }
          }).bind(this)
        );

        // Delete activity
        if (e.target.closest('.activityDelete')) {
          e.target.closest('.activityDelete').closest('.activityItem').remove();
        }

        // Pick activity
        if (e.target.closest('.activityNameOption')) {
          const option = e.target.closest('.activityNameOption');
          const activityNameInput = option
            .closest('.activityName')
            .querySelector('input[name="activityName"]');
          activityNameInput.value = option.dataset['value'];
          getCurrentActivityDescription(
            option
              .closest('.activityItem')
              .querySelector('.activityIntensityOptions'),
            activityNameInput.value
          );
        }

        // Pick intensity
        if (e.target.closest('.activityIntensityOption')) {
          const option = e.target.closest('.activityIntensityOption');
          const activityIntensity = option
            .closest('.activityIntensity')
            .querySelector('input[name="activityIntensity"]');
          activityIntensity.value = option.dataset['value'];
          e.target
            .closest('.activityItem')
            .querySelector('input[name="activityCode"]').value =
            option.dataset['activitycode'];
        }
      }.bind(this)
    );

    // Check Input Data Handle Function
    document.querySelector('.calculateForm').addEventListener(
      'submit',
      function (e) {
        if (
          document.querySelector('input[name="method"]').value == 'Normal TDEE'
        )
          return;
        const activityItems = document.querySelectorAll('.activityItem');
        let errorStr = '';
        // Check if no activity input
        if (activityItems.length == 0) {
          e.preventDefault();
          this.error = true;
          errorStr = 'Please input your activities!';
        }

        // If added activities but not enough information about those add activities
        for (let i = 0; i < activityItems.length; ++i) {
          const item = activityItems[i];
          if (
            !item.querySelector('input[name="activityCode"]').value &&
            item.querySelector('input[name="activityCode"]').value == ''
          ) {
            e.preventDefault();
            this.error = true;
            errorStr =
              'Please fill out all the informations of your activities!';
            break;
          }
        }
        if (this.error) {
          document.querySelector('.errorActivities').innerHTML = errorStr;
        }
      }.bind(this)
    );
  }
}

// HELPER FUNCTION
const renderActivityNameOption = function (data) {
  let optionsHTML = ``;
  data.forEach((option, idx) => {
    if (idx == data.length - 1) {
      optionsHTML += `
      <div data-value='${option}' class='w-full bg-[#EAF0F7] cursor-pointer activityNameOption py-2 px-2 rounded-b-xl'>${option}</div>
      `;
    } else {
      optionsHTML += `
      <div data-value='${option}' class='w-full bg-[#EAF0F7] cursor-pointer activityNameOption py-2 px-2 border-b'>${option}</div>
      `;
    }
  });
  const html = `
    <div class="activityItem flex flex-row items-center gap-4 w-full mb-6">
      <input type='hidden' name='activityCode'/>
      <div class="activityName relative">
        <div class="activityNameSelected select-none cursor-pointer flex items-center justify-between py-2 bg-[#EAF0F7] px-3 rounded-xl w-full">
          <input type='text' name='activityName' required placeholder='Activity name' onkeydown="return false" autocomplete='off' class="bg-transparent select-none outline-none cursor-pointer w-full" readOnly/>
          <img src='./../images/png/down-arrow-circle-svgrepo-com.png' class="h-4 w-4"/>
        </div>
        <div class="absolute w-full activityNameOptions z-40 max-h-44 overflow-y-auto hidden">
            <div data-value='' class='w-full bg-[#EAF0F7] cursor-pointer activityNameOption py-2 px-2 rounded-t-xl border-b'>Activity Name</div>
            ${optionsHTML}
        </div>
      </div>
      <div class="activityIntensity relative">
        <div class="activityIntensitySelected select-none cursor-pointer flex items-center justify-between py-2 bg-[#EAF0F7] px-3 rounded-xl w-full">
          <input type='text' name='activityIntensity' required placeholder='Activity Intensity' onkeydown="return false" autocomplete='off' class="bg-transparent select-none outline-none cursor-pointer w-full" readOnly/>
          <img src='./../images/png/down-arrow-circle-svgrepo-com.png' class="h-4 w-4"/>
        </div>
        <div class="absolute w-full activityIntensityOptions z-40 max-h-44 overflow-y-auto hidden">
            <div data-value='' class='w-full bg-[#EAF0F7] cursor-pointer activityIntensityOption py-2 px-2 rounded-xl'>No data</div>
        </div>
      </div>
      <div class="activityDelete border-dashed border rounded-full w-6 h-6 cursor-pointer text-center flex justify-center items-center shrink-0">-</div>
    </div>
  `;
  document
    .querySelector('.addActivityButton')
    .insertAdjacentHTML('beforebegin', html);
};

const renderActivityDescriptionOption = function (container, data) {
  let optionsHTML = '';
  if (!data || data.length == 0)
    optionsHTML += `
      <div data-value='' class='w-full bg-[#EAF0F7] cursor-pointer activityIntensityOption py-2 px-2 rounded-xl'>No data</div>
    `;
  else
    optionsHTML += `
    <div data-value='' class='w-full bg-[#EAF0F7] cursor-pointer activityIntensityOption py-2 px-2 rounded-t-xl border-b'>Activity Intensity</div>
  `;
  data?.forEach((option, idx) => {
    if (idx == data.length - 1) {
      optionsHTML += `
      <div data-value='${option.description}' data-activitycode=${option.activityCode} class='w-full bg-[#EAF0F7] cursor-pointer activityIntensityOption py-2 px-2 rounded-b-xl'>${option.description}</div>
    `;
    } else {
      optionsHTML += `
      <div data-value='${option.description}' data-activitycode=${option.activityCode} class='w-full bg-[#EAF0F7] cursor-pointer activityIntensityOption py-2 px-2 border-b'>${option.description}</div>
    `;
    }
  });
  container.innerHTML = '';
  container.insertAdjacentHTML('beforeend', optionsHTML);
};

// AXIOS
const calculateAPI = async function (data) {
  try {
    localStorage.getItem('calculateData') &&
      localStorage.removeItem('calculateData');
    localStorage.setItem('calculateData', JSON.stringify(data));
    const res = await axios({
      method: 'post',
      url: '/api/calculate',
      data,
    });
    window.location = '/result';
  } catch (err) {
    console.log(err);
  }
};

const getAllActivityNames = async function () {
  try {
    const res = await axios({
      method: 'get',
      url: '/api/adultCompendium/getAllNames',
    });
    if (res.data.status == 'success') {
      renderActivityNameOption(res.data.data);
    }
  } catch (err) {
    console.log(err);
  }
};

const getCurrentActivityDescription = async function (container, activity) {
  try {
    if (activity == '') {
      console.log('Hello');
      renderActivityDescriptionOption(container);
      return;
    }
    const res = await axios({
      method: 'get',
      url: `/api/adultCompendium/getDescription/${activity}`,
    });
    if (res.data.status == 'success') {
      renderActivityDescriptionOption(container, res.data.data);
    }
  } catch (err) {
    console.log(err);
  }
};
new CalculateBMI();
