const catchAsync = require('../utils/catchAsync.js');
const Meal = require('./../models/mealSchema.js');
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
    res.status(response.status).json({
      status: 'success',
      data: response.data.week,
    });
  } else if (response.status.toString().startsWith('4')) {
    res.status(response.status).json({
      status: 'failed',
      message: 'ERROR',
    });
  }
});
