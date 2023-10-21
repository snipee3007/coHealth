import dropdownMenu from './languageDropDownMenu.js';
import navigation from './navigationController.js';
import { currentActive } from './navigationController.js';
import underline from './underline.js';
import slider from './sliderController.js';
import features from './featuresController.js';

const init = function () {
  navigation.updateClick();
  slider.run();
  underline.run();
  features.render();
  dropdownMenu();
};
init();
