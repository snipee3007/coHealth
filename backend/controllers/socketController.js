const Notification = require('./../models/notificationSchema.js');
const News = require('./../models/news_schema.js');
const Comment = require('./../models/commentsSchema.js');
const User = require('./../models/users_schema.js');

exports.notificationOnNewComment = async (userID, postID, content) => {
  const post = await News.findById(postID);
  // Find the relevant notification in 1 hours ago
  const searchNoti = await Notification.findOne({
    postID,
    'to.targetID': post.userID,
    type: 'post-comment',
    updatedAt: { $gte: new Date(Date.now() - 1000 * 60 * 60) },
  });
  // If can find the notification, then update that notification
  let data;
  if (searchNoti) {
    data = await Notification.findOneAndUpdate(
      {
        postID,
        'to.targetID': post.userID,
        type: 'post-comment',
        updatedAt: { $gte: new Date(Date.now() - 1000 * 60 * 60) },
      },
      { updatedAt: Date.now(), content, $addToSet: { from: userID } }
    );
  }
  // If can not find the notification, create new notification
  else {
    data = await Notification.create({
      type: 'post-comment',
      from: userID,
      to: { targetID: post.userID },
      content: content,
      postID: postID,
    });
  }
};

exports.notificationOnNewReply = async (userID, replyComment, content) => {
  const comment = await Comment.findById(replyComment);
  const replyUser = await User.findById(comment.userID);
  const searchNoti = await Notification.findOne({
    type: 'reply-comment',
    'to.targetID': replyUser._id,
    postID: comment.newsID,
    updatedAt: { $gte: new Date(Date.now() - 1000 * 60 * 60) },
  });
  let data;
  if (searchNoti) {
    data = await Notification.findOneAndUpdate(
      {
        type: 'reply-comment',
        'to.targetID': replyUser._id,
        postID: comment.newsID,
        updatedAt: { $gte: new Date(Date.now() - 1000 * 60 * 60) },
      },
      { updatedAt: Date.now(), content, $addToSet: { from: userID } }
    );
  } else {
    data = await Notification.create({
      type: 'reply-comment',
      from: userID,
      to: { targetID: replyUser._id },
      content: content,
      postID: comment.newsID,
    });
  }
};

exports.getNotification = async (currentUserID) => {
  if (currentUserID) {
    const data = await Notification.find(
      {
        'to.targetID': currentUserID,
      },
      { to: { $elemMatch: { targetID: currentUserID } } }
    )
      .select('type content createdAt updatedAt postID')
      .sort('-createdAt');
    return data;
  } else return;
};
