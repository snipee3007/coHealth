const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError');
const slugify = require('slugify');

const doctorSchema = new mongoose.Schema({
  major: {
    type: String,
    trim: true,
    required: [true, 'Please provide your major'],
  },
  workAt: {
    type: String,
    trim: true,
    required: [true, 'Please provide your work place'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 4.5,
  },
  yearEXP: {
    type: Number,
    min: 0,
    required: [true, 'Please provide your year experience'],
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Please provide userID for this doctor!'],
    unique: [
      true,
      'This UserID has already taken! Please provide another UserID!',
    ],
  },
});

doctorSchema.pre('save', function (next) {
  this.major =
    this.major.charAt(0).toUpperCase() + this.major.slice(1).toLowerCase();
  next();
});

const Doctor = mongoose.model('doctor', doctorSchema);

module.exports = Doctor;
