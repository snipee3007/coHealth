const AppError = require('./../utils/appError.js');
const catchAsync = require('./../utils/catchAsync.js');
const AdultCompendium = require('./../models/adultCompendium_schema.js');
const CalculateHistory = require('./../models/calculateHistory_schema.js');
const returnData = require('../utils/returnData.js');

exports.calculateBMI = catchAsync(async (req, res, next) => {
  // Extract user input from request body
  let {
    gender,
    age,
    height,
    weight,
    activityIntensity,
    target,
    speed,
    targetWeight,
    activities,
    method,
  } = req.body;
  if (speed == '') speed = undefined;
  const { bmi, bmiStatus, tdee, tee } = await mainCalculateFunction({
    gender,
    age,
    height,
    weight,
    activityIntensity,
    activities,
    method,
    next,
  });
  // Losing more than 2 pounds ~ 0.9kg per week have bad influence to your health, reference: https://www.calculator.net/calorie-calculator.html
  // As a result, it is higly recommend to reduce calories consumed at maximum 1000 calories per day base on calories burned
  // Based on the fact that 3500 calories is nearly equivalent to 1 pound, 1000 calories deduction is equivalent to 1 pound reduced (0.45kg) per week
  let targetCalories = undefined;
  let deltaCalories =
    speed == 'slow'
      ? 250
      : speed == 'normal'
      ? 500
      : speed == 'fast'
      ? 1000
      : 0;
  let weekAfterToAchieveTarget = undefined;
  if (target == 'maintain') {
    targetCalories = tdee || tee;
  } else if (target == 'gain') {
    targetCalories = (tdee || tee) + deltaCalories;
    weekAfterToAchieveTarget = Math.floor(
      (targetWeight - weight) /
        (0.45 / (speed == 'slow' ? 4 : speed == 'normal' ? 2 : 1))
    );
  } else if (target == 'lose') {
    targetCalories = (tdee || tee) - deltaCalories;
    weekAfterToAchieveTarget = Math.floor(
      (weight - targetWeight) /
        (0.45 / (speed == 'slow' ? 4 : speed == 'normal' ? 2 : 1))
    );
  }

  const caloriesIntakeList = [];
  let idealWeight = weight;
  for (let i = 0; i < weekAfterToAchieveTarget; ++i) {
    const { tdee, tee } = await mainCalculateFunction({
      gender,
      age,
      weight: idealWeight,
      height,
      activityIntensity,
      activities,
      method,
      next,
    });
    // console.log(
    //   await mainCalculateFunction({
    //     gender,
    //     age,
    //     weight: idealWeight,
    //     height,
    //     activityIntensity,
    //     activities,
    //     method,
    //     next,
    //   })
    // );
    // console.log(tdee, deltaCalories);
    if (target == 'maintain') {
      caloriesIntakeList.push((tdee || tee) + deltaCalories);
      idealWeight += 0.45 / (speed == 'slow' ? 4 : speed == 'normal' ? 2 : 1);
    } else if (target == 'lose') {
      caloriesIntakeList.push((tdee || tee) - deltaCalories);
      idealWeight -= 0.45 / (speed == 'slow' ? 4 : speed == 'normal' ? 2 : 1);
    }
  }
  if (req.user) {
    await CalculateHistory.create({
      userID: req.user.id,
      basicInfo: {
        age,
        weight,
        height,
        gender,
        method,
        activities,
        activityIntensity,
        target,
        speed,
        targetWeight,
      },
      result: {
        bmi,
        tdee: tee || tdee,
        targetCalories,
        weekAfterToAchieveTarget,
        bmiStatus,
        caloriesIntakeList,
      },
    });
    // console.log('Success create new calculate history!');
  }
  returnData(req, res, 200, {
    tdee: tdee || tee,
    bmi,
    targetCalories,
    weekAfterToAchieveTarget,
    bmiStatus,
    caloriesIntakeList,
  });
});

exports.getRecentCalculate = catchAsync(async (req, res, next) => {
  if (req.user) {
    const recentCalculate = await CalculateHistory.find({
      userID: req.user.id,
    })
      .sort('-createdAt -updatedAt')
      .limit(1);

    if (recentCalculate.length > 0) returnData(req, res, 200, recentCalculate);
    else {
      return next(
        new AppError(
          'No calculation before! Please use /calculate to make your calculation',
          400
        )
      );
    }
  } else {
    returnData(req, res, 204, {});
  }
});

exports.getCalculate = catchAsync(async (req, res, next) => {
  if (req.user) {
    const calculate = await CalculateHistory.findById(req.params.id);
    if (calculate) {
      returnData(req, res, 200, calculate);
    } else {
      return next(
        new AppError(
          'No calculation with give ID! Please use different ID!',
          400
        )
      );
    }
  } else {
    returnData(req, res, 204, {});
  }
});

// HELPER FUNCTION
const mainCalculateFunction = async function ({
  method = 'normal TDEE',
  weight = undefined,
  height = undefined,
  gender = 'male',
  activityIntensity = undefined,
  age = undefined,
  activities = undefined,
  next,
}) {
  let tdee,
    tee = undefined;
  const bmi = (weight / (height / 100) ** 2).toFixed(1);
  let bmiStatus;
  if (bmi < 16) {
    bmiStatus = 'Underweight (Severe thinness)';
  } else if (bmi <= 16.9) {
    bmiStatus = 'Underweight (Moderate thinness)';
  } else if (bmi <= 18.4) {
    bmiStatus = 'Underweight (Mild thinness)';
  } else if (bmi <= 24.9) {
    bmiStatus = 'Normal Range';
  } else if (bmi <= 29.9) {
    bmiStatus = 'Overweight (Pre-obese)';
  } else if (bmi <= 34.9) {
    bmiStatus = 'Obese (Class I)';
  } else if (bmi <= 39.9) {
    bmiStatus = 'Obese (Class II)';
  } else {
    bmiStatus = 'Obese (Class III)';
  }

  if (method == 'normal tdee') {
    // BMI Units: weight in kilogram, height in meter

    // Calculate BMR using Pavlidou (Proposed new Equations) in kcal/d (2022): basal metabolic rate

    // Weight in kilogram
    // Height in meter
    // Age in year
    let bmr;
    // Male
    if (gender === 'male') {
      bmr = 9.65 * weight + 573 * (height / 100) - 5.08 * age + 260;
    }
    // Female
    else if (gender === 'female') {
      bmr = 7.38 * weight + 607 * (height / 100) - 2.31 * age + 43;
    }
    let pal; // Physical Activity Level
    switch (activityIntensity) {
      case 'sedentary':
        pal = 1.2;
        break;
      case 'lightly active':
        pal = 1.375;
        break;
      case 'moderately active':
        pal = 1.55;
        break;
      case 'very active':
        pal = 1.725;
        break;
      case 'extremely active':
        pal = 1.9;
        break;
      default:
        return next(
          new AppError(
            'Can not find the activity level name! Please input different activity level name!',
            400
          )
        );
    }

    tdee = (bmr * pal).toFixed(0); // Total Daily Energy Expenditure
  } else {
    const activitiesData = await AdultCompendium.find({
      activityCode: {
        $in: activities.map((activity) => activity.activityCode),
      },
    });
    // Check if the activity input is not null or the length  is 0
    if (!activitiesData || activitiesData.length == 0)
      return next(
        new AppError('The activity code is invalid! Please provide other code!')
      );
    let bee; // Basal energy expenditure
    if (gender == 'male') {
      bee = 293 - 3.8 * age + 456.4 * (height / 100) + 10.12 * weight;
    } else if (gender == 'female') {
      bee = 247 - 2.67 * age + 401.5 * (height / 100) + 8.6 * weight;
    }
    let deltaPAL = 1.1; // Total Caloric cost of the activity

    // METs = Metabolic equivalents
    activitiesData.forEach((activity, idx) => {
      deltaPAL +=
        ((activity.metValue - 1) *
          ((1.15 / 0.9) * (activities[idx].duration / 1440))) /
        (bee / [0.0175 * 1440 * weight]);
    });

    let pa;
    // 1.0 <= PAL < 1.4
    if (deltaPAL < 1.4 && deltaPAL >= 1.0)
      pa = 1.0; // Sedentary - Male and Female are the same
    // 1.4 <= PAL < 1.6
    else if (deltaPAL < 1.6)
      pa =
        gender == 'male'
          ? 1.12 // Low active - Male is 1.12
          : 1.14;
    // Low active - Female is 1.14
    // 1.6 <= PAL < 1.9
    else if (deltaPAL < 1.9) pa = 1.27; // Active - Male and Female are the same
    // 1.9 <= PAL < 2.5
    else
      pa =
        gender == 'male'
          ? 1.54 // Very active - Male is 1.54
          : 1.45; // Very active - Female is 1.45

    // TEE = Total energy expenditure
    // Weight in kilogram
    // Age in year
    // Height in meter
    // Reference https://www.cdc.gov/pcd/issues/2006/oct/pdf/06_0034.pdf, page 3
    tee =
      gender == 'male'
        ? 864 - 9.72 * age + pa * [14.2 * weight + 503 * (height / 100)]
        : 387 - 7.31 * age + pa * [10.9 * weight + 660.7 * (height / 100)];
  }
  return { bmi, bmiStatus, tdee: Math.ceil(tdee), tee: Math.ceil(tee) };
};
