const User = require('../models/users_schema.js');
const Symptom = require('../models/symptom_schema.js');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');
const fs = require('fs');
const path = require('path');
const returnData = require('../utils/returnData.js');

exports.getAllSymptoms = catchAsync(async (req, res, next) => {
  const symptoms = await Symptom.find({}).sort({ symptom: 1 }).lean();
  returnData(req, res, 200, symptoms);
});

exports.getSymptomByTag = catchAsync(async (req, res, next) => {
  const tag = req.params.name;
  const symptoms = await Symptom.find({
    body: tag,
  })
    .sort({ symptom: 1 })
    .lean();
  returnData(req, res, 200, symptoms);
});

exports.createSymptom = catchAsync(async (req, res, next) => {
  const folderPath = path.join(__dirname, '../datas/symptom');
  const allFiles = fs
    .readdirSync(folderPath)
    .filter((file) => file.endsWith('.json'));

  let allSymptoms = [];

  for (const file of allFiles) {
    const filePath = path.join(folderPath, file);
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const symptoms = JSON.parse(fileData);
    allSymptoms = allSymptoms.concat(symptoms);
  }

  const inserted = await Symptom.insertMany(allSymptoms);
  returnData(req, res, 200, { results: inserted.length, symtoms: inserted });
});
