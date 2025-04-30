const express = require('express');
const template = require('./../controllers/templateController.js');
const authController = require('./../controllers/authController.js');
const chatToDoctorController = require('./../controllers/chatToDoctorController.js');
const userAppointmentController = require('./../controllers/userAppointmentController.js');
const adultCompendiumController = require('./../controllers/adultCompendiumController.js');
const resultController = require('./../controllers/resultController.js');
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
router.get('/result/:id', template.getResultBMITemplate);

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
router.get('/healthHistory', template.getHealthHistoryTemplate);

// About us
router.get('/aboutUs', template.getAboutUsTemplate);

// Doctor
router.get('/doctor', template.getDoctorsTemplate);
router.get('/doctor/:name', template.getDoctorItemTemplate);

// Chat
router.get(
  '/chat',
  authController.restrictTo([]),
  chatToDoctorController.getAllChatRoomByUserID,
  template.getListOfChatTemplate
);

// APPOINTMENT
router.get('/appointment', template.getAppointmentTemplate);

// hàm dưới này là hiển thị trước 5 appointments cho user đã đăng nhập
router.get(
  '/appointment/list',
  authController.restrictTo([]),
  userAppointmentController.getAppointment,
  template.getListAppointmentTemplate
);

// lấy thông tin chi tiết cuộc hẹn
router.get(
  '/appointment/list/:appointmentCode',
  authController.restrictTo([]),
  userAppointmentController.getAppointmentDetails,
  template.getAppointmentDetailsTemplate
);

module.exports = router;
