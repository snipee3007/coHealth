const express = require('express');
const doctorController = require('./../../controllers/doctorController.js');
const authController = require('./../../controllers/authController.js');

const router = express.Router();

router.get('/', authController.isSignedIn, doctorController.getDoctors);
router.post('/', doctorController.createDoctor);

module.exports = router;
