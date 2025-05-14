const Notification = require('./../models/notificationSchema.js');
const User = require('./../models/users_schema.js');
const ChatRoom = require('./../models/chatRoom_schema.js');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');
const returnData = require('../utils/returnData.js');
exports.getNotification = catchAsync(async (req, res, next) => {});

exports.updateReadNotification = catchAsync(async (req, res, next) => {
  // Click on the post that have the comment or reply notification
  if (req.news && req.user) {
    const news = req.news;
    await Notification.findOneAndUpdate(
      { newsID: news._id },
      {
        $set: {
          'to.$[element].haveRead': true,
        },
      },
      { arrayFilters: [{ 'element.targetID': req.user._id }] }
    );
    return next();
  } else if (req.user) {
    const notificationID = req.params.id;
    await Notification.findByIdAndUpdate(
      notificationID,
      {
        $set: {
          'to.$[element].haveRead': true,
        },
      },
      { arrayFilters: [{ 'element.targetID': req.user._id }] }
    );
    returnData(req, res, 200, {}, 'Update read notification successful!');
  } else {
    next();
  }
});

// exports.deletePast3MonthsNotification = async (req, res, next) => {
//   const user = req.user;
//   const notifications = await Notification.find({
//     'to.targetID': user._id,
//     createdAt: {
//       $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 3),
//     },
//   }).sort('updatedAt');
//   if (notifications.length > 0) {
//     for (let i = 0; i < notifications.length; ++i) {
//       if (notifications[i].to.length > 1) {
//         await Notification.findByIdAndUpdate(notifications[i]._id, {
//           $pullAll: { to: [{ targetID: user._id }] },
//         });
//         res.status(201).json({
//           status: 'success',
//           message: 'Xóa người dùng khỏi thông báo thành công!',
//         });
//       } else {
//         await Notification.findByIdAndDelete(notifications[i]._id);
//         res.status(204).json({
//           status: 'success',
//           message: 'Xóa thông báo thành công!',
//         });
//       }
//     }
//   }
// };
