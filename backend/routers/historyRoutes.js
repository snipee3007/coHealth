const express = require('express');
const template = require('../controllers/templateController');

const router = express.Router();

router.get('/', template.getHistoryTemplate);

module.exports = router;