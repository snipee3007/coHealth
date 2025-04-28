class Result {
  tdeeUpper = 4000;
  tdeeLower = 0;
  bmiUpper = 40;
  bmiLower = 16;
  weekAfterToAchieveTargetUpper = 100;
  weekAfterToAchieveTargetLower = 0;

  #calculateData;
  async init() {
    await this.#getRecentCalculate();
    // this.#bmiRender();
    this.#valueCardRender();
    // this.#tdeeRender();
  }
  async #getRecentCalculate() {
    this.#calculateData = await getRecentCalculate();
    console.log(this.#calculateData);
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

  #tdeeRender() {
    // Get root attribute
    const r = document.querySelector(':root');

    // TDEE Circular Progress Bar
    const tdeeValue = this.#calculateData.result.tdee;
    const upperTDEE = 4000;
    const lowerTDEE = 0;
    if (tdeeValue < lowerTDEE) {
      r.style.setProperty('--tdeePercentage', 450);
    } else if (tdeeValue > upperTDEE) {
      r.style.setProperty('--tdeePercentage', 0);
    } else {
      const tdeePercentage = (tdeeValue - lowerTDEE) / (upperTDEE - lowerTDEE);
      r.style.setProperty('--tdeePercentage', 450 - 450 * tdeePercentage);
    }
  }
}

const getRecentCalculate = async function () {
  try {
    const res = await axios({
      method: 'get',
      url: '/api/result',
    });
    if (res.status == 204) {
      const calculateRes = await axios({
        method: 'post',
        url: 'api/calculate',
        data: JSON.parse(localStorage.getItem('calculateData')),
      });
      return {
        basicInfo: JSON.parse(localStorage.getItem('calculateData')),
        result: calculateRes.data.data,
      };
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
new Result().init();
