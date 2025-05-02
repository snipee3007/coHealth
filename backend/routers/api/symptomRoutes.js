const express = require('express');
const symptomController = require('./../../controllers/symptomController.js');
const template = require('./../../controllers/templateController.js');

const router = express.Router();

// router.get('/', symptomController.getAllSymptoms);
router.post('/create', symptomController.createSymptom);

router.get('/', symptomController.getAllSymptoms);

router.get('/:name', symptomController.getSymptomByTag);

module.exports = router;
