const mongoose = require('mongoose');

const target = new mongoose.Schema({
  targetID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Vui lòng nhập ID của đích đến!'],
    autopopulate: {
      select: '_id fullname username email',
    },
  },
  haveRead: {
    type: Boolean,
    default: false,
  },
  _id: false,
});

const notificationSchema = new mongoose.Schema(
  {
    sentDate: {
      type: Date,
    },
    from: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'user',
      required: [
        true,
        'Please provide userID of the person who sent the notification',
      ],
      autopopulate: {
        select: 'fullname username',
      },
    },
    to: {
      type: [target],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length > 0;
        },
        message: 'Please provide the userID who received the notification',
      },
    },
    type: {
      type: String,
      enum: {
        values: [
          'system',
          'news-comment',
          'reply-comment',
          'message',
          'course',
          'news',
          'user',
        ],
        message: 'Notification type is unvalid! Please choose another type!',
      },
    },
    content: {
      type: String,
      validate: {
        validator: function (v) {
          if (this.type == 'news-comment' || this.type == 'reply-comment') {
            return !!v;
          }
        },
        message: 'Please input the content for this notification!',
      },
    },
    newsID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'news',
      autopopulate: {
        select: 'title slug',
      },
      validate: {
        validator: function (v) {
          if (this.type == 'news-comment' || this.type == 'reply-comment') {
            return !!v;
          }
        },
        message: 'Please input the newsID for this notification!',
      },
    },
    chatRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'chatRoom',
      validate: {
        validator: function (v) {
          if (this.type == 'message') {
            return !!v;
          }
        },
        message: 'Please input the chatRoomID for this notification!',
      },
    },
  },
  {
    timestamps: {},
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

notificationSchema.plugin(require('mongoose-autopopulate'));

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
