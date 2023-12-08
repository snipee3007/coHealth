const express = require('express');
const template = require('../controllers/templateController');
const checkTokenAndRedirect = require('../utils/checkToken');
const router = express.Router();

router.get('/', checkTokenAndRedirect, template.getProfileTemplate);

module.exports = router;
