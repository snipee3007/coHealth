const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    newsID: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'The comment must from news!'],
      ref: 'news',
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "The comment must have the user's ID!"],
      ref: 'user',
    },
    message: {
      type: String,
      required: [true, "The comment must have the comment's message!"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: {},
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Comment = mongoose.model('comment', commentSchema);

module.exports = Comment;
