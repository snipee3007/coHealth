const express = require('express');
const diseaseController = require('./../../controllers/diseaseController.js');

const router = express.Router();

router.get('/', diseaseController.getAllDiseases);

router.post('/create', diseaseController.createDisease);

router.post('/predict', diseaseController.predictDisease);

module.exports = router;
