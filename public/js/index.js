import dropdownMenu from './languageDropDownMenu.js';
import navigation from './navigationController.js';
import { currentActive } from './navigationController.js';
import underline from './underline.js';

const init = function () {
  navigation.updateClick();

  underline.render(currentActive);
  dropdownMenu();
};
init();
