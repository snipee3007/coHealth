const User = require('./../models/users_schema');

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
      message: `Could not sign up user, ${err}`,
    });
  }
};
