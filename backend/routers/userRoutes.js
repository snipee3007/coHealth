const express = require('express');
const usersController = require('./../controllers/usersController.js');

const router = express.Router();

router.post('/signup', usersController.signup);

module.exports = router;