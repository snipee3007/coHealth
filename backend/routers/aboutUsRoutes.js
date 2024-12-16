const express = require('express');
const template = require('./../controllers/templateController.js');
const checkTokenAndRedirect = require('../utils/checkToken.js');

const router = express.Router();

router.get('/', checkTokenAndRedirect, template.getAboutUsTemplate);

module.exports = router;
