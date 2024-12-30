const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const AppError = require('./../utils/appError');
const slugify = require('slugify');

const userSchema = mongoose.Schema({
  fullname: {
    type: String,
    trim: true,
    required: [true, 'Please provide your fullname'],
  },
  yearOfBirth: {
    type: Number,
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
  },
  phoneNumber: {
    type: String,
    trim: true,
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
  passwordChangedAt: Date,
  token: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
  },
  slug: {
    type: String,
  },
});

userSchema.pre('save', function (next) {
  this.fullname = this.fullname
    .split(' ')
    .map((name) => name[0].toUpperCase() + name.slice(1))
    .join(' ');

  const now = new Date(Date.now());
  this.age = now.getFullYear() - parseInt(this.yearOfBirth);
  this.slug = slugify(this.fullname.toLowerCase());
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.post('save', function (error, doc, next) {
  if (error.code === 11000) {
    next(new AppError('Duplicate key value in mongoDB', 11000));
  } else {
    next(new AppError('Bad Request!!! 💥💥 ', 400));
  }
});

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('users', userSchema);

module.exports = User;
