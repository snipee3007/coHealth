const express = require('express');
const template = require('./../controller/templateController.js');

const router = express.Router();

router.get(['/', '/home', '/aboutUs'], template.getHomePageTemplate);

module.exports = router;
