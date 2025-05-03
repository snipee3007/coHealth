const { promisify } = require('util');
const catchAsync = require('./../utils/catchAsync.js');
const jwt = require('jsonwebtoken');
const User = require('./../models/users_schema');
const AppError = require('./../utils/appError.js');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const Email = require('../utils/email.js');
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
  } else {
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
    return next();
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    res.clearCookie('jwt');
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.isSignedIn = async (req, res, next) => {
  try {
    // 1) Getting token and check of it's there
    if (req.cookies && req.cookies.jwt) {
      // 2) Verification token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 3) Check if user still exists
      const currentUser = await User.findById(decoded.id).populate(
        'doctorInfo'
      );
      if (!currentUser) {
        res.clearCookie('jwt');
        return next();
      }

      // 4) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        res.clearCookie('jwt');
        return next();
      }

      // GRANT ACCESS TO PROTECTED ROUTE !! THIS IS FOR PUG TEMPLATE
      res.locals.user = currentUser;
      req.user = currentUser;
      return next();
    }
    next();
  } catch (err) {
    res.clearCookie('jwt');
    next();
  }
};

exports.signOut = catchAsync(async (req, res, next) => {
  // trước khi signOut tìm người dùng rồi chuyển status từ on sang off
  const decoded = await promisify(jwt.verify)(
    req.cookies.jwt,
    process.env.JWT_SECRET
  );

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return;
  } else {
    await User.findOneAndUpdate(
      { _id: currentUser._id },
      { status: 'offline', lastSeen: new Date() },
      { new: true }
    );
  }
  // sau đó thì xóa cookie như bình thường

  res.clearCookie('jwt');
  res.status(204).json();
});

exports.getOTP = catchAsync(async function (req, res, next) {
  const data = req.body;
  const acc = await User.findOne({ email: data.email });
  if (acc) {
    return next(
      new AppError(
        'Email người dùng này đã tồn tại! Vui lòng sử dụng email khác!'
      )
    );
  }
  if (req.user) {
    res.writeHead(302, 'Already Login! You will be redirect to homepage!', {
      location: '/',
    });
    res.end();
  }
  try {
    let otp = speakeasy.totp({
      secret: process.env.OTP_SECRET,
      encoding: 'base64',
      algorithm: 'sha256',
      step: process.env.OTP_EXPIRES_IN,
      window: 10,
    });
    const user = {
      otp,
      email: data.email,
    };
    await new Email(user).sendOTP();
    res.status(200).json({
      status: 'success',
      message: `Đã gửi mã OTP qua email ${data.email} thành công`,
    });
  } catch (err) {
    console.log(err);
    return next(
      new AppError(
        'Có lỗi xảy ra trong việc gửi email! Vui lòng thử lại sau!',
        500
      )
    );
  }
});

exports.restrictTo = (role) => {
  return (req, res, next) => {
    let authenticate = false;
    for (let i = 0; i < role.length; ++i) {
      if (
        req.user &&
        (req.user.role.includes(role[i]) || req.user.role.includes('admin'))
      ) {
        authenticate = true;
        break;
      }
    }
    if (!authenticate) {
      res.writeHead(302, 'Unauthentication user!', { location: '/' });
      return res.end();
    } else {
      next();
    }
  };
};

exports.restrictToAPI = (role) => {
  return (req, res, next) => {
    let authenticate = false;
    for (let i = 0; i < role.length; ++i) {
      if (
        req.user &&
        (req.user.role.includes(role[i]) || req.user.role.includes('admin'))
      ) {
        authenticate = true;
        break;
      }
    }
    if (!authenticate) {
      res.status(401).json({
        status: 'failed',
        message: 'Bạn không có quyền sử dụng tính năng này!',
      });
    } else {
      next();
    }
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError(
        'There is no user that have this email in our database! Please use another email!.',
        404
      )
    );
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await User.findByIdAndUpdate(
    user.id,
    {
      passwordResetToken: user.passwordResetToken,
      passwordResetExpires: user.passwordResetExpires,
    },
    { runValidators: true }
  );

  // 3) Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token has been sent through email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(err);
    return next(
      new AppError('There is a error when sending email! Please try again!'),
      500
    );
  }
});

exports.checkResetToken = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    res.writeHead(302, 'Token expired!', { location: '/' });
    res.end();
  } else {
    next();
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;

  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // 3) Update changedPasswordAt property for the user
  user.changedPasswordAt = Date.now();

  // 4) Log the user in, send JWT
  await user.save();
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.changedPasswordAt = Date.now();

  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});
