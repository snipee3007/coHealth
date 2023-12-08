const fs = require('fs');
const replaceTemplate = require('./replaceTemplate.js');

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

exports.getHomePageTemplate = async (req, res) => {
  const homePageTemplate = replaceTemplate.addDecoration(
    await replaceTemplate.addNavigation(
      fs.readFileSync(
        `${__dirname}/../../frontend/template/homePage.html`,
        'utf-8'
      ),
      req
    )
  );
  res.end(homePageTemplate);
};

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


exports.getProfileTemplate = (req, res) => {
  const ProfileTemplate = replaceTemplate.addDecoration(
    replaceTemplate.addNavigationAfterSign(
      fs.readFileSync(
        `${__dirname}/../../frontend/template/profilePage.html`,
        'utf-8'
      )
    )
  );
  res.end(ProfileTemplate);
};

exports.getAccountTemplate = (req, res) => {
  const AccountTemplate = replaceTemplate.addDecoration(
    replaceTemplate.addNavigationAfterSign(
      fs.readFileSync(
        `${__dirname}/../../frontend/template/accountPage.html`,
        'utf-8'
      )
    )
  );
  res.end(AccountTemplate);
};

exports.getHistoryTemplate = (req, res) => {
  const historyTemplate = replaceTemplate.addDecoration(
    replaceTemplate.addNavigationAfterSign(
      fs.readFileSync(
        `${__dirname}/../../frontend/template/historyPage.html`,
        'utf-8'
      )
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

