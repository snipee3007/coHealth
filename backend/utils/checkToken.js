const template = require('../controllers/templateController');
const User = require('../models/users_schema');
const authController = require('./../controllers/authController');

const checkTokenAndRedirect = async (req, res, next) => {
  const token = res.socket.parser.socket._httpMessage.req.cookies.jwt;
  //   console.log(token);
  const users = await User.find();
  if (users.length !== 0) {
    const user = await User.find({ token: token });
    if (user) {
      authController.protect(token, req, next);
      const json = `{"token":"${token}"}`;
      res.socket.parser.socket._httpMessage.req.cookies.jwt = token;
      res.setHeader('token', json);
    } else {
      res.socket.parser.socket._httpMessage.req.cookies.jwt = '';
      res.setHeader('token', '');
    }
  } else {
    res.socket.parser.socket._httpMessage.req.cookies.jwt = '';
    res.setHeader('token', '');
  }
  next();
};

module.exports = checkTokenAndRedirect;
