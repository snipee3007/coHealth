const express = require('express');
const newsGetController = require('../controllers/newsGetController.js');
const hospitalsController = require('../controllers/hospitalsController');
const foodsController = require('../controllers/foodsController');
const calculateRoutes = require('./api/resultBMIRoutes.js');
const adultCompendiumRoutes = require('./api/adultCompendiumRoutes.js');
const userRoutes = require('./api/userRoutes.js');
const roomRoutes = require('./api/roomRoutes.js');
const appointmentRoutes = require('./api/appointmentRoutes.js');
const doctorRoutes = require('./api/doctorRoutes.js');
const authController = require('./../controllers/authController.js');
const router = express.Router();

// NEWS API
router.route('/get-6-nearest-news').get(newsGetController.get6NearsestNews);
router.route('/getAllNews').get(newsGetController.getAllNews);

// NEWS API
router.route('/news/:name').get(newsGetController.getNewsItem);

// HOSPITAL API
router.route('/hospitals').get(hospitalsController.getAllHospitals);

// FOOD API
router.route('/getRandomBreakfast').get(foodsController.getRandomBreakfast);
router.route('/getRandomLunch').get(foodsController.getRandomLunch);
router.route('/getRandomTea').get(foodsController.getRandomTea);
router.route('/getRandomDinner').get(foodsController.getRandomDinner);

// CALCULATE API
router.use('/calculate', calculateRoutes);
router.use('/adultCompendium', adultCompendiumRoutes);

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
