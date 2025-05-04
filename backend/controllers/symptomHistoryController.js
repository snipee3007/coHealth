const catchAsync = require('../utils/catchAsync.js');
const SymptonHistory = require('../models/symptomHistory_schema.js');
const Disease = require('../models/disease_schema.js');
const Sympton = require('../models/symptom_schema.js');
exports.getHistory = catchAsync(async (req, res, next) => {
  const historyID = req.query.historyID;
  res.status(200).json({});
});

exports.createHistory = catchAsync(async (req, res, next) => {
  if (!req.user) return res.status(204).json({});

  const diseases = req.body.diseases;
  const symptoms = req.body.symptoms;
  console.log(diseases, symptoms);
  const result = diseases.map((array) => {
    return { name: array[0], predict: array[1] };
  });
  const diseaseList = [];
  const symptomList = [];
  for (let i = 0; i < result.length; ++i) {
    const value = result[i];
    if (parseFloat(value.predict) / 100 > 0) {
      const data = await Disease.findOne({ name: value.name });
      diseaseList.push({
        diseaseID: data.id,
        prediction: parseFloat(value.predict) / 100,
      });
    }
  }
  for (let i = 0; i < symptoms.length; ++i) {
    const data = await Sympton.findOne({ symptom: symptoms[i] });
    symptomList.push(data.id);
  }
  console.log(diseaseList, symptomList);
  const data = await SymptonHistory.create({
    result: diseaseList,
    userID: req.user.id,
    symptoms: symptomList,
  });
  res.status(200).json({ status: 'success', data });
});
