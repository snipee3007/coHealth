const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  calories: {
    type: Number,
    required: true,
  },
  ingredients: [{
    type: String,
    unique: true,
    required: true,
    trim: true,
  }],
});

const mealSchema = new mongoose.Schema({
  meal: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  items: [itemSchema],
});

const Food = mongoose.model('Food', mealSchema);

module.exports = Food;
