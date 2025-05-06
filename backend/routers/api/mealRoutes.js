const express = require('express');

const router = express.Router();
const mealController = require('./../../controllers/mealController.js');

router.route('/').post(mealController.getMeal);

module.exports = router;
