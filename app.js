const express = require('express');
const homepageView = require('./js/viewModels/homepageView');
const app = express();

app.get('/', homepageView.renderPage);

const server = app.listen((port = 3000), () => {
  console.log(`App running on port ${port}...`);
});
