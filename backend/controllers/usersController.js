const User = require('./../models/users_schema');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res) => {
  try {
    await User.create(req.body);
    res.status(200).json({
      status: 'success',
      message: `Successfully signup with email: ${req.body.email}`,
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: `Error code ${err.code}: ${err.message}`,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    // console.log(user);
    // console.log(user.password);
    const match = await bcrypt.compare(req.body.password, user.password);
    // console.log(match);
    if (match) {
      res.status(200).json({
        status: 'success',
        message: 'Login success',
      });
    } else throw new Error('Wrong email or password!');

    next();
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err.message,
    });
  }
};
