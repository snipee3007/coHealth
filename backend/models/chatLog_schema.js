const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError');
const slugify = require('slugify');

const chatLogSchema = new mongoose.Schema({
    date: {
      type: Date,
      default: Date.now,
    },
    senderID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    message: {
      type: String,
      required: [true, "The chat must have the chat's message!"],
    },
    roomID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'chatRoom',
      },
},{
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});



const chatLog = mongoose.model('chatLog', chatLogSchema);

module.exports = chatLog;
