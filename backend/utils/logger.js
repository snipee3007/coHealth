const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { combine, timestamp, printf } = winston.format;

const fs = require('fs');

const today = new Date(Date.now());
let filenameStr = `${today.getDate().toString().padStart(2, '0')}-${(
  today.getMonth() + 1
)
  .toString()
  .padStart(2, '0')}-${today.getFullYear()}`;
let i = 0;
let file = fs.existsSync(`${__dirname}/../../log/${filenameStr}-${i}.log`);

filenameStr += `-${i}.log`;

const transportInfo = new winston.transports.DailyRotateFile({
  level: 'info',
  filename: './log/info/%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  zippedArchive: false,
  maxFiles: '14d',
});

const transportError = new winston.transports.DailyRotateFile({
  level: 'error',
  filename: './log/error/%DATE%-error.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  zippedArchive: false,
  maxFiles: '14d',
});

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    printf(
      (info) =>
        `${info.timestamp}: ${info.ip} [${info.method}] [${info.level}]: URL: ${
          info.url
        }, status: ${info.message}${
          info.params ? `, params: ${JSON.stringify(info.params)}` : ''
        }${info.query ? `, query: ${JSON.stringify(info.query)}` : ''}${
          info.data ? `, data: ${JSON.stringify(info.data)}` : ''
        }`
    )
  ),
  transports: [
    // new winston.transports.Console(),
    transportError,
    transportInfo,
  ],
});

module.exports = logger;
