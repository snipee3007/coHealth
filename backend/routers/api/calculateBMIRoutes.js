const express = require('express');
const resultController = require('../../controllers/resultController.js');
const authController = require('../../controllers/authController.js');

const router = express.Router();

router.post('/', authController.isSignedIn, resultController.calculateBMI);

module.exports = router;
