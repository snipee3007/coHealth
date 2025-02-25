const breakfastContainer = document.querySelector('.breakfast');

class CalculateBMI {
  async renderBreakfast() {
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
    breakfastContainer.style.backgroundImage = `url('')`;
  }
}

new CalculateBMI();
