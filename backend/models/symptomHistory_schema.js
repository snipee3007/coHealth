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

const symptonHistorySchema = new mongoose.Schema(
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
      ref: 'sympton',
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'Please provide result of this history!',
      },
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'Please provide userID for this sympton history!'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: {},
  }
);

const SymptonHistory = mongoose.model('symptonhistory', symptonHistorySchema);

module.exports = SymptonHistory;
