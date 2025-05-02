const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError');
const slugify = require('slugify');

const diseaseSchema = new mongoose.Schema(
  {
    diseaseID: {
      type: mongoose.Schema.Types.ObjectId,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    commonSymptoms: [
      {
        type: String,
        required: true,
      },
    ],
    riskFactors: [
      {
        type: String,
        required: true,
      },
    ],
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

const disease = mongoose.model('disease', diseaseSchema);

module.exports = disease;
