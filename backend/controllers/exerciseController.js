const returnData = require('../utils/returnData.js');
const Exercise = require('./../models/exerciseSchema.js');
const catchAsync = require('./../utils/catchAsync.js');

exports.getExercise = catchAsync(async (req, res, next) => {
  const level = req.query.level?.toLowerCase();
  const mechanic = req.query.mechanic?.toLowerCase();
  const equipment = req.query.equipment?.toLowerCase();
  const primaryMuscles = req.query.primaryMuscles?.toLowerCase();
  const category = req.query.category?.toLowerCase();
  const findObj = {};
  if (level != null && level) findObj.level = level;
  if (mechanic != null && mechanic) findObj.mechanic = mechanic;
  if (equipment != null && equipment) findObj.equipment = equipment;
  if (primaryMuscles != null && primaryMuscles)
    findObj.primaryMuscles = primaryMuscles;
  if (category != null && category) findObj.category = category;

  const exercises = await Exercise.find(findObj);
  returnData(req, res, 200, exercises);
});
