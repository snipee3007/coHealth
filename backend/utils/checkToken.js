const template = require('../controllers/templateController');
const User = require('../models/users_schema');
const authController = require('./../controllers/authController');

const checkTokenAndRedirect = async (req, res, next) => {
  const data = req.rawHeaders.filter((str) => str.includes('jwt'))[0];
  const token = data
    .split(';')
    .filter((str) => str.includes('jwt'))[0]
    .replace('jwt=', '')
    .trim();
  const users = await User.find();
  if (users.length !== 0) {
    const user = await User.find({ token: token });

    if (user) {
      // console.log(token);
      //
      authController.protect(token, req, next);
      const json = `{"token":"${token}"}`;
      res.cookies = token;
      res.setHeader('token', json);
    } else {
      res.cookies = '';
      res.setHeader('token', '');
    }
  } else {
    res.cookies = '';
    res.setHeader('token', '');
  }
  next();
};

module.exports = checkTokenAndRedirect;
