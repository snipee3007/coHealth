const express = require('express');
const newsController = require('../controllers/newsController.js');
const hospitalsController = require('../controllers/hospitalsController');
const calculateRoutes = require('./api/calculateBMIRoutes.js');
const resultRoutes = require('./api/resultRoutes.js');
const adultCompendiumRoutes = require('./api/adultCompendiumRoutes.js');
const mealRoutes = require('./api/mealRoutes.js');
const exerciseRoutes = require('./api/exerciseRoutes.js');
const userRoutes = require('./api/userRoutes.js');
const roomRoutes = require('./api/roomRoutes.js');
const commentRoutes = require('./api/commentRoute.js');
const notificationRoute = require('./api/notificationRoutes.js');
const appointmentRoutes = require('./api/appointmentRoutes.js');
const doctorRoutes = require('./api/doctorRoutes.js');
const symptomRoutes = require('./api/symptomRoutes.js');
const diseaseRoutes = require('./api/diseaseRoutes.js');
const historyRoutes = require('./api/historyRoutes.js');

const authController = require('./../controllers/authController.js');
const router = express.Router();

// NEWS API
router.route('/get-6-nearest-news').get(newsController.get6NearsestNews);
router.route('/getAllNews').get(newsController.getAllNews);
router
  .route('/news')
  .post(
    authController.protect,
    authController.restrictToAPI(['doctor']),
    newsController.uploadImages,
    newsController.resizeImages,
    newsController.createNews
  );
router
  .route('/news/:name')
  .get(newsController.getNewsItem)
  .delete(
    authController.protect,
    authController.restrictToAPI(['admin']),
    newsController.deleteNews
  );

// COMMENT API
router.use('/comment', commentRoutes);

// HOSPITAL API
router
  .route('/hospital')
  .post(
    authController.protect,
    authController.restrictToAPI(['admin']),
    hospitalsController.createHospital
  );
router
  .route('/hospital/:id')
  .delete(
    authController.protect,
    authController.restrictToAPI(['admin']),
    hospitalsController.deleteHospital
  );
router.route('/hospitals').get(hospitalsController.getAllHospitals);
router
  .route('/hospitals/nearest')
  .get(hospitalsController.getAllNearestHospitals);

// CALCULATE API
router.use('/calculate', calculateRoutes);
router.use('/result', resultRoutes);
router.use('/adultCompendium', adultCompendiumRoutes);

// FOOD API
router.use('/meal', mealRoutes);

// EXERCISE API
router.use('/exercise', exerciseRoutes);

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

// NOTIFICATION API
router.use('/notification', notificationRoute);
// SYMPTOM API
router.use('/symptom', symptomRoutes);

// DISEASE API
router.use('/disease', diseaseRoutes);

// HISTORY API
router.use('/history', historyRoutes);

module.exports = router;
