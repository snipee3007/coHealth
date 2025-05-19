const User = require('../models/users_schema.js');
const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('./../utils/appError.js');
const Notification = require('./../models/notificationSchema.js');
const Doctor = require('./../models/doctors_schema.js');
const ChatRoom = require('./../models/chatRoom_schema.js');
const ChatLog = require('./../models/chatLog_schema.js');
const errorController = require('./errorController.js');
const returnData = require('../utils/returnData.js');

exports.createChatRoom = catchAsync(async (req, res, next) => {
  const doctorSlug = req.body.slug;

  const secondUser = await User.findOne({
    slug: doctorSlug,
  });
  const firstUser = req.user;
  // const userSlug = req.params.user
  // const firstUser = await User.findOne({
  //   slug: userSlug,
  // })

  if (!firstUser || !secondUser) {
    return next(new AppError('Can not found user with provided slug!', 400));
  } else if (secondUser.role !== 'doctor') {
    return next(new AppError('The room must have at most 1 doctor!', 400));
  } else {
    const room = await ChatRoom.findOne({
      memberID: { $all: [firstUser._id, secondUser._id] },
    });
    // console.log(room);
    if (room) return returnData(req, res, 204, {});

    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < 32) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    const newRoom = await ChatRoom.create({
      memberID: [firstUser._id, secondUser._id],
      roomCode: result,
    });
    returnData(req, res, 200, newRoom);
  }
  next(new AppError('Unknown Error! Please try again!', 500));
});

exports.getAllChatRoomByUserID = catchAsync(async (req, res, next) => {
  const user = req.user;
  try {
    const rooms = await ChatRoom.find({
      memberID: { $in: [user._id] },
    })
      .populate({
        path: 'memberID',
        select: 'email fullname image slug lastSeen status',
      })
      .populate({
        path: 'message',
        populate: {
          path: 'senderID',
          select: 'email fullname image slug',
        },
      })
      .lean();
    if (rooms) {
      rooms.sort((a, b) => {
        const lastMsgA = a.message?.[a.message.length - 1]?.date || 0;
        const lastMsgB = b.message?.[b.message.length - 1]?.date || 0;
        return new Date(lastMsgB) - new Date(lastMsgA);
      });
      req.room = rooms;
      next();
    } else {
      next();
    }
  } catch {
    next();
  }
});

exports.getThisChatRoom = catchAsync(async (req, res, next) => {
  const user = req.user;
  const doctorSlug = req.params.slug;
  try {
    const doctor = await User.findOne({
      slug: doctorSlug,
    });
    const room = await ChatRoom.find({
      memberID: { $all: [user._id, doctor._id] },
    });
    if (room.length > 0) {
      // console.log(room[0].memberID[0].fullname)
      returnData(req, res, 200, { room });
      next();
    } else {
      // res.status(401).json({
      //   status: 'failed',
      //   message: 'Can not find this chat room',
      // });
      // res.end();
      next();
    }
  } catch {
    // res.status(404).json({
    //   status: 'failed',
    //   message: 'Can not find chat room',
    // });
    // res.end();
    next();
  }
});

exports.getMessageInRoom = catchAsync(async (req, res, next) => {
  const roomCode = req.params.roomCode;
  const room = await ChatRoom.findOne({
    roomCode: roomCode,
  })
    .populate({
      path: 'memberID',
      select: 'fullname image slug status lastSeen',
    })
    .populate({
      path: 'message',
      populate: {
        path: 'senderID',
        select: 'email fullname image slug',
      },
    })
    .lean();

  if (room) {
    // Update notification
    await Notification.findOneAndUpdate(
      {
        chatRoom: room._id,
        'to.targetID': req.user._id,
      },
      {
        $set: {
          'to.$[element].haveRead': true,
        },
      },
      { arrayFilters: [{ 'element.targetID': req.user._id }] }
    );
    returnData(req, res, 200, room);
  } else {
    return next(
      new AppError(
        'The provided room has not been created! Please try again!',
        400
      )
    );
  }
});

exports.createMessage = catchAsync(async (req, res, next) => {
  // get chatroom
  const roomCode = req.body.roomCode;
  const message = req.body.message;

  const user = req.user;
  const room = await ChatRoom.findOne({
    roomCode: roomCode,
  });
  if (!room) {
    return next(
      new AppError('Can not find chat room with provided room code!', 400)
    );
  } else {
    const newMessage = await ChatLog.create({
      senderID: user._id,
      message: message,
      roomID: room._id,
    });
    returnData(req, res, 200, newMessage);
  }
});
