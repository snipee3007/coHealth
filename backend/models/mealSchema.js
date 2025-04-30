const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Please provide this meal's name!"],
  },
});

const Meal = mongoose.model('Meal', mealSchema);

module.exports = Meal;
