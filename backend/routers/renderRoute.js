const express = require('express');
const template = require('./../controllers/templateController.js');
const authController = require('./../controllers/authController.js');
const adultCompendiumController = require('./../controllers/adultCompendiumController.js');
const router = express.Router();

router.use(authController.isSignedIn);

// HOMEPAGE
router.get(['/', '/home'], template.getHomePageTemplate);

// NEWS
router.get('/news', template.getNewsTemplate);
router.get('/news/:name', template.getNewsItemTemplate);

// Calculate BMI or TDEE
router.get('/calculate', template.getCalculateTemplate);

// Result after calculating BMI or TDEE
router.get('/result', template.getResultBMITemplate);

// Hospital
router.get('/hospital', template.getHospitalTemplate);

// Sign Up
router.get('/signUp', template.getsignUpTemplate);

// Sign In
router.get('/signIn', template.getsignInTemplate);

// Forgot Password
router.get('/forgotPassword', template.getForgotPasswordTemplate);

// User profile
router.get('/profile', template.getProfileTemplate);

// User account
router.get('/account', template.getAccountTemplate);

// User history calculate
router.get('/history', template.getHistoryTemplate);

// About us
router.get('/aboutUs', template.getAboutUsTemplate);

// Chat
router.get('/chat', template.getChatToDoctorsTemplate);

// Doctor
router.get('/doctor', template.getDoctorItemTemplate);

module.exports = router;
