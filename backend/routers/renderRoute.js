const express = require('express');
const template = require('./../controllers/templateController.js');
const authController = require('./../controllers/authController.js');
const chatToDoctorController = require('./../controllers/chatToDoctorController.js');
const userAppointmentController = require('./../controllers/userAppointmentController.js');
const notificationController = require('./../controllers/notificationController.js');
const newsController = require('./../controllers/newsController.js');
const commentController = require('./../controllers/commentController.js');
const adultCompendiumController = require('./../controllers/adultCompendiumController.js');
const resultController = require('./../controllers/resultController.js');
const symptomHistoryController = require('./../controllers/symptomHistoryController.js');
const router = express.Router();

router.use(authController.isSignedIn);

// HOMEPAGE
router.get(['/', '/home'], template.getHomePageTemplate);

// NEWS
router.get('/news', template.getNewsTemplate);
router.get(
  '/news/:name',
  newsController.getNews,
  commentController.getComments,
  notificationController.updateReadNotification,
  template.getNewsItemTemplate
);

// NEWS UPLOAD
router.get('/upload', template.getUploadTemplate);

// Calculate BMI or TDEE
router.get('/calculate', template.getCalculateTemplate);

// Result after calculating BMI or TDEE
router.route(['/result', '/result/:id']).get(template.getResultBMITemplate);

// Hospital
router.get('/hospital', template.getHospitalTemplate);

// Sign Up
router.get('/signUp', template.getsignUpTemplate);

// Sign In
router.get('/signIn', template.getsignInTemplate);

// Forgot Password
router.get('/forgotPassword', template.getForgotPasswordTemplate);

// Reset Password
router
  .route('/resetPassword/:token')
  .get(authController.checkResetToken, template.getResetPasswordTemplate);

// User profile
router.get(
  '/profile',
  authController.restrictTo(['user', 'doctor']),
  template.getProfileTemplate
);

// User history calculate
router.get(
  '/healthHistory',
  authController.restrictTo(['user', 'doctor']),
  symptomHistoryController.getAll,
  template.getHealthHistoryTemplate
);

// About us
router.get('/aboutUs', template.getAboutUsTemplate);

// Doctor
router.get('/doctor', template.getDoctorsTemplate);
router.get('/doctor/:name', template.getDoctorItemTemplate);

// Chat
router.get(
  '/chat',
  authController.restrictTo(['user', 'doctor']),
  chatToDoctorController.getAllChatRoomByUserID,
  template.getListOfChatTemplate
);

// APPOINTMENT
router.get('/appointment', template.getAppointmentTemplate);

// hàm dưới này là hiển thị trước 5 appointments cho user đã đăng nhập
router.get(
  '/appointment/list',
  authController.restrictTo(['user', 'doctor']),
  userAppointmentController.getAppointment,
  template.getListAppointmentTemplate
);

// lấy thông tin chi tiết cuộc hẹn
router.get(
  '/appointment/list/:appointmentCode',
  authController.restrictTo(['user', 'doctor']),
  userAppointmentController.getAppointmentDetails,
  template.getAppointmentDetailsTemplate
);

router.get(
  '/symptom',
  symptomHistoryController.getHistory,
  template.getSymptomCheckerTemplate
);

router.get('/changePassword', template.getChangePasswordTemplate);

router.get(
  '/admin',
  authController.restrictTo(['admin']),
  template.getAdminTemplate
);

module.exports = router;
