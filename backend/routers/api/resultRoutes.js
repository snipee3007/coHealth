const express = require('express');
const resultController = require('../../controllers/resultController.js');
const authController = require('../../controllers/authController.js');

const food = require('../../models/food_schema.js');

const router = express.Router();

router
  .route('/')
  .get(authController.isSignedIn, resultController.getRecentCalculate);

module.exports = router;
