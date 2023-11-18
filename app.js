const express = require('express');

const homePageRouter = require('./backend/routers/homePageRoutes.js');
const apiRouter = require('./backend/routers/apiRoutes.js');
const newsRouter = require('./backend/routers/newsRoutes.js');
const findHospitalRouter = require('./backend/routers/findHospitalRoutes.js');
const calculateBMIRouter = require('./backend/routers/calculateBMIRoutes.js');
const userRouter = require('./backend/routers/userRoutes.js');

const app = express();

app.use(express.json());
app.use(express.static(`${__dirname}/frontend`));

app.use('/', homePageRouter);
app.use('/news', newsRouter);
app.use('/calculateBMI', calculateBMIRouter);
app.use('/findHospital', findHospitalRouter);
app.use('/api', apiRouter);
app.use('/users', userRouter);

module.exports = app;
