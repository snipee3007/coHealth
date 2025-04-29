class Result {
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
    await this.#getFoodData();
    // this.#bmiRender();
    this.#valueCardRender();
    this.#weeksRender();
  }
  async #getRecentCalculate() {
    this.#calculateData = await getRecentCalculate();
  }

  async #getFoodData() {
    this.#foodData = await getFoodValue();
    console.log(this.#foodData);
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
        console.log(`${field} step:`, fieldStep);
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
    } else if (this.#calculateData.result.bmiStatus.startsWith('Obese')) {
      bmiStatus.classList.add('text-red-500');
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
    console.log(weekCaloriesList);
    const weeksContainer = document.querySelector('.weeksContainer');

    weekCaloriesList.forEach((value, idx) => {
      const weekItemHTML = `
        <div class="swiper swiper-slide cursor-pointer week-${
          idx + 1
        } border border-[#B7B7B7] py-2 px-3 w-full text-center ">
          
          <div class="weekLabel"> Week ${idx + 1} </div>
          <div class=""weekCalories>(${value}cal)</div>
        </div>
      `;
      weeksContainer.insertAdjacentHTML('beforeend', weekItemHTML);
    });
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
    console.log('hello');
  }
};

const getFoodValue = async function (calories) {
  try {
    const res = await axios({
      method: 'get',
      url: `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=7dKdZHhuY8s4r8Os7xijqGyBaCeJHagOhgxqrtCA&query=vegetable`,
    });
    console.log(res);
  } catch (err) {
    console.log('hello');
  }
};
new Result().init();
