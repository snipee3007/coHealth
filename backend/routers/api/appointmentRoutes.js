const express = require('express');
const authController = require('../../controllers/authController.js');
const appointmentController = require('./../../controllers/appointmentController.js');
const userAppointmentController = require('./../../controllers/userAppointmentController.js');

const router = express.Router();

// tạo appointment mới
router.post(
  '/create',
  authController.isSignedIn,
  appointmentController.createAppointment
);

// lấy dữ tất cả các appointment để làm cái khóa giờ appointment
router.get(
  '/get',
  authController.isSignedIn,
  appointmentController.getAllAppointment
);

// chỉ cho bác sĩ chọn là đồng ý hoặc 0 đồng ý cuộc hẹn
router.post(
  '/update',
  authController.protect,
  userAppointmentController.updateAppointment
);

// hàm này để phân trang appointment trong profile user mà người dùng đã đặt
router.get(
  '/list/get',
  authController.protect,
  userAppointmentController.getAppointmentEachPage
);

// hàm này để gửi email đến cho người dùng là appointment như thế nào
router.post(
  '/sendEmail',
  authController.protect,
  userAppointmentController.sendEmail
);

module.exports = router;
