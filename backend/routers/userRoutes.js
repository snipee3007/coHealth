const express = require('express');
const authController = require('./../controllers/authController.js');

const router = express.Router();

router.post('/signUp', authController.signUp);
router.post('/signIn', authController.signIn);
//router.('/forgetPassword', usersController.forgetPassword);

module.exports = router;
