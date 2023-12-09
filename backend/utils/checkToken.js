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
  // const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NzQxZWRlN2U3ZTc5MzNjZDc1MjBhNSIsImlhdCI6MTcwMjEwODg5NSwiZXhwIjoxNzAyMTk1Mjk1fQ.UUQddW4hE1117B96ognslYm9aOTd4m7U_UILE3T9OKQ`;
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
