const express = require('express');
const template = require('./../controllers/templateController.js');
const authController = require('./../controllers/authController.js');

const router = express.Router();

router.get(
  ['/', '/home'],
  // authController.protect,
  template.getHomePageTemplate
);

module.exports = router;
