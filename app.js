const express = require('express');
const sessions = require('express-session');
const path = require('path');

const homePageRouter = require('./backend/routers/homePageRoutes.js');
const apiRouter = require('./backend/routers/apiRoutes.js');
const newsRouter = require('./backend/routers/newsRoutes.js');
const findHospitalRouter = require('./backend/routers/findHospitalRoutes.js');
const calculateRouter = require('./backend/routers/calculateRoutes.js');
const resultBMIRouter = require('./backend/routers/ResultBMIRoutes.js');
const signUpRouter = require('./backend/routers/signUpRoutes.js');

const userRouter = require('./backend/routers/userRoutes.js');
const signInRouter = require('./backend/routers/signInRoutes.js');
const aboutUsRouter = require('./backend/routers/aboutUsRoutes.js');

const chatToDoctorRouter = require('./backend/routers/chatToDoctorRoutes.js');
const doctorRouter = require('./backend/routers/doctorRoutes.js');
const forgetPasswordRouter = require('./backend/routers/forgetPasswordRoutes.js');

const profileRouter = require('./backend/routers/profileRoutes.js');
const accountRouter = require('./backend/routers/accountRoutes.js');
const historyRouter = require('./backend/routers/historyRoutes.js');

const globalErrorHandler = require('./backend/controllers/errorController.js');
const authController = require('./backend/controllers/authController.js');


const app = express();


const bodyParser = require('body-parser');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'frontend/template'));
app.use(express.static(path.join(__dirname, `frontend`)));

const cookieParser = require('cookie-parser');

const oneDay = 1000 * 60 * 60 * 24;



app.use(express.json());
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(authController.isSignedIn);
app.use('/', homePageRouter);
app.use('/news', newsRouter);
app.use('/calculate', calculateRouter);
app.use('/result', resultBMIRouter);
app.use('/findHospital', findHospitalRouter);
app.use('/signUp', signUpRouter);
app.use('/signIn', signInRouter);
app.use('/users', userRouter);
app.use('/api', apiRouter);
app.use('/forgetPassword', forgetPasswordRouter);
app.use('/profile', profileRouter);
app.use('/account', accountRouter);
app.use('/history', historyRouter);
app.use('/aboutUs', aboutUsRouter);
app.use('/chat', chatToDoctorRouter);
app.use('/doctor', doctorRouter);

app.use(globalErrorHandler);

module.exports = app;
