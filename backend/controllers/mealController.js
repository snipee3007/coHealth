const catchAsync = require('../utils/catchAsync.js');
const returnData = require('../utils/returnData.js');
const axios = require('axios');

exports.getMeal = catchAsync(async (req, res, next) => {
  const body = req.body;
  const response = await axios({
    method: 'get',
    url: `https://api.spoonacular.com/mealplanner/generate?targetCalories=${body.calories}&timeFrame=week`,
    headers: {
      'X-Api-Key': process.env.SPOONACULAR_API_KEY,
    },
  });
  if (response.status.toString().startsWith('2')) {
    returnData(req, res, response.status, response.data.week);
  } else if (response.status.toString().startsWith('4')) {
    console.error(response);
    return next(
      new AppError(
        'Something wrong with Spoonacular API! Please try again later',
        response.status
      )
    );
  }
});
