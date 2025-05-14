const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  _id: false,
  diseaseID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'disease',
    required: [true, 'Please provide the diseaseID for this history!'],
  },
  prediction: {
    type: Number,
    required: [true, 'Please provide the prediction value for this history!'],
  },
});

const symptomHistorySchema = new mongoose.Schema(
  {
    result: {
      type: [resultSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'Please provide result of this history!',
      },
    },
    symptoms: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'symptom',
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'Please provide result of this history!',
      },
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'Please provide userID for this symptom history!'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: {},
  }
);

const SymptomHistory = mongoose.model('symptomhistory', symptomHistorySchema);

module.exports = SymptomHistory;
