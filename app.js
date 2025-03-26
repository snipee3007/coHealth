const express = require('express');
const sessions = require('express-session');
const path = require('path');

const apiRouter = require('./backend/routers/apiRoutes.js');
const renderRouter = require('./backend/routers/renderRoute.js');

const globalErrorHandler = require('./backend/controllers/errorController.js');
const authController = require('./backend/controllers/authController.js');

const app = express();

const bodyParser = require('body-parser');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'frontend/template'));
app.use(express.static(path.join(__dirname, `frontend`)));

const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(authController.isSignedIn);
app.use('/', renderRouter);
app.use('/api', apiRouter);

app.use(globalErrorHandler);

module.exports = app;
