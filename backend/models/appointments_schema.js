const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError');
const slugify = require('slugify');

const appointmentSchema = new mongoose.Schema({
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    fullname: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    doctorID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    time: {
      type: Date,
      require: true
    },
    reason: {
      type: String,
      require: true
    },
    status: {
      type: Number,
      default: -1
    },
    appointmentCode: {
      type: String, 
      require: true,
      unique: true
    }
    },
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

appointmentSchema.index({doctorID: 1, time: 1}, {unique: true})
  
const appointment = mongoose.model('appointment', appointmentSchema);

module.exports = appointment;
