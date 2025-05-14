const logger = require('./logger.js');

const returnData = (req, res, statusCode, data, message = '') => {
  const status =
    statusCode.toString().startsWith(2) || statusCode.toString().startsWith(3)
      ? 'success'
      : 'failed';
  if (statusCode.toString().startsWith(2)) {
    logger.info({
      ip: req.clientIp,
      method: req.method,
      url: req.originalUrl,
      message: status,
      params: Object.keys(req.params).length > 0 ? req.params : undefined,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      data,
    });
    return res.status(statusCode).json({
      status,
      data,
    });
  } else {
    logger.error({
      ip: req.clientIp,
      method: req.method,
      url: req.originalUrl,
      message: status,
      params: Object.keys(req.params).length > 0 ? req.params : undefined,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      data: Object.keys(data).length > 0 ? data : undefined,
    });
    return res.status(statusCode).json({
      status,
      message,
    });
  }
};

module.exports = returnData;
