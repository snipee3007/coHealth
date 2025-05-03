class CalculateBMI {
  constructor() {
    this.error = false;
    this.#selectField();
    this.#numberOnlyField();
    this.#activityHandle();
    this.#calculateMethod();
    this.#addActivityButton();
    this.#calculateButton();
    this.#targetWeightInputHandle();
  }

  #selectField() {
    ['gender', 'activityIntensity', 'target', 'speed', 'method'].forEach(
      (field) => {
        const fieldButton = document.querySelector(`.${field}Selected`);
        const fieldOptionList = document.querySelectorAll(`.${field}Option`);

        if (field !== 'method') fieldButton.classList.add('invalidInput');
        else fieldButton.classList.add('validInput');

        fieldButton.addEventListener('click', function (e) {
          if (e.target.closest(`.${field}Selected`)) {
            document
              .querySelector(`.${field}Options`)
              .classList.toggle('hidden');
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
              const fieldInput = document.querySelector(
                `input[name='${field}']`
              );
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
                  document.querySelector(
                    'input[name="speed"]'
                  ).disabled = false;
                } else {
                  document
                    .querySelector('.targetWeight')
                    .classList.add('hidden');
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
      }
    );
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
        // Check target weight input
        checkTargetInput.bind(this)();

        if (this.error) return;
        const gender = document
          .querySelector('input[name="gender"]')
          ?.value.toLowerCase();
        const age = document.querySelector('input[name="age"]')?.value;
        const height = document.querySelector('input[name="height"]')?.value;
        const weight = document.querySelector('input[name="weight"]')?.value;
        const target = document
          .querySelector('input[name="target"]')
          ?.value.toLowerCase();
        const targetWeight = document.querySelector(
          'input[name="targetWeight"]'
        )?.value;
        const speed = document
          .querySelector('input[name="speed"]')
          ?.value.toLowerCase();
        const calculateMethod = document.querySelector('input[name="method"]');
        let data;
        if (calculateMethod?.value == 'Normal TDEE') {
          const activityIntensity = document
            .querySelector('input[name="activityIntensity"]')
            ?.value.toLowerCase();

          // Post Data using normal TDEE
          data = {
            gender,
            age,
            height,
            weight,
            activityIntensity,
            target,
            speed,
            targetWeight,
            method: 'normal tdee',
          };
        } else {
          const activityItems = document.querySelectorAll('.activityItem');
          let activities = [];
          activityItems.forEach((item) => {
            activities.push({
              activityCode: item.querySelector('input[name="activityCode"]')
                .value,
              duration: item.querySelector('input[name="activityDuration"]')
                .value,
            });
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
            method: 'tee',
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
        document.querySelector('.activityIntensity').classList.remove('hidden');
        document.querySelector('.activities').classList.add('hidden');
      } else if (methodInput.value == 'TEE') {
        document.querySelector('.activities').classList.remove('hidden');
        document.querySelector('.activityIntensity').classList.add('hidden');
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
        ['activityName', 'activityDescription', 'activityDuration'].forEach(
          ((field) => {
            if (e.target.closest(`.${field}`)) {
              // Remove error String if click on activity button
              document.querySelector('.errorActivities').innerHTML = '';
              this.error = false;
              // Toggle view
              if (field !== 'activityDuration')
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

        // Input duration

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
              .querySelector('.activityDescriptionOptions'),
            activityNameInput.value
          );
        }

        // Pick intensity
        if (e.target.closest('.activityDescriptionOption')) {
          const option = e.target.closest('.activityDescriptionOption');
          const activityDescription = option
            .closest('.activityDescription')
            .querySelector('input[name="activityDescription"]');
          activityDescription.value = option.dataset['value'];
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
            !item.querySelector('input[name="activityCode"]').value ||
            item.querySelector('input[name="activityCode"]').value == '' ||
            !item.querySelector('input[name="activityDuration"]').value ||
            item.querySelector('input[name="activityDuration"]').value == ''
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

  #targetWeightInputHandle() {
    const targetWeightInput = document.querySelector(
      'input[name="targetWeight"]'
    );
    targetWeightInput.addEventListener('input', checkTargetInput.bind(this));
  }
}

// HELPER FUNCTION
const checkTargetInput = function () {
  const targetWeight = document.querySelector(
    'input[name="targetWeight"]'
  )?.value;
  const target = document
    .querySelector('input[name="target"]')
    ?.value.toLowerCase();
  const weight = document.querySelector('input[name="weight"]')?.value;
  if (weight) {
    this.error = false;
    document.querySelector('.errorTarget').textContent = '';
    if (
      (target == 'gain' && +targetWeight <= +weight) ||
      (target == 'lose' && +targetWeight >= +weight)
    ) {
      this.error = true;
      document.querySelector('.errorTarget').textContent =
        '*Please provide valid target weight!';
    } else {
      this.error = false;
      document.querySelector('.errorTarget').textContent = '';
    }
  } else {
    this.error = true;
    document.querySelector('.errorTarget').textContent =
      '*Please provide your weight!';
  }
};
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
          <input type='text' name='activityName' required placeholder='Name' onkeydown="return false" autocomplete='off' class="bg-transparent select-none outline-none cursor-pointer w-full" readOnly/>
          <img src='./../images/png/down-arrow-circle-svgrepo-com.png' class="h-4 w-4"/>
        </div>
        <div class="absolute w-full activityNameOptions z-40 max-h-44 overflow-y-auto hidden">
            <div data-value='' class='w-full bg-[#EAF0F7] cursor-pointer activityNameOption py-2 px-2 rounded-t-xl border-b'>Activity Name</div>
            ${optionsHTML}
        </div>
      </div>
      <div class="activityDescription relative">
        <div class="activityDescriptionSelected select-none cursor-pointer flex items-center justify-between py-2 bg-[#EAF0F7] px-3 rounded-xl w-full">
          <input type='text' name='activityDescription' required placeholder='Description' onkeydown="return false" autocomplete='off' class="bg-transparent select-none outline-none cursor-pointer w-full" readOnly/>
          <img src='./../images/png/down-arrow-circle-svgrepo-com.png' class="h-4 w-4"/>
        </div>
        <div class="absolute w-full activityDescriptionOptions z-40 max-h-44 overflow-y-auto hidden">
            <div data-value='' class='w-full bg-[#EAF0F7] cursor-pointer activityDescriptionOption py-2 px-2 rounded-xl'>No data</div>
        </div>
      </div>
      <div class="activityDuration relative form_row">
        <p class="font-AbhayaLibre absolute z-30 right-3 -translate-y-1/2 top-1/2">mins</p>
        <input class="w-full relative numberOnly inputCheck" name="activityDuration" placeholder="Duration" maxLength=3 />
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
      <div data-value='' class='w-full bg-[#EAF0F7] cursor-pointer activityDescriptionOption py-2 px-2 rounded-xl'>No data</div>
    `;
  else
    optionsHTML += `
    <div data-value='' class='w-full bg-[#EAF0F7] cursor-pointer activityDescriptionOption py-2 px-2 rounded-t-xl border-b'>Activity Intensity</div>
  `;
  data?.forEach((option, idx) => {
    if (idx == data.length - 1) {
      optionsHTML += `
      <div data-value='${option.description}' data-activitycode=${option.activityCode} class='w-full bg-[#EAF0F7] cursor-pointer activityDescriptionOption py-2 px-2 rounded-b-xl'>${option.description}</div>
    `;
    } else {
      optionsHTML += `
      <div data-value='${option.description}' data-activitycode=${option.activityCode} class='w-full bg-[#EAF0F7] cursor-pointer activityDescriptionOption py-2 px-2 border-b'>${option.description}</div>
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
    if (res.data.status == 'success') {
      window.location = '/result';
    }
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
