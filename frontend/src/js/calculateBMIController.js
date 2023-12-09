const breakfastContainer = document.querySelector('.breakfast');
const lunchContainer = document.querySelector('.lunch');
const teaContainer = document.querySelector('.tea');
const dinnerContainer = document.querySelector('.dinner');
const gymContainer = document.querySelector('.gym');
const aerobicsContainer = document.querySelector('.aerobics');
const exerciseContainer = document.querySelector('.exercise');

class CalculateBMI {
  async renderBreakfast() {
    console.log(breakfastContainer);
    const breakfast = await fetch('/api/getRandomBreakfast')
      .then((data) => data.json())
      .then((data) => data.data);
    const arr = window
      .getComputedStyle(breakfastContainer)
      ['background-image'].split(', ');
    const background = arr
      .map(function (str, i) {
        if (str.includes('url')) {
          return (arr[i] = `url("${breakfast.link}")`);
        } else {
          return '';
        }
      })
      .join('');
    console.log(background);
    breakfastContainer.style.backgroundImage = `url('')`;
  }
}

export default new CalculateBMI();
