const User = require('../models/users_schema');
const authController = require('./../controllers/authController');

const checkTokenAndRedirect = async (req, res, next) => {
  const data = req.rawHeaders.find((str) => str.includes('jwt'));

  if (!data) {
    // console.error('No JWT header found');
    res.clearCookie('token'); // Clear cookie if it exists
    res.setHeader('token', '');
    return next();
  }

  const token = data.split(';').find((str) => str.includes('jwt'));

  if (!token) {
    // console.error('No JWT present in the header');
    res.clearCookie('token');
    res.setHeader('token', '');
    return next();
  }

  const user = await User.find({ token: token });

  if (user.length !== 0) {
    authController.protect(token, req, next);
    const json = `{"token":"${token}"}`;
    res.cookie('token', token);
    res.setHeader('token', json);
  } else {
    res.clearCookie('token');
    res.setHeader('token', '');
  }

  next();
};

module.exports = checkTokenAndRedirect;
