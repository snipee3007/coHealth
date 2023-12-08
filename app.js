const express = require('express');
const sessions = require('express-session');

const homePageRouter = require('./backend/routers/homePageRoutes.js');
const apiRouter = require('./backend/routers/apiRoutes.js');
const newsRouter = require('./backend/routers/newsRoutes.js');
const findHospitalRouter = require('./backend/routers/findHospitalRoutes.js');
const calculateBMIRouter = require('./backend/routers/calculateBMIRoutes.js');
const resultBMIRouter = require('./backend/routers/ResultBMIRoutes.js');
const signUpRouter = require('./backend/routers/signUpRoutes.js');
const userRouter = require('./backend/routers/userRoutes.js');
const loginRouter = require('./backend/routers/loginRoutes.js');
const forgetPasswordRouter = require('./backend/routers/forgetPasswordRoutes.js');

const profileRouter = require('./backend/routers/profileRoutes.js');
const accountRouter = require('./backend/routers/accountRoutes.js');
const historyRouter = require('./backend/routers/historyRoutes.js');

const globalErrorHandler = require('./backend/controllers/errorController.js');


const app = express();

const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');

// const oneDay = 1000 * 60 * 60 * 24;
// app.use(
//   sessions({
//     secret: 'thisismysecrctekeyfhrgfgrfrty84fwir767',
//     saveUninitialized: true,
//     cookie: { maxAge: oneDay },
//     resave: false,
//   })
// );
// app.use(cookieParser());

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/frontend`));

app.use('/', homePageRouter);
app.use('/news', newsRouter);
app.use('/calculateBMI', calculateBMIRouter);
app.use('/result', resultBMIRouter);
app.use('/findHospital', findHospitalRouter);
app.use('/signUp', signUpRouter);
app.use('/login', loginRouter);
app.use('/users', userRouter);
app.use('/api', apiRouter);
app.use('/forgetPassword', forgetPasswordRouter);
app.use('/profile', profileRouter);
app.use('/account', accountRouter);
app.use('/history', historyRouter);


app.use(globalErrorHandler);

module.exports = app;
