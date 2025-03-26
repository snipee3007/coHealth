const mongoose = require('mongoose');

const adultCompendiumSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please input the name of activity'],
  },
  activityCode: {
    type: Number,
    required: [true, 'Please provide the activity code'],
    unique: [true, 'The code has already taken! Please provide another code!'],
  },
  metValue: {
    type: Number,
    required: [true, 'Please provide the MET Value of this activity'],
  },
  description: {
    type: String,
    required: [true, 'Please provide this activity description'],
  },
});

const AdultCompendium = mongoose.model(
  'AdultCompendium',
  adultCompendiumSchema
);

module.exports = AdultCompendium;
