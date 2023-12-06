const express = require('express');
const template = require('./../controllers/templateController.js');

const router = express.Router();

router.get('/', template.getsignInTemplate);

module.exports = router;