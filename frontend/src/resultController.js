import { resize } from './utils/overlaySizeHandle.js';
import Loader from './utils/loader.js';
let firstReload = true;
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
  async init() {
    await this.#getRecentCalculate();
    this.#valueCardRender();
    // await this.#getFoodData(this.#calculateData.result.caloriesIntakeList[0]);

    this.#weeksRender();
    // this.#dayHandler();
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

  #overlayHandler() {
    document.querySelector('.overlay').addEventListener(
      'click',
      function (e) {
        if (e.target == document.querySelector('.overlay')) {
          document.querySelector('.overlay').classList.add('hidden');
          document
            .querySelector('.mealPopupContainer')
            .classList.add('opacity-0', 'pointer-events-none');
          document.querySelector('.body').style.height = '';
        }
      }.bind(this)
    );

    document.querySelector('.closeButton').addEventListener(
      'click',
      function (e) {
        document.querySelector('.overlay').classList.add('hidden');
        document.querySelector('.body').style.height = '';
        document
          .querySelector('.mealPopupContainer')
          .classList.add('opacity-0', 'pointer-events-none');
      }.bind(this)
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
}

const getRecentCalculate = async function () {
  try {
    const res = await axios({
      method: 'get',
      url: '/api/result',
    });
    if (res.status == 204) {
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
      return {
        basicInfo: res.data.data[0].basicInfo,
        result: res.data.data[0].result,
      };
    }
  } catch (err) {
    if (err.status == 400 && err.response.data.data.length == 0) {
      window.location = '/calculate';
    }
  }
};

const getCalculate = async function () {
  try {
    const id = window.location.pathname.split('/')[2];
    const res = await axios({
      method: 'get',
      url: `/api/result/${id}`,
    });
    if (res.status == 204) {
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
      console.log(res);
      return {
        basicInfo: res.data.data.basicInfo,
        result: res.data.data.result,
      };
    }
  } catch (err) {
    if (err.status == 400 && err.response.data.data.length == 0) {
      window.location = '/calculate';
    }
  }
};

const getFoodValue = async function (calories) {
  try {
    Loader.create();
    const res = await axios({
      method: 'get',
      url: `https://api.spoonacular.com/mealplanner/generate?targetCalories=${calories}&timeFrame=week`,
      headers: {
        'X-Api-Key': 'b52c1a0b52284c0eaa86faf51e1f01f7',
      },
    });
    Loader.destroy();
    return res.data.week;
  } catch (err) {
    Loader.destroy();
  }
};
new Result().init();
