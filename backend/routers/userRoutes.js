const express = require('express');
const usersController = require('./../controllers/usersController.js');

const router = express.Router();

router.post('/signUp', usersController.signup);
router.post('/login', usersController.login);
//router.('/forgetPassword', usersController.forgetPassword);

module.exports = router;
