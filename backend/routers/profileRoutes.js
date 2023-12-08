const express = require('express');
const template = require('../controllers/templateController');

const router = express.Router();

router.get('/', template.getProfileTemplate);

module.exports = router;