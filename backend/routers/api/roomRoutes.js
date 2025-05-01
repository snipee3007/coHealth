const express = require('express');
const authController = require('../../controllers/authController.js');
const chatToDoctorController = require('./../../controllers/chatToDoctorController.js');
const router = express.Router();

// tạo room chat mới
router.post(
  '/create',
  authController.protect,
  chatToDoctorController.createChatRoom
);

// tạo tin nhắn mới
router.post(
  '/message/create',
  authController.protect,
  chatToDoctorController.createMessage
);

// lấy dữ liệu chat trong room đó
router.get(
  '/:roomCode/message',
  authController.protect,
  chatToDoctorController.getMessageInRoom
);

module.exports = router;
