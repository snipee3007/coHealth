import News from './newsController.js';
import NewsItem from './newsItemController.js';
import Navbar from './navbarController.js';
import SignIn from './signIn.js';
import CalculateForm from './calculateController.js';
import SignUp from './signup.js';
import Slider from './sliderController.js';
import Profile from './profileController.js';
import Doctor from './doctorsController.js';
import Chat from './chatToDoctorController.js';
import ListOfChat from './listOfChatController.js';
// import Hospital from "./findHospitalController.js"

const init = async function () {
  if (
    window.location.pathname === '/home' ||
    window.location.pathname === '/'
  ) {
    new Slider();
  }
  if (window.location.pathname === '/news') {
    new News();
  }
  if (window.location.pathname.includes('/news/')) {
    new NewsItem(window.location.pathname.replace('/news/', ''));
  }
  if (window.location.pathname === '/doctor') {
    new Chat();
  }
  if(window.location.pathname === '/chat'){
    ListOfChat;
  }
  if (window.location.pathname === '/signIn') {
    await SignIn.init();
  }
  if (window.location.pathname === '/signUp') {
    await SignUp.init();
  }
  if (window.location.pathname.includes('/calculate')) {
    new CalculateForm();
    // await CalculateBMI.renderBreakfast();
  }
  // if (window.location.pathname === '/findHospital') {
  //   await Hospital.init();
  // }
  if (window.location.pathname.includes('/profile')) {
    new Profile();
  }
  new Navbar();
};
init();
