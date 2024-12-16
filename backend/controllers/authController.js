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

const createSendToken = async (user, statusCode, res) => {
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
  user.token = token;
  // user.password = undefined;
  // console.log('Old user: ', user);
  user = await user.save({ validateBeforeSave: false });
  // console.log('New user: ', user);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  // console.log('Received POST request at /signUp');

  // Extract user input from request body
  const {
    email,
    password,
    gender,
    yearOfBirth,
    fullname,
    confirmPassword,
    image,
  } = req.body;
  // console.log(req.body);

  // Perform validation, sanitation, etc.

  // Create a new user instance with the provided data
  const newUser = await User.create({
    email,
    password,
    gender,
    yearOfBirth,
    fullname,
    confirmPassword,
    image,
  });

  await createSendToken(newUser, 201, res);
});

exports.signIn = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  const { signInField, password } = req.body;
  // console.log('This is a email: ', email, '. This is a password: ', password);
  // 1) Check if email and password exist
  if (!signInField || !password) {
    return next(
      new AppError('Please provide Email/Username and password!', 400)
    );
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({
    $or: [{ email: signInField }, { username: signInField }],
  }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email/username or password', 401));
  }

  await createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
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
    res.clearCookie('jwt');
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    res.clearCookie('jwt');
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  // next();
});

exports.isSignedIn = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  if (req.cookies && req.cookies.jwt) {
    // 2) Verification token
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      res.clearCookie('jwt');
      return next();
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      res.clearCookie('jwt');
      return next();
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    res.locals.user = currentUser;
    return next();
  }
  next();
});
