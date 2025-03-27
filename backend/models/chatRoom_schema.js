const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError');
const slugify = require('slugify');

const chatRoomSchema = new mongoose.Schema(
  {
    memberID: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
      },
    ],
    roomCode: {
      type: String,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

chatRoomSchema.virtual('message', {
  ref: 'chatLog',
  foreignField: 'roomID',
  localField: '_id',
});

// chatRoomSchema.pre('save', function(next) {
//     if (this.memberID.length !== 2) {
//         if (this.memberID[0] === this.memberID[1]){
//             next(new Error('Users cannot be the same'));
//         }
//         next(new Error('This room chat must have 2 users'));
//     } else {
//         next();
//     }
// });

const chatRoom = mongoose.model('chatRoom', chatRoomSchema);

module.exports = chatRoom;
