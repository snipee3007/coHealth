const express = require('express');
const doctorController = require('./../../controllers/doctorController.js');
const template = require('./../../controllers/templateController.js');

const router = express.Router();

router.get('/', doctorController.getDoctors);

router.route('/:name').get(template.getDoctorItemTemplate);

module.exports = router;
