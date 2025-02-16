const express = require('express');
const authController = require('../controllers/authController.js');
const doctorController = require('../controllers/doctorController.js');
const template = require('../controllers/templateController.js');

const router = express.Router();

router.get('/',  template.getChatToDoctorsTemplate);
router.route('/:name').get( template.getDoctorItemTemplate);

module.exports = router;
