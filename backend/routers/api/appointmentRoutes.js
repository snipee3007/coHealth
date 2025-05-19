const express = require('express');
const authController = require('../../controllers/authController.js');
const appointmentController = require('./../../controllers/appointmentController.js');
const userAppointmentController = require('./../../controllers/userAppointmentController.js');
const appointment = require('../../models/appointments_schema.js');

const router = express.Router();

// Create new appointment
router
  .route('/')
  .post(authController.isSignedIn, appointmentController.createAppointment);

router.route('/booked').get(appointmentController.getBookedAppointment);

// chỉ cho bác sĩ chọn là đồng ý hoặc 0 đồng ý cuộc hẹn
router.patch(
  '/',
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

router
  .route('/:id')
  .delete(
    authController.protect,
    authController.restrictToAPI(['admin']),
    appointmentController.deleteAppointment
  );
module.exports = router;
