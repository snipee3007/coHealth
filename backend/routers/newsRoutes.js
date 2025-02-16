const express = require('express');
const template = require('./../controllers/templateController');
const authController = require('../controllers/authController.js');

const router = express.Router();

router.get('/', template.getNewsTemplate);

router
  .route('/:name')
  .get( template.getNewsItemTemplate);

module.exports = router;
