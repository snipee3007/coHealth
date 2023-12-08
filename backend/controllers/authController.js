const { promisify } = require('util');
const catchAsync = require('./../utils/catchAsync.js');
const jwt = require('jsonwebtoken');
const User = require('./../models/users_schema');
const AppError = require('./../utils/appError.js');

const signToken = (id) => {
  // console.log(process.env.JWT_EXPIRES_IN);
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  // console.log(user);

  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res) => {
  // console.log('Received POST request at /signup');

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
  // console.log(req.body);
  // Perform validation, sanitation, etc.

  // Create a new user instance with the provided data
  // console.log(firstName, lastName);
  const newUser = await User.create({
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
  createSendToken(newUser, 201, res);
  // res.redirect('/home');
});

exports.login = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  const { email, password } = req.body;
  // console.log('This is a email: ', email, '. This is a password: ', password);
  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (token, req, next) => {
  // 1) Getting token and check of it's there

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});
