const express = require('express');
const authController = require('./../controllers/authController.js');

const router = express.Router();

router.post('/signUp', authController.signup);
router.post('/login', authController.login);
//router.('/forgetPassword', usersController.forgetPassword);

module.exports = router;
