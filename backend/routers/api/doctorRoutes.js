const express = require('express');
const doctorController = require('./../../controllers/doctorController.js');
const authController = require('./../../controllers/authController.js');

const router = express.Router();

router.get('/', authController.isSignedIn, doctorController.getDoctors);
router.post(
  '/',
  authController.protect,
  authController.restrictToAPI(['admin']),
  doctorController.createDoctor
);
router.delete(
  '/:slug',
  authController.protect,
  authController.restrictToAPI(['admin']),
  doctorController.deleteDoctor
);

module.exports = router;
