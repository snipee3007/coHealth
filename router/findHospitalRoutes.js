const express = require('express');
const template = require('./../controller/templateController.js');

const router = express.Router();

router.get('/', template.getfindHospitalTemplate);

module.exports = router;
