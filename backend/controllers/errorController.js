const AppError = require('../utils/appError.js');
const logger = require('../utils/logger.js');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // console.log(err);

  const message = `Duplicate field email value. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    if (err.code == '11000') {
      const errKeys = Object.keys(err.keyPattern);
      if (
        errKeys.length == 2 &&
        errKeys.includes('doctorID') &&
        errKeys.includes('time')
      ) {
        err.message = `This time has already taken by someone else! Please try different time`;
      } else {
        err.message = `This ${
          Object.keys(err.keyValue)[0]
        } has already taken! Please use another ${
          Object.keys(err.keyValue)[0]
        }!`;
      }
    }
    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;
    error.data = req.body;
    error.statusCode = err.statusCode;
    if (error.name === 'CastError') error = handleCastErrorDB(err);
    if (error.statusCode === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    logger.error({
      ip: req.clientIp,
      method: req.method,
      url: req.originalUrl,
      message: error.message,
      params: Object.keys(req.params).length > 0 ? req.params : undefined,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      data: Object.keys(req.body).length > 0 ? req.body : undefined,
    });
    sendErrorProd(error, res);
  }
};
