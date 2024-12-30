const fs = require('fs');
const replaceTemplate = require('./replaceTemplate.js');
const New = require('./../models/news_schema.js');
const User = require('./../models/users_schema.js');
const catchAsync = require('./../utils/catchAsync.js');
//////////////////////////// EXPORT TEMPLATES /////////////////////////////////

exports.getNewsTemplate = catchAsync(async (req, res, next) => {
  const allNews = await New.find().sort('createdAt');
  res.status(200).render('news', {
    title: 'News',
    allNews,
  });
});

exports.getNewsItemTemplate = catchAsync(async (req, res, next) => {
  const news = await New.find({ slug: req.originalUrl.split('/')[2] });
  const recommendNews = await New.find().sort('-view').limit(3);
  res.status(200).render('newsItem', {
    title: 'News',
    news: news[0],
    recommendNews,
  });
});

exports.getHomePageTemplate = catchAsync(async (req, res, next) => {
  const mostViewNews = await New.find()
    .sort('-view')
    .sort('createDate')
    .limit(6);

  const latestNews = await New.find().sort('createDate').limit(3);
  res.status(200).render('homepage', {
    title: 'Welcome',
    mostViewNews,
    latestNews,
  });
});

exports.getAboutUsTemplate = catchAsync(async (req, res, next) => {
  res.status(200).render('aboutUs', {
    title: 'About Us',
  });
});

exports.getCalculateTemplate = async (req, res) => {
  res.status(200).render('calculate', {
    title: 'Calculate BMI/TDEE',
  });
};

exports.getResultBMITemplate = async (req, res) => {
  const resultBMITemplate = replaceTemplate.addDecoration(
    await replaceTemplate.addNavigation(
      fs.readFileSync(
        `${__dirname}/../../frontend/template/resultBMI.html`,
        'utf-8'
      ),
      req
    )
  );
  res.end(resultBMITemplate);
};

exports.getfindHospitalTemplate = async (req, res) => {
  let findHospitalTemplate = replaceTemplate.addDecoration(
    await replaceTemplate.addNavigation(
      fs.readFileSync(
        `${__dirname}/../../frontend/template/findHospital.html`,
        'utf-8'
      ),
      req
    )
  );

  findHospitalTemplate = findHospitalTemplate.replace(
    '{%GOOGLE_MAPS_API_KEY%}',
    process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  );
  res.end(findHospitalTemplate);
};

exports.getsignUpTemplate = async (req, res) => {
  res.status(200).render('signUp', {
    title: 'Sign Up',
  });
};

exports.getsignInTemplate = async (req, res) => {
  res.status(200).render('signIn', {
    title: 'Sign In',
  });
};

exports.getForgetPasswordTemplate = async (req, res) => {
  const forgetPasswordTemplate = replaceTemplate.addDecoration(
    await replaceTemplate.addNavigation(
      fs.readFileSync(
        `${__dirname}/../../frontend/template/forgetPassword.html`,
        'utf-8'
      ),
      req
    )
  );
  res.end(forgetPasswordTemplate);
};

exports.getProfileTemplate = async (req, res) => {
  res.status(200).render('profile', {
    title: 'User Profile',
    userProfileTitle: 'Basic Info',
  });
};

exports.getAccountTemplate = async (req, res) => {
  const AccountTemplate = replaceTemplate.addDecoration(
    await replaceTemplate.addNavigation(
      fs.readFileSync(
        `${__dirname}/../../frontend/template/accountPage.html`,
        'utf-8'
      ),
      req
    )
  );
  res.end(AccountTemplate);
};

exports.getHistoryTemplate = async (req, res) => {
  const historyTemplate = replaceTemplate.addDecoration(
    await replaceTemplate.addNavigation(
      fs.readFileSync(
        `${__dirname}/../../frontend/template/historyPage.html`,
        'utf-8'
      ),
      req
    )
  );
  res.end(historyTemplate);
};
