const express = require('express');
const notificationController = require('./../../controllers/notificationController.js');
const authController = require('./../../controllers/authController.js');
const router = express.Router();

router
  .route('/:id')
  .post(authController.protect, notificationController.updateReadNotification);

module.exports = router;
