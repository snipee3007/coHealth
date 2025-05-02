const mongoose = require('mongoose');

const hospitalsSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: [true, 'A hospital must have some id!'],
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'A hospital must have a name!'],
    trim: true,
    unique: true,
  },
  image: {
    type: String,
    required: [
      true,
      'A hospital must have a image to demonstrate that hospital',
    ],
    trim: true,
  },
  address: {
    type: String,
    trim: true,
    required: [true, 'A hospital must have an address'],
  },
  web: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  coordinates: {
    type: [Number],
  },
});

const hospitals = mongoose.model('hospitals', hospitalsSchema);

module.exports = hospitals;
