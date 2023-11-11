const express = require('express');
const fs = require('fs');
const router = express.Router();

router.get('/src/react', (req, res) => {
  try {
    const data = fs.readFileSync(
      `${__dirname}/../node_modules/@types/react/index.d.ts`,
      'utf-8'
    );
    res.type('.ts');
    res.status(200).send(data);
  } catch (err) {
    console.error('Somthing Wrong!!!!!!', err);
  }
});

router.get('/src/react-dom', (req, res) => {
  try {
    const data = fs.readFileSync(
      `${__dirname}/../node_modules/@types/react-dom/index.d.ts`,
      'utf-8'
    );
    res.type('.ts');
    res.status(200).send(data);
  } catch (err) {
    console.error('Something wrong!!!', err);
  }
});

router.get('/src/app', (req, res) => {
  try {
    const data = fs.readFileSync(
      `${__dirname}/../public/react/src/app.js`,
      'utf-8'
    );
    res.type('.ts');
    res.status(200).send(data);
  } catch (err) {
    console.error('Something wrong!!!', err);
  }
});

module.exports = router;
