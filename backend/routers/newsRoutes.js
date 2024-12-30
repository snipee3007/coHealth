const express = require('express');
const template = require('./../controllers/templateController');
const authController = require('../controllers/authController.js');

const router = express.Router();

router.get('/', authController.protect, template.getNewsTemplate);

router
  .route('/:name')
  .get(authController.protect, template.getNewsItemTemplate);

module.exports = router;
