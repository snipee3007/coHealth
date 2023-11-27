const appError = function (error, code) {
  const newError = new Error();
  if (code === 11000) {
    const dupAt = Object.keys(error.keyPattern)[0];
    if (dupAt === 'email') {
      newError.message =
        'This email had been used by different account. Please use different email!';
      newError.code = 11000;
      return newError;
    }
  } else {
    newError.message = error.message;
    newError.code = code;
    return newError;
  }
};

module.exports = appError;
