const fs = require('fs');
const replaceTemplate = require('./replaceTemplate.js');
const New = require('./../models/news_schema.js');
const catchAsync = require('./../utils/catchAsync.js');
//////////////////////////// EXPORT TEMPLATES /////////////////////////////////

exports.getNewsTemplate = async (req, res) => {
  const newsTemplate = replaceTemplate.addDecoration(
    await replaceTemplate.addNavigation(
      fs.readFileSync(
        `${__dirname}/../../frontend/template/news.html`,
        'utf-8'
      ),
      req
    )
  );
  res.end(newsTemplate);
};

exports.getNewsItemTemplate = async (req, res) => {
  const newsItemTemplate = replaceTemplate.addDecoration(
    await replaceTemplate.addNavigation(
      fs.readFileSync(
        `${__dirname}/../../frontend/template/newsItem.html`,
        'utf-8'
      ),
      req
    )
  );
  res.end(newsItemTemplate);
};

exports.getHomePageTemplate = catchAsync(async (req, res) => {
  const mostViewNews = await New.find()
    .sort('-view')
    .sort('createDate')
    .limit(6);
  const latestNews = await New.find().sort('createDate').limit(3);
  res.render('homepage', {
    title: 'Welcome',
    mostViewNews,
    latestNews,
  });
  // res.end(homePageTemplate);
});

exports.getCalculateBMITemplate = async (req, res) => {
  const calculateBMITemplate = replaceTemplate.addDecoration(
    await replaceTemplate.addNavigation(
      fs.readFileSync(
        `${__dirname}/../../frontend/template/calculateBMI.html`,
        'utf-8'
      ),
      req
    )
  );
  res.end(calculateBMITemplate);
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
  const signUpTemplate = replaceTemplate.addDecoration(
    await replaceTemplate.addNavigation(
      fs.readFileSync(
        `${__dirname}/../../frontend/template/signUp.html`,
        'utf-8'
      ),
      req
    )
  );
  res.end(signUpTemplate);
};

exports.getsignInTemplate = async (req, res) => {
  const signInTemplate = replaceTemplate.addDecoration(
    await replaceTemplate.addNavigation(
      fs.readFileSync(
        `${__dirname}/../../frontend/template/signIn.html`,
        'utf-8'
      ),
      req
    )
  );
  res.end(signInTemplate);
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
  try {
    const profilePagePath = `${__dirname}/../../frontend/template/profilePage.html`;
    const profilePageContent = fs.readFileSync(profilePagePath, 'utf-8');

    const navigationTemplate = await replaceTemplate.addNavigation(
      profilePageContent,
      req
    );
    const decorationTemplate = await replaceTemplate.addDecoration(
      navigationTemplate
    );
    const profileTemplate = await replaceTemplate.addProfile(
      decorationTemplate,
      req
    );

    res.end(profileTemplate);
  } catch (error) {
    console.error('Error generating profile template:', error);
    res.status(500).send('Internal Server Error');
  }
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

// exports.getHomePageTemplateAfterSignIn = (req, res) => {
//   const homePageTemplate = replaceTemplate.addDecoration(
//     await replaceTemplate.addNavigationAfterSign(
//       fs.readFileSync(
//         `${__dirname}/../../frontend/template/homePage.html`,
//         'utf-8'
//       )
//     )
//   );
//   res.end(homePageTemplate);
// };
