const express = require('express');
const authController = require('./../controllers/authController.js');
const usersController = require('./../controllers/usersController.js');
const router = express.Router();

router.post('/signUp', authController.signUp);
router.post('/signIn', authController.signIn);
router.post('/signOut', authController.signOut);
router.post(
  '/',
  authController.protect,
  usersController.uploadImage,
  usersController.updateImagePath,
  usersController.editProfile
);
//router.('/forgetPassword', usersController.forgetPassword);

module.exports = router;
