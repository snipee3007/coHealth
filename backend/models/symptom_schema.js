const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError');
const slugify = require('slugify');

const symptomSchema = new mongoose.Schema(
  {
    symptomID: {
      type: mongoose.Schema.Types.ObjectId,
    },
    symptom: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    organ: {
      type: String,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

const symptom = mongoose.model('symptom', symptomSchema);

module.exports = symptom;
