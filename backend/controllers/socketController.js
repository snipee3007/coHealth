const Notification = require('./../models/notificationSchema.js');
const ChatRoom = require('./../models/chatRoom_schema.js');
const News = require('./../models/news_schema.js');
const Comment = require('./../models/commentsSchema.js');
const User = require('./../models/users_schema.js');

exports.notificationOnNewMessage = async (senderID, roomCode) => {
  // Find the relevant notification in 1 hours ago
  const room = await ChatRoom.findOne({ roomCode });
  console.log(room);
  let receiverID;
  if (senderID == room.memberID[0].toString())
    receiverID = room.memberID[1].toString();
  else receiverID = room.memberID[0].toString();
  const searchNotifiction = await Notification.findOne({
    from: senderID,
    'to.targetID': receiverID,
    chatRoom: room._id,
    type: 'message',
    updatedAt: { $gte: new Date(Date.now() - 1000 * 60 * 60) },
  });
  //
  if (searchNotifiction) {
    await Notification.findOneAndUpdate(
      {
        from: senderID,
        'to.targetID': receiverID,
        type: 'message',
        updatedAt: { $gte: new Date(Date.now() - 1000 * 60 * 60) },
      },
      {
        updatedAt: Date.now(),
        $set: {
          'to.$[element].haveRead': false,
        },
      },
      { arrayFilters: [{ 'element.targetID': receiverID }] }
    );
  } else {
    await Notification.create({
      from: senderID,
      to: { targetID: receiverID },
      chatRoom: room.id,
      type: 'message',
    });
  }
};

exports.notificationOnNewComment = async (userID, newsID, content) => {
  const news = await News.findById(newsID);
  // Find the relevant notification in 1 hours ago
  const searchNoti = await Notification.findOne({
    newsID,
    'to.targetID': news.userID,
    type: 'news-comment',
    updatedAt: { $gte: new Date(Date.now() - 1000 * 60 * 60) },
  });
  // If can find the notification, then update that notification
  if (searchNoti) {
    await Notification.findOneAndUpdate(
      {
        newsID,
        'to.targetID': news.userID,
        type: 'news-comment',
        updatedAt: { $gte: new Date(Date.now() - 1000 * 60 * 60) },
      },
      {
        updatedAt: Date.now(),
        content,
        $set: {
          'to.$[element].haveRead': false,
        },
        $addToSet: { from: userID },
      },
      { arrayFilters: [{ 'element.targetID': news.userID }] }
    );
  }
  // If can not find the notification, create new notification
  else {
    await Notification.create({
      type: 'news-comment',
      from: userID,
      to: { targetID: news.userID },
      content: content,
      newsID: newsID,
    });
  }
};

exports.notificationOnNewReply = async (userID, replyComment, content) => {
  const comment = await Comment.findById(replyComment);
  const replyUser = await User.findById(comment.userID);
  const searchNoti = await Notification.findOne({
    type: 'reply-comment',
    'to.targetID': replyUser._id,
    newsID: comment.newsID,
    updatedAt: { $gte: new Date(Date.now() - 1000 * 60 * 60) },
  });
  let data;
  if (searchNoti) {
    data = await Notification.findOneAndUpdate(
      {
        type: 'reply-comment',
        'to.targetID': replyUser._id,
        newsID: comment.newsID,
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
      newsID: comment.newsID,
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
      .select('type content createdAt updatedAt newsID')
      .sort('-createdAt');
    return data;
  } else return;
};
