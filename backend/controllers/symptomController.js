const User = require('../models/users_schema.js');
const Symptom = require('../models/symptom_schema.js');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');
const fs = require('fs');
const path = require('path');

exports.getAllSymptoms = catchAsync(async (req, res, next) => {
  const Symptoms = await Symptom.find({}).lean();
  res.status(200).json({
    status: 'success',
    data: Symptoms,
  });
});

exports.getSymptomByTag = catchAsync(async (req, res, next) => {
  const tag = req.params.name;
  const Symptoms = await Symptom.find({
    body: tag,
  }).lean();

  res.status(200).json({
    status: 'success',
    data: Symptoms,
  });
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

  res.status(200).json({
    status: 'success',
    results: inserted.length,
    data: inserted,
  });
});
