const fs = require('fs');
const replaceTemplate = require('./replaceTemplate.js');

//////////////////////////// EXPORT TEMPLATES /////////////////////////////////

exports.getNewsTemplate = (req, res) => {
  const newsTemplate = replaceTemplate.addDecoration(
    replaceTemplate.addNavigation(
      fs.readFileSync(`${__dirname}/../../frontend/template/news.html`, 'utf-8')
    )
  );
  res.end(newsTemplate);
};

exports.getNewsItemTemplate = async (req, res) => {
  const newsItemTemplate = replaceTemplate.addDecoration(
    replaceTemplate.addNavigation(
      fs.readFileSync(
        `${__dirname}/../../frontend/template/newsItem.html`,
        'utf-8'
      )
    )
  );
  res.end(newsItemTemplate);
};

exports.getHomePageTemplate = (req, res) => {
  const homePageTemplate = replaceTemplate.addDecoration(
    replaceTemplate.addNavigation(
      fs.readFileSync(
        `${__dirname}/../../frontend/template/homePage.html`,
        'utf-8'
      )
    )
  );
  res.end(homePageTemplate);
};

exports.getCalculateBMITemplate = (req, res) => {
  const calculateBMITemplate = replaceTemplate.addDecoration(
    replaceTemplate.addNavigation(
      fs.readFileSync(
        `${__dirname}/../../frontend/template/calculateBMI.html`,
        'utf-8'
      )
    )
  );
  res.end(calculateBMITemplate);
};

exports.getfindHospitalTemplate = (req, res) => {
  let findHospitalTemplate = replaceTemplate.addDecoration(
    replaceTemplate.addNavigation(
      fs.readFileSync(
        `${__dirname}/../../frontend/template/findHospital.html`,
        'utf-8'
      )
    )
  );

  findHospitalTemplate = findHospitalTemplate.replace(
    '{%GOOGLE_MAPS_API_KEY%}',
    process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  );
  res.end(findHospitalTemplate);
};
