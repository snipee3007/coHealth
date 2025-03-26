const AdultCompendium = require('../models/adultCompendium_schema.js');
const catchAsync = require('../utils/catchAsync.js');

exports.getAllAdultCompendiumName = catchAsync(async (req, res, next) => {
  const data = await AdultCompendium.find().distinct('name');
  res.status(200).json({
    status: 'success',
    data,
  });
});

exports.getDescription = catchAsync(async (req, res, next) => {
  const name = req.params.name;
  const data = await AdultCompendium.find({ name });
  console.log(data);
  res.status(200).json({
    status: 'success',
    data,
  });
});

exports.getAllAdultCompendium = catchAsync(async (req, res, next) => {
  const data = await AdultCompendium.find({});
  res.status(200).json({});
});
