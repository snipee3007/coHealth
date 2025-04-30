const express = require('express');

const router = express.Router();
const mealController = require('./../../controllers/mealController.js');

router.route('/create', mealController.createMeal);

module.exports = router;
