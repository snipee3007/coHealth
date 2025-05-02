const returnData = (res, statusCode, data, message = '') => {
  const status =
    statusCode.toString().startsWith(2) || statusCode.toString().startsWith(3)
      ? 'success'
      : 'failed';

  if (statusCode.toString().startsWith(2))
    return res.status(statusCode).json({
      status,
      data,
    });
  else {
    return res.status(statusCode).json({
      status,
      message,
    });
  }
};

module.exports = returnData;
