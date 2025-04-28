let number = document.getElementById('number');
let counter = 0;

const r = document.querySelector(':root');
console.log(getComputedStyle(r).getPropertyValue('--percentage'));
setInterval(() => {
  if (counter == 65) {
    clearInterval;
  } else {
    counter += 1;
    number.innerHTML = `${counter}%`;
  }
}, 15);
