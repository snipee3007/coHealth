const mongoose = require('mongoose');
const { validate } = require('./appointments_schema');

const activitySchema = new mongoose.Schema({
  activityCode: {
    type: String,
    trim: true,
    required: [true, "Please provide the activity's code for this activity"],
  },
  duration: {
    type: Number,
    min: 0,
    required: [true, 'Please provide the duration doing current activity'],
  },
  _id: false,
});

const inputSchema = new mongoose.Schema({
  age: {
    type: Number,
    min: 0,
    required: [
      true,
      "Please provide the age (years) for this user's information!",
    ],
  },
  weight: {
    type: Number,
    min: 0,
    required: [
      true,
      "Please provide the weight (kg) for this user's information!",
    ],
  },
  height: {
    type: Number,
    min: 0,
    required: [
      true,
      "Please provide the height (cm) for this user's information!",
    ],
  },
  gender: {
    type: String,
    enum: {
      values: ['male', 'female'],
      message: 'The gender must be male or female!',
    },
    required: [true, "Please provide the gender for this user's information!"],
  },
  method: {
    type: String,
    enum: {
      values: ['normal tdee', 'tee'],
      message: 'The method must be normal tdee or tee',
    },
    required: [true, 'Please provide the method for this calculation!'],
  },
  activities: {
    type: activitySchema,
  },
  activityIntensity: {
    type: String,
    enum: {
      values: [
        'sedentary',
        'lightly active',
        'moderately active',
        'very active',
        'extra active',
      ],
      message:
        'The activity intensity must be sedentary, lightly active, moderately active, very active or extra active',
    },
  },
  target: {
    type: String,
    enum: {
      values: ['gain', 'maintain', 'lose'],
      messsage: 'The target must be gain, maintain or lose!',
    },
    required: [true, 'Please provide the target for this user!'],
  },
  speed: {
    type: String,
    enum: {
      values: ['fast', 'normal', 'slow'],
    },
    validate: {
      validator: function (v) {
        if (this.target !== 'maintain') {
          return !!v;
        }
      },
      message: 'Please provide the speed information for this calculation!',
    },
  },
  targetWeight: {
    type: Number,
    min: [1, 'The target weight must above 1kg!'],

    validate: {
      validator: function (v) {
        if (this.target !== 'maintain') {
          return !!v;
        }
      },
      message:
        'Please provide the target weight information for this calculation!',
    },
  },
  _id: false,
});

const resultSchema = new mongoose.Schema({
  bmi: {
    type: Number,
    min: 0,
    max: 99,
  },
  tdee: {
    type: Number,
    min: 0,
    max: 9999,
  },
  weekAfterToAchieveTarget: {
    type: Number,
    min: 0,
  },
  targetCalories: {
    type: Number,
  },
  bmiStatus: {
    type: String,
    trim: true,
    enum: {
      values: [
        'Underweight (Severe thinness)',
        'Underweight (Moderate thinness)',
        'Underweight (Mild thinness)',
        'Normal Range',
        'Overweight (Pre-obese)',
        'Obese (Class I)',
        'Obese (Class II)',
        'Obese (Class III)',
      ],
      message: 'Please input valid bmi status!',
    },
  },
  caloriesIntakeList: {
    type: [Number],
    min: 0,
  },
  _id: false,
});

const calculateHistorySchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please input userID for this calculate history!'],
    },
    basicInfo: {
      type: inputSchema,
      required: [true, 'Please provide information for this user!'],
    },
    result: {
      type: resultSchema,
      required: [true, 'Please provide the result after calculating!'],
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

const CalculateHistory = mongoose.model(
  'CalculateHistory',
  calculateHistorySchema
);

module.exports = CalculateHistory;
