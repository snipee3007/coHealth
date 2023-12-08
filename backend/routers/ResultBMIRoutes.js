const express = require('express');
const resultController = require('../controllers/resultController.js');
const template = require('../controllers/templateController.js');
const food = require('../models/food_schema.js')

const router = express.Router();
router.get('/', template.getResultBMITemplate);
router.post('/calculate', resultController.calculateBMI);


module.exports = router;
