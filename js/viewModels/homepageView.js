// const express = require('express');
const fs = require('fs');

const homePageTemplate = fs.readFileSync(
  `${__dirname}/../../public/template/homePage.html`,
  'utf-8'
);

exports.renderPage = (req, res) => {
  res.end(homePageTemplate);
};
