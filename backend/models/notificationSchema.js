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
      required: [true, 'Vui lòng điền ID người gửi của thông báo'],
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
        message: 'Vui lòng điền ID đích đến của thông báo!',
      },
    },
    type: {
      type: String,
      enum: {
        values: [
          'system',
          'news-comment',
          'reply-comment',
          'course',
          'news',
          'user',
        ],
        message:
          'Kiểu thông báo không hợp lệ! Vui lòng chọn lại kiểu thông báo',
      },
    },
    content: {
      type: String,
      required: [true, 'Vui lòng điền thông tin của thông báo này!'],
    },
    newsID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'news',
      autopopulate: {
        select: 'title slug',
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
