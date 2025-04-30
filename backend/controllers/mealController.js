const catchAsync = require('../utils/catchAsync.js');
const Meal = require('./../models/mealSchema.js');

exports.createMeal = catchAsync(async (req, res, next) => {
  const body = req.body;
  const meal = await Meal.create(body);
  res.status(200).json({
    status: 'success',
    data: meal,
  });
});
