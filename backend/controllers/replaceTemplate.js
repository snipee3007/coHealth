const fs = require('fs');
const userController = require('./usersController');
const User = require('../models/users_schema');

const navigation = fs.readFileSync(
  `${__dirname}/../../frontend/template/navigation.html`,
  'utf-8'
);
const decoration = fs.readFileSync(
  `${__dirname}/../../frontend/template/decoration.html`,
  'utf-8'
);

exports.addNavigation = async (template, req) => {
  const user = await userController.getUserByToken(req);
  // console.log(user);
  template = template.replace(/{%NAVIGATION_BAR%}/g, navigation);
  if (user) {
    const link = `../images/users/profile/`;
    template = template.replace(/{%REGISTER_BUTTON%}/g, '');
    if (user.image) {
      const source = user.image !== '' ? link + user.image : '';
      template = template.replace(/{%PROFILE_SOURCE%}/g, source);
    } else {
      template = template.replace(
        /{%PROFILE_SOURCE%}/g,
        user.gender === 'male'
          ? link + 'menAnonymous.jpg'
          : link + 'womanAnonymous.jpg'
      );
    }
    const name =
      user.fullname.split(' ')[0] +
      ' ' +
      user.fullname.split(' ')[user.fullname.split(' ').length - 1];
    template = template.replace(/{%PROFILE_NAME%}/g, name);
    return template;
  }
  return template;
};

exports.addDecoration = (template) => {
  template = template.replace(/{%DECORATION%}/g, decoration);
  return template;
};
