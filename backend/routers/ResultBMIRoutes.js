const express = require('express');
const resultController = require('../controllers/resultController.js');
const template = require('../controllers/templateController.js');
const authController = require('../controllers/authController.js');

const food = require('../models/food_schema.js');

const router = express.Router();
router.get('/', authController.protect, template.getResultBMITemplate);
router.post(
  '/calculate',
  authController.protect,
  resultController.calculateBMI
);

module.exports = router;
