const express = require('express');
const template = require('./../controllers/templateController.js');
const checkTokenAndRedirect = require('../utils/checkToken.js');

const router = express.Router();

router.get(
  ['/', '/home', '/aboutUs'],
  checkTokenAndRedirect,
  template.getHomePageTemplate
);

module.exports = router;
