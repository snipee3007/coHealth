const express = require('express');

const router = express.Router();
const mealController = require('./../../controllers/mealController.js');
const symptomHistoryController = require('./../../controllers/symptomHistoryController.js');

router
  .route('/symptom')
  .get(symptomHistoryController.getHistory)
  .post(symptomHistoryController.createHistory);

module.exports = router;
