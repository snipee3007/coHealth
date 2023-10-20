import dropdownMenu from './languageDropDownMenu.js';
import navigation from './navigationController.js';
import { currentActive } from './navigationController.js';
import underline from './underline.js';
import slider from './sliderController.js';

const init = function () {
  navigation.updateClick();
  slider.run();
  underline.run();

  dropdownMenu();
};
init();
