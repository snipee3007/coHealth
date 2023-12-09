const express = require('express');
const resultController = require('../controllers/resultController.js');
const template = require('../controllers/templateController.js');
const food = require('../models/food_schema.js');
const checkTokenAndRedirect = require('../utils/checkToken');

const router = express.Router();
router.get('/', checkTokenAndRedirect, template.getResultBMITemplate);
router.post('/calculate', checkTokenAndRedirect, resultController.calculateBMI);

module.exports = router;
