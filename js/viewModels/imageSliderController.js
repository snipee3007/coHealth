const fs = require('fs');

const data = fs.readFileSync(
  `${__dirname}/../data/images-slider.json`,
  'utf-8'
);

exports.data = data;
