import { resize } from './utils/overlaySizeHandle.js';
import Loader from './utils/loader.js';

class Result {
  #bodyHeight;
  tdeeUpper = 4000;
  tdeeLower = 0;
  bmiUpper = 40;
  bmiLower = 16;
  weekAfterToAchieveTargetUpper = 100;
  weekAfterToAchieveTargetLower = 0;

  #calculateData;
  #foodData;
  #exercises;
  async init() {
    await this.#getRecentCalculate();
    this.#valueCardRender();
    this.#selectField();
    this.#suggestExerciseButton();
    this.#exerciseFormSubmit();
    // Sử dụng thì bỏ comment hai dòng dưới là được!
    await this.#getFoodData(this.#calculateData.result.caloriesIntakeList[0]);
    this.#weeksRender();

    this.#dayHandler();
    this.#overlayHandler();
  }
  async #getRecentCalculate() {
    if (window.location.pathname.split('/').length == 2)
      this.#calculateData = await getRecentCalculate();
    else if (window.location.pathname.split('/').length == 3) {
      this.#calculateData = await getCalculate();
    }
  }

  async #getFoodData(calories) {
    this.#foodData = await getFoodValue(calories);
    this.#mealRender('monday');
  }

  #selectField() {
    [
      'exerciseLevel',
      'exerciseMechanic',
      'exerciseEquipment',
      'exercisePrimaryMuscles',
      'exerciseCategory',
    ].forEach((field) => {
      const fieldButton = document.querySelector(`.${field}Selected`);
      const fieldOptionList = document.querySelectorAll(`.${field}Option`);

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
          }
        });
      });
    });
  }

  #suggestExerciseButton() {
    document
      .querySelector('.exerciseQuestionContainer')
      .addEventListener('click', function (e) {
        if (e.target.closest('.exerciseQuestionContainer')) {
          e.target
            .closest('.exerciseQuestionContainer')
            .classList.add('hidden');
          document.querySelector('.exerciseForm').classList.remove('hidden');
        }
      });
  }

  #exerciseFormSubmit() {
    document.querySelector('.exerciseForm').addEventListener(
      'submit',
      async function (e) {
        e.preventDefault();
        const level = document.querySelector(
          'input[name="exerciseLevel"]'
        )?.value;
        const mechanic = document.querySelector(
          'input[name="exerciseMechanic"]'
        )?.value;
        const equipment = document.querySelector(
          'input[name="exerciseEquipment"]'
        )?.value;
        const primaryMuscles = document.querySelector(
          'input[name="exercisePrimaryMuscles"]'
        )?.value;
        const category = document.querySelector(
          'input[name="exerciseCategory"]'
        )?.value;
        const exercises = await exerciseQuery({
          level,
          mechanic,
          equipment,
          primaryMuscles,
          category,
        });
        document.querySelector(
          '.resultNumber'
        ).textContent = `Result(s): ${exercises.length}`;
        this.renderExercises(exercises);
      }.bind(this)
    );
  }

  #overlayHandler() {
    document.querySelectorAll('.overlay').forEach((overlay) =>
      overlay.addEventListener(
        'click',
        function (e) {
          if (e.target == e.target.closest('.overlay')) {
            e.target.closest('.overlay').classList.add('hidden');
            e.target
              .closest('.overlay')
              .querySelector('.popupContainer')
              .classList.add('opacity-0', 'pointer-events-none');
            document.querySelector('.body').style.height = '';
          }
        }.bind(this)
      )
    );

    document.querySelectorAll('.closeButton').forEach((button) =>
      button.addEventListener(
        'click',
        function (e) {
          if (e.target.closest('.closeButton')) {
            e.target.closest('.overlay').classList.add('hidden');
            document.querySelector('.body').style.height = '';
            e.target
              .closest('.popupContainer')
              .classList.add('opacity-0', 'pointer-events-none');
          }
        }.bind(this)
      )
    );
  }

  #valueCardRender() {
    const r = document.querySelector(':root');
    ['bmi', 'tdee', 'weekAfterToAchieveTarget'].forEach(
      ((field) => {
        // Field Circular Progress Bar
        const fieldValue = this.#calculateData.result[field];
        const upperValue = this[`${field}Upper`];
        const lowerValue = this[`${field}Lower`];
        if (fieldValue < lowerValue) {
          r.style.setProperty(`--${field}Percentage`, 450);
        } else if (fieldValue > upperValue) {
          r.style.setProperty(`--${field}Percentage`, 0);
        } else {
          const fieldPercentage =
            (fieldValue - lowerValue) / (upperValue - lowerValue);
          r.style.setProperty(
            `--${field}Percentage`,
            450 - 450 * fieldPercentage
          );
        }

        // Field Number
        const fieldNumber = document.querySelector(`.${field}_number`);
        let fieldStart = 0;
        const fieldResult = this.#calculateData.result[field];

        const fieldStep = fieldResult / (1000 / 50);
        for (let i = 0; i < 1000; ++i) {}
        const fieldInterval = setInterval(
          function () {
            if (field == 'bmi') {
              if (fieldStart.toFixed(1) == this.#calculateData.result[field]) {
                clearInterval(fieldInterval);
              }
              fieldNumber.textContent = fieldStart.toFixed(1);
            } else {
              if (Math.round(fieldStart) == this.#calculateData.result[field]) {
                clearInterval(fieldInterval);
              }
              fieldNumber.textContent = Math.round(fieldStart);
            }
            fieldStart += fieldStep;
          }.bind(this),
          50
        );
      }).bind(this)
    );
    this.#bmiStatusRender();
    this.#tdeeStatusRender();
  }

  #bmiStatusRender() {
    // BMI Status
    const bmiStatus = document.querySelector('.bmi_status');
    if (this.#calculateData.result.bmiStatus.startsWith('Underweight')) {
      bmiStatus.classList.add('text-[#2A9FF3]');
    } else if (this.#calculateData.result.bmiStatus.startsWith('Normal')) {
      bmiStatus.classList.add('text-[#28D74E]');
    } else if (this.#calculateData.result.bmiStatus.startsWith('Overweight')) {
      bmiStatus.classList.add('text-red-400');
    } else if (this.#calculateData.result.bmiStatus.startsWith('Obese')) {
      bmiStatus.classList.add('text-red-700', 'font-bold');
    }
    bmiStatus.textContent = this.#calculateData.result.bmiStatus;
  }

  #tdeeStatusRender() {
    // BMI Status
    const tdeeStatus = document.querySelector('.tdee_status');
    tdeeStatus.textContent = `${
      this.#calculateData.result.tdee
    } (+/- ${Math.round((this.#calculateData.result.tdee * 10) / 100)})`;
  }

  #weeksRender() {
    const swiper = new Swiper('.swiper', { slidesPerView: 7 });
    const weekCaloriesList = this.#calculateData.result.caloriesIntakeList;
    const weeksContainer = document.querySelector('.weeksContainer');

    weekCaloriesList.forEach((value, idx) => {
      const weekItemHTML = `
        <div class="swiper swiper-slide cursor-pointer weekItem week-${
          idx + 1
        } ${
        idx == 0 ? 'activeWeek' : ''
      } border border-[#B7B7B7] py-2 px-3 w-full text-center" data-calories="${value}">
          
          <div class="weekLabel"> Week ${idx + 1} </div>
          <div class=""weekCalories>(${value}cal)</div>
        </div>
      `;
      weeksContainer.insertAdjacentHTML('beforeend', weekItemHTML);
    });
    const weeks = document.querySelectorAll('.weekItem');
    weeks.forEach(
      ((week) => {
        week.addEventListener(
          'click',
          async function (e) {
            if (e.target.closest('.weekItem')) {
              document.querySelectorAll('.weekItem').forEach((week) => {
                week.classList.remove('activeWeek');
              });
              e.target.closest('.weekItem').classList.add('activeWeek');
              await this.#getFoodData(
                e.target.closest('.weekItem').dataset['calories']
              );
            }
          }.bind(this)
        );
      }).bind(this)
    );
  }

  #dayHandler() {
    const days = document.querySelectorAll('.day');
    days.forEach(
      ((day) => {
        day.addEventListener(
          'click',
          function (e) {
            if (e.target.closest('.day')) {
              this.#mealRender(e.target.dataset['day']);
              document.querySelectorAll('.day').forEach((day) => {
                day.classList.remove('activeMealDay');
              });
              e.target.closest('.day').classList.add('activeMealDay');
              document.querySelector('.mealInformationLabel span').textContent =
                e.target.dataset['day'][0].toUpperCase() +
                e.target.dataset['day'].slice(1);
            }
          }.bind(this)
        );
      }).bind(this)
    );
  }

  #mealRender(day) {
    const mealType = {
      0: 'Breakfast',
      1: 'Lunch',
      2: 'Dinner',
    };

    const mealItemContainer = document.querySelector('.mealItemContainer');
    mealItemContainer.innerHTML = '';
    mealItemContainer.classList.add('translate-y-10');
    const meals = this.#foodData[day].meals;
    const mealNutrients = this.#foodData[day].nutrients;
    // Create new meal item card element
    meals.forEach((meal, idx) => {
      const mealItem = document.createElement('div');
      mealItem.classList.add(
        'mealItem',
        'breakfast',
        'w-full',
        'flex',
        'justify-center',
        'relative',
        'cursor-pointer'
      );
      const mealImage = document.createElement('img');
      mealImage.src = `/images/png/imageLoader.gif`;
      mealImage.alt = mealType[`${idx}`];
      mealImage.dataset[
        'src'
      ] = `https://img.spoonacular.com/recipes/${meal.id}-556x370.jpg`;
      mealImage.addEventListener('load', function (e) {
        e.target.src = e.target.dataset['src'];
      });
      mealImage.classList.add('brightness-50', 'w-2/3', 'rounded-xl');

      const mealLabel = document.createElement('div');
      mealLabel.classList.add(
        'mealLabel',
        'absolute',
        '-translate-y-1/2',
        'top-1/2',
        'z-20',
        'text-white',
        'font-AbhayaLibre',
        'text-lg'
      );
      mealLabel.textContent = mealType[`${idx}`];
      mealItem.append(mealImage, mealLabel);

      // Create a addEventListener for each mealItem
      mealItem.addEventListener('click', function (e) {
        if (e.target.closest('.mealItem')) {
          document.querySelector('.mealInfoTable .name').textContent =
            meal.title;
          document.querySelector('.mealInfoTable .cooking_time').textContent =
            meal.readyInMinutes + ' minutes';
          document.querySelector('.mealInfoTable .serving').textContent =
            meal.servings;
          document.querySelector('.mealInfoTable .moreInfoLink').href =
            meal.sourceUrl;
          document.querySelector('.mealPopup').classList.remove('hidden');
          document.querySelector(
            '.popupMealImage'
          ).src = `https://img.spoonacular.com/recipes/${meal.id}-556x370.jpg`;
          document.querySelector('.mealType').textContent = mealType[`${idx}`];
          resize();
        }

        setTimeout(function () {
          document
            .querySelector('.mealPopupContainer')
            .classList.remove('opacity-0', 'pointer-events-none');
        }, 200);
      });

      mealItemContainer.insertAdjacentElement('beforeend', mealItem);
    });
    document.querySelector('.caloriesValue').textContent =
      mealNutrients.calories;
    document.querySelector('.proteinValue').textContent = mealNutrients.protein;
    document.querySelector('.fatValue').textContent = mealNutrients.fat;
    document.querySelector('.carbohydratesValue').textContent =
      mealNutrients.carbohydrates;
    mealItemContainer.classList.remove('translate-y-10');
  }

  renderExercises(exercises) {
    document
      .querySelector('.exerciseItemsContainer')
      .classList.remove('hidden');
    document.querySelector('.exerciseItemsContainer').innerHTML = '';
    let elementList = [];
    exercises.forEach((exercise) => {
      const exerciseItem = document.createElement('div');
      exerciseItem.classList.add(
        'exerciseItem',
        'flex',
        'flex-1',
        'items-center',
        'justify-evenly',
        'gap-12',
        'shadow-xl',
        'rounded-xl',
        'py-4',
        'px-8',
        'mb-12',
        'cursor-pointer',
        'w-full',
        'h-60',
        'border',
        'border-groove'
      );
      let html = ` 
        <img src="/images/exercises/${exercise.images[0]}" alt="${exercise.name} Image" class="w-1/3 h-full object-contain"/>
        <div class='exerciseInfo flex flex-col gap-1 w-2/3'>
          <div class="exerciseNameContent text-2xl font-ABeeZee">${exercise.name}</div>
          <div class="exerciseLevel flex flex-1 gap-12">
            <div class="exerciseLevelLabel w-32">Level: </div>
            <div class="exerciseLevelContent">${exercise.level}</div>
          </div>
          <div class="exerciseMechanic flex flex-1 gap-12">
            <div class="exerciseMechanicLabel w-32">Mechanic: </div>
            <div class="exerciseMechanicContent">${exercise.mechanic}</div>
          </div>
          <div class="exerciseEquipment flex flex-1 gap-12">
            <div class="exerciseEquipmentLabel w-32">Equipment: </div>
            <div class="exerciseEquipmentContent">${exercise.equipment}</div>
          </div>
          <div class="exercisePrimaryMuscles flex flex-1 gap-12">
            <div class="exercisePrimaryMusclesLabel w-32">Primary Muscles: </div>
            <div class="exercisePrimaryMusclesContent">${exercise.primaryMuscles}</div>
          </div>
          <div class="exerciseCategory flex flex-1 gap-12">
            <div class="exerciseCategoryLabel w-32">Category: </div>
            <div class="exerciseCategoryContent">${exercise.category}</div>
          </div>
        </div>
      `;
      exerciseItem.insertAdjacentHTML('afterbegin', html);
      exerciseItem.addEventListener(
        'click',
        function (e) {
          if (e.target.closest('.exerciseItem')) {
            for (const [key, value] of Object.entries(exercise)) {
              if (key == 'instructions') {
                const info = document.querySelector(
                  `.exerciseInfoTable .${key}`
                );
                let listItem = document.createElement('ul');
                listItem.classList.add('overflow-y-auto');
                exercise.instructions.forEach((value) => {
                  const item = document.createElement('li');
                  item.classList.add('list-disc', 'list-inside', 'max-h-96');
                  item.textContent = value;
                  listItem.append(item);
                });
                info.innerHTML = '';
                info.append(listItem);
              } else if (key == 'images') {
                let html = '';
                for (let i = 0; i < 2; ++i) {
                  if (exercise.images[i]) {
                    html += `<img src="/images/exercises/${exercise.images[i]}" alt="${exercise.name} ${i}" class="rounded-xl exercisePopupImage w-2/5"/>`;
                  }
                }
                document.querySelector('.exerciseImages').innerHTML = '';
                document
                  .querySelector('.exerciseImages')
                  .insertAdjacentHTML('beforeend', html);
              } else {
                const info = document.querySelector(
                  `.exerciseInfoTable .${key}`
                );
                if (info)
                  info.textContent = Array.isArray(value)
                    ? value.join(', ')
                    : value;
              }
            }
            document.querySelector('.exercisePopup').classList.remove('hidden');

            document.querySelector('.exerciseName').textContent = exercise.name;
            resize();
          }

          setTimeout(function () {
            document
              .querySelector('.exercisePopupContainer')
              .classList.remove('opacity-0', 'pointer-events-none');
          }, 200);
        }.bind(this)
      );
      elementList.push(exerciseItem);
    });
    document.querySelector('.exerciseItemsContainer').append(...elementList);
  }
}

const getRecentCalculate = async function () {
  try {
    Loader.create();
    const res = await axios({
      method: 'get',
      url: '/api/result',
    });
    if (res.status == 204) {
      Loader.destroy();
      if (localStorage.getItem('calculateData')) {
        const calculateRes = await axios({
          method: 'post',
          url: 'api/calculate',
          data: JSON.parse(localStorage.getItem('calculateData')),
        });
        return {
          basicInfo: JSON.parse(localStorage.getItem('calculateData')),
          result: calculateRes.data.data,
        };
      } else {
        window.location = '/calculate';
      }
    } else if (res.status == 200) {
      Loader.destroy();
      return {
        basicInfo: res.data.data[0].basicInfo,
        result: res.data.data[0].result,
      };
    }
  } catch (err) {
    Loader.destroy();
    if (
      err.status == 400 &&
      err.response.data.message.startsWith('No calculation before')
    ) {
      window.location = '/calculate';
    }
  }
};

const getCalculate = async function () {
  try {
    const id = window.location.pathname.split('/')[2];
    Loader.create();
    const res = await axios({
      method: 'get',
      url: `/api/result/${id}`,
    });
    if (res.status == 204) {
      Loader.destroy();
      if (localStorage.getItem('calculateData')) {
        const calculateRes = await axios({
          method: 'post',
          url: 'api/calculate',
          data: JSON.parse(localStorage.getItem('calculateData')),
        });
        return {
          basicInfo: JSON.parse(localStorage.getItem('calculateData')),
          result: calculateRes.data.data,
        };
      } else {
        window.location = '/calculate';
      }
    } else if (res.status == 200) {
      Loader.destroy();
      return {
        basicInfo: res.data.data.basicInfo,
        result: res.data.data.result,
      };
    }
  } catch (err) {
    Loader.destroy();
    if (err.status == 400 && err.response.data.data.length == 0) {
      window.location = '/calculate';
    }
  }
};

const getFoodValue = async function (calories) {
  try {
    Loader.create();
    const res = await axios({
      method: 'post',
      url: `/api/meal`,
      data: { calories },
    });
    Loader.destroy();
    return res.data.data;
  } catch (err) {
    Loader.destroy();
  }
};

const exerciseQuery = async function (data) {
  try {
    Loader.create();
    let queryString = [];
    if (data.level) queryString.push(`level=${data.level}`);
    if (data.mechanic) queryString.push(`mechanic=${data.mechanic}`);
    if (data.equipment) queryString.push(`equipment=${data.equipment}`);
    if (data.primaryMuscles)
      queryString.push(`primaryMuscles=${data.primaryMuscles}`);
    if (data.category) queryString.push(`category=${data.category}`);
    queryString = queryString.join('&');
    const res = await axios({
      method: 'get',
      url: `/api/exercise?${queryString}`,
    });

    Loader.destroy();
    return res.data.data;
  } catch (err) {
    Loader.destroy();
  }
};

new Result().init();
