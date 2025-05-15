const express = require('express');
const notificationController = require('./../../controllers/notificationController.js');
const authController = require('./../../controllers/authController.js');
const router = express.Router();

router
  .route('/:id')
  .post(authController.protect, notificationController.updateReadNotification)
  .delete(
    authController.protect,
    authController.restrictToAPI(['admin']),
    notificationController.deleteNotifition
  );

module.exports = router;
