const User = require('../models/users_schema.js');
const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('./../utils/appError.js');
const Notification = require('./../models/notificationSchema.js');
const Doctor = require('./../models/doctors_schema.js');
const ChatRoom = require('./../models/chatRoom_schema.js');
const ChatLog = require('./../models/chatLog_schema.js');
const errorController = require('./errorController.js');

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
    return res.status(400).json({
      status: 'failed',
      message: 'User not found',
    });
  } else if (secondUser.role !== 'doctor') {
    return res.status(400).json({
      status: 'failed',
      message: 'The room must have 1 doctor and 1 user',
    });
  } else {
    const room = await ChatRoom.findOne({
      memberID: { $all: [firstUser._id, secondUser._id] },
    });
    // console.log(room);
    if (room) return res.status(204).json();

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
    res.status(200).json({
      status: 'success',
      data: newRoom,
    });
  }
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
      // console.log(room[0].memberID[0].fullname)
      // res.status(200).json({
      //   status: 'success',
      //   data: {
      //     room,
      //   },
      // });
      // sort trong js là tính giá trị 2 thứ trừ nhau, dương thì đổi chỗ
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
      res.status(200).json({
        status: 'success',
        data: {
          room,
        },
      });
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
  try {
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
      res.status(200).json({
        status: 'success',
        data: room,
      });
    } else {
      res.status(400).json({
        status: 'failed',
        message: 'This room is not created',
      });
      res.end();
    }
  } catch {
    res.status(400).json({
      status: 'failed',
      message: 'Can not find chat room',
    });
    res.end();
  }
});

exports.createMessage = catchAsync(async (req, res, next) => {
  try {
    // get chatroom
    const roomCode = req.body.roomCode;
    const message = req.body.message;

    const user = req.user;
    const room = await ChatRoom.findOne({
      roomCode: roomCode,
    });
    if (!room) {
      res.status(400).json({
        status: 'failed',
        message: 'Can not find this chat room',
      });
      res.end();
    } else {
      const newMessage = await ChatLog.create({
        senderID: user._id,
        message: message,
        roomID: room._id,
      });
      res.status(200).json({
        status: 'success',
        data: newMessage,
      });
    }
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err.message,
    });
    res.end();
  }
});
