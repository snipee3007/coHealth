const mongoose = require('mongoose');

const slugify = require('slugify');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name for this exercise!'],
    unique: [
      true,
      'This name has already used! Please provide different name for this exercise!',
    ],
  },
  force: {
    type: String,
    enum: {
      values: ['none', 'static', 'pull', 'push'],
      message: 'The value of force field is invalid! Please try again!',
    },
  },
  level: {
    type: String,
    enum: {
      values: ['beginner', 'intermediate', 'expert'],
      message:
        'The level for this exercise is invalid! Please try different level',
    },
    required: [true, 'Please provide level for this exercise!'],
  },
  mechanic: {
    type: String,
    enum: {
      values: ['isolation', 'compound', 'none'],
      message:
        'The mechanic for this exercise is invalid! Please try different mechanic!',
    },
    required: [true, 'Please provide mechanic for this exercise!'],
  },
  equipment: {
    type: String,
    enum: {
      values: [
        'none',
        'medicine ball',
        'dumbbell',
        'body only',
        'bands',
        'kettlebells',
        'foam roll',
        'cable',
        'machine',
        'barbell',
        'exercise ball',
        'e-z curl bar',
        'other',
      ],
      message:
        'The equipment for this exercise is invalid! Please try different equipment!',
    },
    required: [true, 'Please provide equipment for this exercise!'],
  },
  primaryMuscles: {
    type: [String],
    enum: {
      values: [
        'abdominals',
        'abductors',
        'adductors',
        'biceps',
        'calves',
        'chest',
        'forearms',
        'glutes',
        'hamstrings',
        'lats',
        'lower back',
        'middle back',
        'neck',
        'quadriceps',
        'shoulders',
        'traps',
        'triceps',
      ],
      message:
        'The primary muscles for this exercise is invalid! Please try different primary muscles!',
    },
    validate: {
      validator: (v) => Array.isArray(v) && !!v,
      message: 'Please provide primary muscles for this exercise!',
    },
  },
  secondaryMuscles: {
    type: [String],
    enum: {
      values: [
        'abdominals',
        'abductors',
        'adductors',
        'biceps',
        'calves',
        'chest',
        'forearms',
        'glutes',
        'hamstrings',
        'lats',
        'lower back',
        'middle back',
        'neck',
        'quadriceps',
        'shoulders',
        'traps',
        'triceps',
      ],
      message:
        'The secondary muscles for this exercise is invalid! Please try different secondary muscles!',
    },
    validate: {
      validator: (v) => Array.isArray(v) && !!v,
      message: 'Please provide secondary muscles for this exercise!',
    },
  },
  instructions: {
    type: [String],
    validate: {
      validator: (v) => Array.isArray(v) && !!v,
      message: 'Please provide instructions for this exercise!',
    },
  },
  category: {
    type: String,
    enum: {
      values: [
        'powerlifting',
        'strength',
        'stretching',
        'cardio',
        'olympic weightlifting',
        'strongman',
        'plyometrics',
      ],
      message:
        'The category for this exercise is invalid! Please try different category!',
    },
    required: [true, 'Please provide category for this exercise!'],
  },
  images: {
    type: [String],
    validate: {
      validator: (v) => Array.isArray(v) && !!v,
      message: 'Please provide image for this exercise!',
    },
  },
  slug: {
    type: String,
    required: [true, 'Please provide the slug for this exercise!'],
  },
});

const Exercise = mongoose.model('exercise', exerciseSchema);

module.exports = Exercise;
