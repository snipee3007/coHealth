const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const appError = require('./../utils/errorHandler');
const historySchema = mongoose.Schema({
  takeDate: {
    type: String,
    required: [true, 'A history must have a date that taking the test'],
    default: Date.now(),
  },
  height: {
    type: Number,
    required: [true, 'Please provide your height'],
    min: 0,
  },
  weight: {
    type: Number,
    required: [true, 'Please provide your weight'],
    min: 0,
  },
  BMI: Number,
  caloriesIntakePerDay: {
    type: Number,
  },
  activityPerWeek: {
    type: String,
    enum: {
      values: [
        'sedentary',
        'lightly',
        'moderately',
        'very_active',
        'extra_active',
      ],
      message:
        'The activity input must from these selection: "sedentary", "lightly", "moderately", "very_active", "extra_active",',
    },
    required: [true, 'Please provide your activity per week'],
    default: 'sedentary',
    lowercase: true,
  },
});

const userSchema = mongoose.Schema({
  fullname: {
    type: String,
    trim: true,
    required: [true, 'Please provide your fullname'],
  },
  birthdate: {
    type: Date,
    max: Date.now(),
    required: [true, 'Please provide your birthday'],
  },
  age: {
    type: Number,
    min: 0,
  },
  gender: {
    type: String,
    enum: {
      values: ['male', 'female'],
      message: 'Gender must be male or female',
    },
    required: [true, 'Please provide your gender'],
    lowercase: true,
  },
  address: {
    type: String,
    trim: true,
    lowercase: true,
  },
  phoneNum: {
    type: String,
    trim: true,
    required: [true, 'Please provide your phone number'],
  },
  email: {
    type: String,
    trim: true,
    required: [true, 'Please provide your email'],
    validate: {
      validator: validator.isEmail,
      message: 'Please provide a valid email',
    },
    unique: true,
  },
  password: {
    type: String,
    trim: true,
    required: [true, 'Please provide your password'],
  },
  confirmPassword: {
    type: String,
    trim: true,
    required: [true, 'Please re-enter your password'],
    validate: {
      validator: function (el) {
        return this.password === el;
      },
      message: 'The passwords are not the same',
    },
    select: false,
  },
  history: {
    type: [historySchema],
  },

});

userSchema.pre('save', function (next) {
  this.fullname = this.fullname
    .split(' ')
    .map((name) => name[0].toUpperCase() + name.slice(1))
    .join(' ');

  this.birthdate = new Date(this.birthdate);

  const convert_year = 1000 * 60 * 60 * 24 * 30 * 12;
  // 1000 ms -> 1s
  // 60s -> 1min
  // 60min -> 1h
  // 24h -> 1d
  // ~30d -> 1m
  // 12m -> 1y

  this.age = parseInt((Date.now() - this.birthdate) / convert_year, 10);

  this.history.forEach(
    function (itemHistory) {
      itemHistory.BMI =
        itemHistory.weight /
        ((itemHistory.height * itemHistory.height) / (100 * 100));
      const BMR =
        this.gender === 'male'
          ? itemHistory.weight * 10 +
            itemHistory.height * 6.25 -
            5 * this.age +
            5
          : itemHistory.weight * 10 +
            itemHistory.height * 6.25 -
            5 * this.age -
            161;

      if (itemHistory.activityPerWeek === 'sedentary') {
        itemHistory.caloriesIntakePerDay = BMR * 1.2;
      } else if (itemHistory.activityPerWeek === 'lightly') {
        itemHistory.caloriesIntakePerDay = BMR * 1.375;
      } else if (itemHistory.activityPerWeek === 'moderately') {
        itemHistory.caloriesIntakePerDay = BMR * 1.55;
      } else if (itemHistory.activityPerWeek === 'very_active') {
        itemHistory.caloriesIntakePerDay = BMR * 1.725;
      } else if (itemHistory.activityPerWeek === 'extra_active') {
        itemHistory.caloriesIntakePerDay = BMR * 1.9;
      }
    }.bind(this)
  );

  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.confirmPassword = undefined;
  next();
});

userSchema.post('save', function (error, doc, next) {
  // console.log(error);
  if (error.code === 11000) {
    next(appError(error, 11000));
  } else {
    next(appError(error, 400));
  }
});

const User = mongoose.model('users', userSchema);

module.exports = User;
