const fs = require('fs');

const navigation = fs.readFileSync(
  `${__dirname}/../../frontend/template/navigation.html`,
  'utf-8'
);
const language = fs.readFileSync(
  `${__dirname}/../../frontend/template/languageNavigationBar.html`,
  'utf-8'
);

const signin = fs.readFileSync(
  `${__dirname}/../../frontend/template/signinNavigationBar.html`,
  'utf-8'
);

const register = fs.readFileSync(
  `${__dirname}/../../frontend/template/registerNavigationBar.html`,
  'utf-8'
);

const decoration = fs.readFileSync(
  `${__dirname}/../../frontend/template/decoration.html`,
  'utf-8'
);


const profile = fs.readFileSync(
  `${__dirname}/../../frontend/template/profile.html`,
  'utf-8'
);


exports.addNavigation = (template) => {
  template = template.replace(/{%NAVIGATION_BAR%}/g, navigation);
  template = template.replace(/{%LANGUAGE_SELECTION%}/g, language);
  template = template.replace(/{%SIGN_IN_BUTTON%}/g, signin);
  template = template.replace(/{%REGISTER_BUTTON%}/g, register);
  return template;
};

exports.addDecoration = (template) => {
  template = template.replace(/{%DECORATION%}/g, decoration);
  return template;
};

exports.addNavigationAfterSign = (template) => {
  template = template.replace(/{%NAVIGATION_BAR%}/g, navigation);
  template = template.replace(/{%LANGUAGE_SELECTION%}/g, language);
  template = template.replace(/{%SIGN_IN_BUTTON%}/g, signin);
  template = template.replace(/{%REGISTER_BUTTON%}/g, profile);
  return template;
}