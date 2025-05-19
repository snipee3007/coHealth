const express = require('express');
const sessions = require('express-session');
const path = require('path');
const scheduleController = require('./backend/controllers/scheduleController.js');
const apiRouter = require('./backend/routers/apiRoutes.js');
const renderRouter = require('./backend/routers/renderRoute.js');
const globalErrorHandler = require('./backend/controllers/errorController.js');
const cors = require('cors');

// Limit number of access
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

// Just for 404 not found page
const templateController = require('./backend/controllers/templateController.js');
const app = express();
app.use(express.json());

// app.enable('trust proxy');
app.use(cors());
app.options('*', cors());

// Request IP
const requestIp = require('request-ip');
app.use(requestIp.mw());

// Parse cookie to json
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const bodyParser = require('body-parser');
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'frontend/template'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.static(path.join(__dirname, `frontend`)));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(scheduleController.cancelAppointment);
app.use('/api', limiter);

app.use('/', renderRouter);
app.use('/api', apiRouter);

app.use('*', templateController.getNotFoundTemplate);

// Use Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
