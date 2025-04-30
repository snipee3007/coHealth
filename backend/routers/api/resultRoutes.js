const express = require('express');
const resultController = require('../../controllers/resultController.js');
const authController = require('../../controllers/authController.js');

const router = express.Router();

router
  .route('/')
  .get(authController.isSignedIn, resultController.getRecentCalculate);

router
  .route('/:id')
  .get(authController.isSignedIn, resultController.getCalculate);

module.exports = router;
