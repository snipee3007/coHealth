const User = require('./../models/users_schema');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res) => {
  // console.log('Received POST request at /signup');
  try {
    // Extract user input from request body
    const {firstName,lastName ,email, password,  gender, confirmPassword } = req.body;

    // Perform validation, sanitation, etc.

    // Create a new user instance with the provided data
    let newUser = new User({
      email: email,
      gender: gender,
      fullname: firstName + lastName,
      birthdate: '2003-07-30',
      password: password,
      confirmPassword: confirmPassword,
      address: 'lmao lmao',
      phoneNum: '0835599955',
      history: {
        takeDate: '2023-18-11',
        height: 181,
        weight: 100,
        activityPerWeek: 'seDentary',
      },
    });

    // Save the new user to the database
    await newUser.save();

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
