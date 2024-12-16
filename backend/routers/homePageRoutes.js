const express = require('express');
const template = require('./../controllers/templateController.js');
const checkTokenAndRedirect = require('../utils/checkToken.js');
const authController = require('./../controllers/authController.js');

const router = express.Router();

router.get(['/', '/home'], checkTokenAndRedirect, template.getHomePageTemplate);

module.exports = router;
