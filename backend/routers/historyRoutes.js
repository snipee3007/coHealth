const express = require('express');
const template = require('../controllers/templateController');
const authController = require('../controllers/authController.js');

const router = express.Router();

router.get('/', authController.protect, template.getHistoryTemplate);

module.exports = router;
