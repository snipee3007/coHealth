import News from './newsController.js';
import NewsItem from './newsItemController.js';
import Slider from './sliderController.js';
import Navbar from './navbarController.js';
import Login from './login.js';
import BMI from './calculate.js';
import signup from './signup.js';

const init = async function () {
  if (
    window.location.pathname === '/home' ||
    window.location.pathname === '/aboutUs' ||
    window.location.pathname === '/'
  ) {
    new Slider();
  }
  if (window.location.pathname === '/news') {
    await News.run();
  }
  if (window.location.pathname.includes('/news/')) {
    await NewsItem.run(window.location.pathname.replace('/news/', ''));
  }

  if (window.location.pathname === '/login') {
    await Login.login();
  }
  if (window.location.pathname === '/signUp') {
    await signup.signup();
  }
  if (window.location.pathname.includes('/result')) {
    BMI.renderBMIDescription();
    BMI.renderCaloriesDescription();
    // await CalculateBMI.renderBreakfast();
  }

  Navbar.init();
};
init();
