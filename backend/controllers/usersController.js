const User = require('./../models/users_schema');
const bcrypt = require('bcryptjs');
const authController = require('./authController');

exports.signup = async (req, res) => {
  // console.log('Received POST request at /signup');
  try {
    // Extract user input from request body

    const {
      email,
      password,
      gender,
      birthdate,
      firstName,
      lastName,
      confirmPassword,
    } = req.body;
    console.log(req.body);
    // Perform validation, sanitation, etc.

    // Create a new user instance with the provided data
    console.log(firstName, lastName);
    let newUser = new User({
      email: email,
      gender: gender,
      // height: req.body.height,
      // weight: req.body.weight,
      fullname: firstName.trim() + ' ' + lastName.trim(),
      birthdate: birthdate,
      address: 'lmao lmao',
      phoneNum: '0835599955',
      password: password,
      confirmPassword: confirmPassword,
    });

    // Save the new user to the database
    await newUser.save();

    authController.createSendToken(newUser, 201, res);

    // res.status(200).json({
    //   status: 'success',
    //   message: `Successfully signup with email: ${req.body.email}`,
    // });
    res.redirect('/home');

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
      authController.createSendToken(user, 200, res);
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
