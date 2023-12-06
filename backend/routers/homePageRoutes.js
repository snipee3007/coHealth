const express = require('express');
const template = require('./../controllers/templateController.js');

const router = express.Router();

router.get(['/', '/home', '/aboutUs'],checkLoggedIn, template.getHomePageTemplate);

function checkLoggedIn(req, res, next) {
    if (req.session && req.session.user) {
        template.getHomePageTemplateAfterSignIn(req,res);
    } else {
        next();
    }
}

module.exports = router;
