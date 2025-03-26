const express = require('express');
const adultCompendiumController = require('../../controllers/adultCompendiumController.js');

const router = express.Router();

router.get('/getAllNames', adultCompendiumController.getAllAdultCompendiumName);
router.get('/getDescription/:name', adultCompendiumController.getDescription);
module.exports = router;
