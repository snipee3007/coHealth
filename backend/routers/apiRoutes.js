const express = require('express');
const newsGetController = require('../controllers/newsGetController.js');
const hospitalsController = require('../controllers/hospitalsController');
const calculateRoutes = require('./api/calculateBMIRoutes.js');
const resultRoutes = require('./api/resultRoutes.js');
const adultCompendiumRoutes = require('./api/adultCompendiumRoutes.js');
const mealRoutes = require('./api/mealRoutes.js');
const userRoutes = require('./api/userRoutes.js');
const roomRoutes = require('./api/roomRoutes.js');
const commentRoutes = require('./api/commentRoute.js');

const appointmentRoutes = require('./api/appointmentRoutes.js');
const doctorRoutes = require('./api/doctorRoutes.js');
const authController = require('./../controllers/authController.js');
const router = express.Router();

// NEWS API
router.route('/get-6-nearest-news').get(newsGetController.get6NearsestNews);
router.route('/getAllNews').get(newsGetController.getAllNews);

// NEWS API
router.route('/news/:name').get(newsGetController.getNewsItem);

// COMMENT API
router.use('/comment', commentRoutes);

// HOSPITAL API
router.route('/hospitals').get(hospitalsController.getAllHospitals);

// CALCULATE API
router.use('/calculate', calculateRoutes);
router.use('/result', resultRoutes);
router.use('/adultCompendium', adultCompendiumRoutes);

// FOOD API
router.use('/meal', mealRoutes);

// SIGN IN API
router.post('/signUp', authController.signUp);

// SIGN UP API
router.post('/signIn', authController.signIn);

// SIGN UP API
router.post('/signOut', authController.signOut);

// USER API
router.use('/user', userRoutes);

// CHATROOM API
router.use('/room', roomRoutes);

// DOCTOR API
router.use('/doctor', doctorRoutes);
// APPOINTMENT API
router.use('/appointment', appointmentRoutes);

module.exports = router;
