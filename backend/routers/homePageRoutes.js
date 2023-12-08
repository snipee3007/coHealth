const express = require('express');
const template = require('./../controllers/templateController.js');
const tokenn = require('./../controllers/authController.js');
const LocalStorage = require('node-localstorage').LocalStorage;
const router = express.Router();

const checkTokenAndRedirect = (req, res, next) => {
  const localStorage = new LocalStorage('./scratch');
  console.log(localStorage);
  const token = localStorage.getItem('token');
  console.log(token);
  if (!token) {
    return template.getHomePageTemplate(req, res); // Redirect to the homepage or another route
  }
  console.log('I am here');
  tokenn.protect(token, req, next);
  next();
};

router.get(
  ['/', '/home', '/aboutUs'],
  checkTokenAndRedirect,
  template.getHomePageTemplateAfterSignIn
);

module.exports = router;
