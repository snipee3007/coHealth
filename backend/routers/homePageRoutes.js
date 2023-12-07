const express = require('express');
const template = require('./../controllers/templateController.js');
const tokenn = require('./../controllers/authController.js');

const router = express.Router();

const getTokenFromRequest = (req) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer')) {
        // If the Authorization header is present and starts with 'Bearer', extract the token
        const token = authHeader.split(' ')[1];
        return token;
    }

    // If the Authorization header is not present or doesn't start with 'Bearer', return null
    return null;
};

const checkTokenAndRedirect = (req, res, next) => {
    const token = getTokenFromRequest(req);

    if (!token) {
        return template.getHomePageTemplate(req, res);  // Redirect to the homepage or another route
    }

    tokenn.protect(req, res, (err) => {
        if (err) {
            return template.getHomePageTemplate(req, res);
        }
        // Continue to the next middleware or route handler
        next();
    });
};

router.get(['/', '/home', '/aboutUs'], checkTokenAndRedirect, template.getHomePageTemplateAfterSignIn);

module.exports = router;
