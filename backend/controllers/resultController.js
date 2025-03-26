const AppError = require('./../utils/appError.js');
const catchAsync = require('./../utils/catchAsync.js');

exports.calculateBMI = catchAsync(async (req, res, next) => {
  // Extract user input from request body
  console.log('Received data:', req.body);
  const { gender, age, height, weight, training, target, speed, targetWeight } =
    req.body;
  const heightInMeters = height / 100;
  const bmi = (weight / heightInMeters ** 2).toFixed(1);

  // Calculate BMR using Pavlidou (Proposed new Equations) in kcal/d (2022): basal metabolic rate
  let bmr;
  // Male
  if (gender === 'male') {
    bmr = 9.65 * weight + 5.73 * height - 5.08 * age + 260;
  }
  // Female
  else if (gender === 'female') {
    bmr = 7.38 * weight + 6.07 * height - 2.31 * age + 43;
  }

  let activityFactor;
  switch (activity) {
    case 'sedentary':
      activityFactor = 1.2;
      break;
    case 'lightly':
      activityFactor = 1.375;
      break;
    case 'moderately':
      activityFactor = 1.55;
      break;
    case 'very_active':
      activityFactor = 1.725;
      break;
    case 'extra_active':
      activityFactor = 1.9;
      break;
    default:
      activityFactor = 1.2;
  }

  const totalCalories = (bmr * activityFactor).toFixed(0);

  res.redirect(`/result?bmi=${bmi}&calories=${totalCalories}`);
});
