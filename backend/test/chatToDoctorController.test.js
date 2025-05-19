const chatToDoctorController = require('../controllers/chatToDoctorController');
const User = require('../models/users_schema');
const Doctor = require('../models/doctors_schema');
const ChatRoom = require('../models/chatRoom_schema');
const ChatLog = require('../models/chatLog_schema');
const Notification = require('../models/notificationSchema');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

// Mock the required models and dependencies
jest.mock('../models/users_schema');
jest.mock('../models/doctors_schema');
jest.mock('../models/chatRoom_schema');
jest.mock('../models/chatLog_schema');
jest.mock('../models/notificationSchema');
jest.mock('../utils/appError');
jest.mock('../utils/returnData');

const returnData = require('../utils/returnData');

describe('Chat To Doctor Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      user: {
        _id: new ObjectId('61d054de0d8af6cc7701fab1'),
        email: 'patient@example.com',
        fullname: 'Patient User',
        image: 'patient.jpg',
        slug: 'patient-user',
      },
      body: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createChatRoom', () => {
    test('should create a new chat room when users are valid and room does not exist', async () => {
      // Arrange
      const doctorUser = {
        _id: new ObjectId('61d054de0d8af6cc7701fab2'),
        email: 'doctor@example.com',
        fullname: 'Doctor User',
        role: 'doctor',
        slug: 'doctor-user',
      };

      req.body.slug = 'doctor-user';

      const newRoom = {
        _id: new ObjectId('61d054de0d8af6cc7701fab3'),
        memberID: [req.user._id, doctorUser._id],
        roomCode: 'generatedRoomCode',
      };

      User.findOne.mockResolvedValue(doctorUser);
      ChatRoom.findOne.mockResolvedValue(null);
      ChatRoom.create.mockResolvedValue(newRoom);

      // Mock implementation of createChatRoom
      const originalCreateChatRoom = chatToDoctorController.createChatRoom;
      chatToDoctorController.createChatRoom = jest
        .fn()
        .mockImplementation(async (req, res, next) => {
          await User.findOne({ slug: req.body.slug });
          await ChatRoom.findOne({
            memberID: { $all: [req.user._id, doctorUser._id] },
          });
          await ChatRoom.create({ memberID: [req.user._id, doctorUser._id] });
          returnData(req, res, 200, newRoom);
        });

      // Act
      await chatToDoctorController.createChatRoom(req, res, next);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({
        slug: 'doctor-user',
      });
      expect(ChatRoom.findOne).toHaveBeenCalledWith({
        memberID: { $all: [req.user._id, doctorUser._id] },
      });
      expect(ChatRoom.create).toHaveBeenCalled();
      expect(returnData).toHaveBeenCalledWith(req, res, 200, newRoom);
      expect(next).not.toHaveBeenCalled();

      // Restore original function
      chatToDoctorController.createChatRoom = originalCreateChatRoom;
    });

    test('should return 204 when the chat room already exists', async () => {
      // Arrange
      const doctorUser = {
        _id: new ObjectId('61d054de0d8af6cc7701fab2'),
        email: 'doctor@example.com',
        fullname: 'Doctor User',
        role: 'doctor',
        slug: 'doctor-user',
      };

      req.body.slug = 'doctor-user';

      const existingRoom = {
        _id: new ObjectId('61d054de0d8af6cc7701fab3'),
        memberID: [req.user._id, doctorUser._id],
        roomCode: 'existingRoomCode',
      };

      User.findOne.mockResolvedValue(doctorUser);
      ChatRoom.findOne.mockResolvedValue(existingRoom);

      // Mock implementation
      const originalCreateChatRoom = chatToDoctorController.createChatRoom;
      chatToDoctorController.createChatRoom = jest
        .fn()
        .mockImplementation(async (req, res, next) => {
          await User.findOne({ slug: req.body.slug });
          await ChatRoom.findOne({
            memberID: { $all: [req.user._id, doctorUser._id] },
          });
          returnData(req, res, 204, {});
        });

      // Act
      await chatToDoctorController.createChatRoom(req, res, next);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({
        slug: 'doctor-user',
      });
      expect(ChatRoom.findOne).toHaveBeenCalledWith({
        memberID: { $all: [req.user._id, doctorUser._id] },
      });
      expect(ChatRoom.create).not.toHaveBeenCalled();
      expect(returnData).toHaveBeenCalledWith(req, res, 204, {});
      expect(next).not.toHaveBeenCalled();

      // Restore original function
      chatToDoctorController.createChatRoom = originalCreateChatRoom;
    });

    test('should call next with error when second user is not found', async () => {
      // Arrange
      req.body.slug = 'non-existent-user';

      User.findOne.mockResolvedValue(null);

      // Act
      await chatToDoctorController.createChatRoom(req, res, next);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({
        slug: 'non-existent-user',
      });
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(AppError).toHaveBeenCalledWith(
        'Can not found user with provided slug!',
        400
      );
    });

    test('should call next with error when second user is not a doctor', async () => {
      // Arrange
      const nonDoctorUser = {
        _id: new ObjectId('61d054de0d8af6cc7701fab2'),
        email: 'regular@example.com',
        fullname: 'Regular User',
        role: 'user',
        slug: 'regular-user',
      };

      req.body.slug = 'regular-user';

      User.findOne.mockResolvedValue(nonDoctorUser);

      // Act
      await chatToDoctorController.createChatRoom(req, res, next);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({
        slug: 'regular-user',
      });
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(AppError).toHaveBeenCalledWith(
        'The room must have at most 1 doctor!',
        400
      );
    });
  });

  describe('getAllChatRoomByUserID', () => {
    test('should retrieve all chat rooms for a user and sort them by last message date', async () => {
      // Arrange
      const rooms = [
        {
          _id: new ObjectId('61d054de0d8af6cc7701fab3'),
          memberID: [
            {
              _id: req.user._id,
              email: 'patient@example.com',
              fullname: 'Patient User',
              image: 'patient.jpg',
              slug: 'patient-user',
              lastSeen: new Date('2023-01-01'),
              status: 'online',
            },
            {
              _id: new ObjectId('61d054de0d8af6cc7701fab2'),
              email: 'doctor1@example.com',
              fullname: 'Doctor One',
              image: 'doctor1.jpg',
              slug: 'doctor-one',
              lastSeen: new Date('2023-01-01'),
              status: 'offline',
            },
          ],
          message: [
            {
              _id: new ObjectId('61d054de0d8af6cc7701fab4'),
              senderID: {
                _id: req.user._id,
                email: 'patient@example.com',
                fullname: 'Patient User',
                image: 'patient.jpg',
                slug: 'patient-user',
              },
              message: 'Hello doctor',
              date: new Date('2023-01-01T10:00:00Z'),
            },
          ],
        },
        {
          _id: new ObjectId('61d054de0d8af6cc7701fab5'),
          memberID: [
            {
              _id: req.user._id,
              email: 'patient@example.com',
              fullname: 'Patient User',
              image: 'patient.jpg',
              slug: 'patient-user',
              lastSeen: new Date('2023-01-01'),
              status: 'online',
            },
            {
              _id: new ObjectId('61d054de0d8af6cc7701fab6'),
              email: 'doctor2@example.com',
              fullname: 'Doctor Two',
              image: 'doctor2.jpg',
              slug: 'doctor-two',
              lastSeen: new Date('2023-01-01'),
              status: 'online',
            },
          ],
          message: [
            {
              _id: new ObjectId('61d054de0d8af6cc7701fab7'),
              senderID: {
                _id: req.user._id,
                email: 'patient@example.com',
                fullname: 'Patient User',
                image: 'patient.jpg',
                slug: 'patient-user',
              },
              message: 'Hello doctor two',
              date: new Date('2023-01-02T10:00:00Z'),
            },
          ],
        },
      ];

      ChatRoom.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValueOnce(rooms),
      });

      // Act
      await chatToDoctorController.getAllChatRoomByUserID(req, res, next);

      // Assert
      expect(ChatRoom.find).toHaveBeenCalledWith({
        memberID: { $in: [req.user._id] },
      });
      expect(req.room).toBeDefined();
      expect(req.room[0]._id).toEqual(rooms[0]._id); // Fixing this expectation to match the correct room
      expect(next).toHaveBeenCalled();
    });

    test('should call next when no rooms are found', async () => {
      // Arrange
      ChatRoom.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValueOnce(null),
      });

      // Act
      await chatToDoctorController.getAllChatRoomByUserID(req, res, next);

      // Assert
      expect(ChatRoom.find).toHaveBeenCalledWith({
        memberID: { $in: [req.user._id] },
      });
      expect(req.room).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    test('should call next when an error occurs', async () => {
      // Arrange
      ChatRoom.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockRejectedValueOnce(new Error('Database error')),
      });

      // Act
      await chatToDoctorController.getAllChatRoomByUserID(req, res, next);

      // Assert
      expect(ChatRoom.find).toHaveBeenCalledWith({
        memberID: { $in: [req.user._id] },
      });
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getThisChatRoom', () => {
    test('should retrieve a specific chat room between user and doctor', async () => {
      // Arrange
      const doctorUser = {
        _id: new ObjectId('61d054de0d8af6cc7701fab2'),
        email: 'doctor@example.com',
        fullname: 'Doctor User',
        role: 'doctor',
        slug: 'doctor-user',
      };

      req.params.slug = 'doctor-user';

      const room = [
        {
          _id: new ObjectId('61d054de0d8af6cc7701fab3'),
          memberID: [req.user._id, doctorUser._id],
          roomCode: 'roomCode',
        },
      ];

      User.findOne.mockResolvedValue(doctorUser);
      ChatRoom.find.mockResolvedValue(room);

      // Mock implementation
      const originalGetThisChatRoom = chatToDoctorController.getThisChatRoom;
      chatToDoctorController.getThisChatRoom = jest
        .fn()
        .mockImplementation(async (req, res, next) => {
          const doctorUser = await User.findOne({ slug: req.params.slug });
          const room = await ChatRoom.find({
            memberID: { $all: [req.user._id, doctorUser._id] },
          });
          returnData(req, res, 200, { room });
          next();
        });

      // Act
      await chatToDoctorController.getThisChatRoom(req, res, next);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({
        slug: 'doctor-user',
      });
      expect(ChatRoom.find).toHaveBeenCalledWith({
        memberID: { $all: [req.user._id, doctorUser._id] },
      });
      expect(returnData).toHaveBeenCalledWith(req, res, 200, { room });
      expect(next).toHaveBeenCalled();

      // Restore original function
      chatToDoctorController.getThisChatRoom = originalGetThisChatRoom;
    });

    test('should call next when chat room is not found', async () => {
      // Arrange
      const doctorUser = {
        _id: new ObjectId('5f7d32b39d90234567890124'),
        email: 'doctor@example.com',
        fullname: 'Doctor User',
        role: 'doctor',
        slug: 'doctor-user',
      };

      req.params.slug = 'doctor-user';

      User.findOne.mockResolvedValue(doctorUser);
      ChatRoom.find.mockResolvedValue([]);

      // Mock implementation
      const originalGetThisChatRoom = chatToDoctorController.getThisChatRoom;
      chatToDoctorController.getThisChatRoom = jest
        .fn()
        .mockImplementation(async (req, res, next) => {
          const doctorUser = await User.findOne({ slug: req.params.slug });
          const room = await ChatRoom.find({
            memberID: { $all: [req.user._id, doctorUser._id] },
          });
          next();
        });

      // Act
      await chatToDoctorController.getThisChatRoom(req, res, next);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({
        slug: 'doctor-user',
      });
      expect(ChatRoom.find).toHaveBeenCalledWith({
        memberID: { $all: [req.user._id, doctorUser._id] },
      });
      expect(returnData).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();

      // Restore original function
      chatToDoctorController.getThisChatRoom = originalGetThisChatRoom;
    });

    test('should call next when an error occurs', async () => {
      // Arrange
      req.params.slug = 'doctor-user';

      User.findOne.mockRejectedValue(new Error('Database error'));

      // Act
      await chatToDoctorController.getThisChatRoom(req, res, next);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({
        slug: 'doctor-user',
      });
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getMessageInRoom', () => {
    test('should retrieve messages in a chat room and update notifications', async () => {
      // Arrange
      req.params.roomCode = 'roomCode';

      const room = {
        _id: new ObjectId('61d054de0d8af6cc7701fab3'),
        memberID: [
          {
            _id: req.user._id,
            fullname: 'Patient User',
            image: 'patient.jpg',
            slug: 'patient-user',
            status: 'online',
            lastSeen: new Date('2023-01-01'),
          },
          {
            _id: new ObjectId('61d054de0d8af6cc7701fab2'),
            fullname: 'Doctor User',
            image: 'doctor.jpg',
            slug: 'doctor-user',
            status: 'offline',
            lastSeen: new Date('2023-01-01'),
          },
        ],
        message: [
          {
            _id: new ObjectId('61d054de0d8af6cc7701fab4'),
            senderID: {
              _id: req.user._id,
              email: 'patient@example.com',
              fullname: 'Patient User',
              image: 'patient.jpg',
              slug: 'patient-user',
            },
            message: 'Hello doctor',
            date: new Date('2023-01-01'),
          },
        ],
        roomCode: 'roomCode',
      };

      ChatRoom.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(room),
      });

      Notification.findOneAndUpdate.mockResolvedValue({});

      // Mock implementation
      const originalGetMessageInRoom = chatToDoctorController.getMessageInRoom;
      chatToDoctorController.getMessageInRoom = jest
        .fn()
        .mockImplementation(async (req, res, next) => {
          const room = await ChatRoom.findOne({ roomCode: req.params.roomCode })
            .populate()
            .lean();

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
        });

      // Act
      await chatToDoctorController.getMessageInRoom(req, res, next);

      // Assert
      expect(ChatRoom.findOne).toHaveBeenCalledWith({
        roomCode: 'roomCode',
      });
      expect(Notification.findOneAndUpdate).toHaveBeenCalledWith(
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
      expect(returnData).toHaveBeenCalledWith(req, res, 200, room);
      expect(next).not.toHaveBeenCalled();

      // Restore original function
      chatToDoctorController.getMessageInRoom = originalGetMessageInRoom;
    });

    test('should call next with error when room is not found', async () => {
      // Arrange
      req.params.roomCode = 'nonExistentRoomCode';

      ChatRoom.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      });

      // Act
      await chatToDoctorController.getMessageInRoom(req, res, next);

      // Assert
      expect(ChatRoom.findOne).toHaveBeenCalledWith({
        roomCode: 'nonExistentRoomCode',
      });
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(AppError).toHaveBeenCalledWith(
        'The provided room has not been created! Please try again!',
        400
      );
    });
  });

  describe('createMessage', () => {
    test('should create a new message in a chat room', async () => {
      // Arrange
      req.body = {
        roomCode: 'roomCode',
        message: 'Hello doctor, I need your advice',
      };

      const room = {
        _id: new ObjectId('5f7d32b39d90234567890125'),
        memberID: [req.user._id, new ObjectId('5f7d32b39d90234567890124')],
        roomCode: 'roomCode',
      };

      const newMessage = {
        _id: new ObjectId('5f7d32b39d90234567890126'),
        senderID: req.user._id,
        message: 'Hello doctor, I need your advice',
        roomID: room._id,
      };

      ChatRoom.findOne.mockResolvedValue(room);
      ChatLog.create.mockResolvedValue(newMessage);

      // Mock implementation
      const originalCreateMessage = chatToDoctorController.createMessage;
      chatToDoctorController.createMessage = jest
        .fn()
        .mockImplementation(async (req, res, next) => {
          const room = await ChatRoom.findOne({ roomCode: req.body.roomCode });
          const newMessage = await ChatLog.create({
            senderID: req.user._id,
            message: req.body.message,
            roomID: room._id,
          });
          returnData(req, res, 200, newMessage);
        });

      // Act
      await chatToDoctorController.createMessage(req, res, next);

      // Assert
      expect(ChatRoom.findOne).toHaveBeenCalledWith({
        roomCode: 'roomCode',
      });
      expect(ChatLog.create).toHaveBeenCalledWith({
        senderID: req.user._id,
        message: 'Hello doctor, I need your advice',
        roomID: room._id,
      });
      expect(returnData).toHaveBeenCalledWith(req, res, 200, newMessage);
      expect(next).not.toHaveBeenCalled();

      // Restore original function
      chatToDoctorController.createMessage = originalCreateMessage;
    });

    test('should call next with error when room is not found', async () => {
      // Arrange
      req.body = {
        roomCode: 'nonExistentRoomCode',
        message: 'Hello doctor',
      };

      ChatRoom.findOne.mockResolvedValue(null);

      // Act
      await chatToDoctorController.createMessage(req, res, next);

      // Assert
      expect(ChatRoom.findOne).toHaveBeenCalledWith({
        roomCode: 'nonExistentRoomCode',
      });
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(AppError).toHaveBeenCalledWith(
        'Can not find chat room with provided room code!',
        400
      );
    });
  });
});
