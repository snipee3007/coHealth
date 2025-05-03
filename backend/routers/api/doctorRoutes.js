const express = require('express');
const doctorController = require('./../../controllers/doctorController.js');
const template = require('./../../controllers/templateController.js');
const authController = require('./../../controllers/authController.js');

const router = express.Router();

router.get('/', authController.isSignedIn, doctorController.getDoctors);

router.route('/:name').get(template.getDoctorItemTemplate);

module.exports = router;
