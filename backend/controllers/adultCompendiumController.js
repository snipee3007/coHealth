const AdultCompendium = require('../models/adultCompendium_schema.js');
const catchAsync = require('../utils/catchAsync.js');
const returnData = require('../utils/returnData.js');

exports.getAllAdultCompendiumName = catchAsync(async (req, res, next) => {
  const data = await AdultCompendium.find().distinct('name');
  returnData(req, res, 200, data);
});

exports.getDescription = catchAsync(async (req, res, next) => {
  const name = req.params.name;
  const data = await AdultCompendium.find({ name });
  returnData(req, res, 200, data);
});
