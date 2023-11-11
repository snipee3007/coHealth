const fs = require('fs');
const addTemplate = require('./replaceTemplate.js');

const homePageTemplate = addTemplate.addDecoration(
  addTemplate.addNavigation(
    fs.readFileSync(`${__dirname}/../public/template/homePage.html`, 'utf-8')
  )
);

const calculateBMITemplate = addTemplate.addDecoration(
  addTemplate.addNavigation(
    fs.readFileSync(
      `${__dirname}/../public/template/calculateBMI.html`,
      'utf-8'
    )
  )
);

const newsTemplate = addTemplate.addDecoration(
  addTemplate.addNavigation(
    fs.readFileSync(`${__dirname}/../public/template/news.html`, 'utf-8')
  )
);

const newsItemTemplate = addTemplate.addDecoration(
  addTemplate.addNavigation(
    fs.readFileSync(`${__dirname}/../public/template/newsItem.html`, 'utf-8')
  )
);

let findHospitalTemplate = addTemplate.addDecoration(
  addTemplate.addNavigation(
    fs.readFileSync(
      `${__dirname}/../public/template/findHospital.html`,
      'utf-8'
    )
  )
);

findHospitalTemplate = findHospitalTemplate.replace(
  '{%GOOGLE_MAPS_API_KEY%}',
  process.env.REACT_APP_GOOGLE_MAPS_API_KEY
);
//////////////////////////// EXPORT TEMPLATES /////////////////////////////////

exports.getNewsTemplate = (req, res) => {
  res.end(newsTemplate);
};

exports.getNewsItemTemplate = async (req, res) => {
  res.end(newsItemTemplate);
};

exports.getHomePageTemplate = (req, res) => {
  res.end(homePageTemplate);
};

exports.getCalculateBMITemplate = (req, res) => {
  res.end(calculateBMITemplate);
};

exports.getfindHospitalTemplate = (req, res) => {
  res.end(findHospitalTemplate);
};
