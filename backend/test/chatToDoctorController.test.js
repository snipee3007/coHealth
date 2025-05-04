const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const User = require('../models/users_schema.js');
const Notification = require('../models/notificationSchema.js');
const Doctor = require('../models/doctors_schema.js');
const ChatRoom = require('../models/chatRoom_schema.js');
const ChatLog = require('../models/chatLog_schema.js');
const AppError = require('../utils/appError.js');
const catchAsync = require('../utils/catchAsync.js');
const controller = require('../controllers/chatToDoctorController.js');

// Mock all required models and utilities
jest.mock('../models/users_schema.js');
jest.mock('../models/notificationSchema.js');
jest.mock('../models/doctors_schema.js');
jest.mock('../models/chatRoom_schema.js');
jest.mock('../models/chatLog_schema.js');
jest.mock('../utils/catchAsync.js', () => (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
});

// Tạo các giá trị ObjectId cố định để sử dụng trong test
const USER_ID = new ObjectId('61d054de0d8af6cc7701fab1');
const DOCTOR_ID = new ObjectId('61d054de0d8af6cc7701fab2');
const DOCTOR_ID_2 = new ObjectId('61d054de0d8af6cc7701fab3');
const ROOM_ID = new ObjectId('61d054de0d8af6cc7701fab4');
const ROOM_ID_2 = new ObjectId('61d054de0d8af6cc7701fab5');
const MESSAGE_ID = new ObjectId('61d054de0d8af6cc7701fab6');
const MESSAGE_ID_2 = new ObjectId('61d054de0d8af6cc7701fab7');

describe('chatToDoctorController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: {
        _id: USER_ID,
        fullname: 'Test User',
        email: 'test@example.com',
        image: 'user.jpg',
        slug: 'test-user',
        role: 'user',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };
    next = jest.fn();

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('createChatRoom', () => {
    it('should return 400 if second user is not found', async () => {
      req.body.slug = 'non-existent-doctor';
      User.findOne.mockResolvedValue(null);

      await controller.createChatRoom(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'failed',
        message: 'User not found',
      });
    });

    it('should return 400 if second user is not a doctor', async () => {
      req.body.slug = 'not-a-doctor';
      const nonDoctorId = new ObjectId('61d054de0d8af6cc7701fac1');
      User.findOne.mockResolvedValue({
        _id: nonDoctorId,
        role: 'user',
        fullname: 'Not A Doctor',
      });

      await controller.createChatRoom(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'failed',
        message: 'The room must have 1 doctor and 1 user',
      });
    });

    it('should return 204 if chatroom already exists', async () => {
      req.body.slug = 'doctor-slug';

      User.findOne.mockResolvedValue({
        _id: DOCTOR_ID,
        role: 'doctor',
        fullname: 'Doctor Name',
      });

      ChatRoom.findOne.mockResolvedValue({
        _id: ROOM_ID,
        memberID: [USER_ID, DOCTOR_ID],
        roomCode: 'existing-room-code',
      });

      await controller.createChatRoom(req, res, next);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalled();
    });

    it('should create new chatroom successfully', async () => {
      req.body.slug = 'doctor-slug';

      User.findOne.mockResolvedValue({
        _id: DOCTOR_ID,
        role: 'doctor',
        fullname: 'Doctor Name',
      });

      ChatRoom.findOne.mockResolvedValue(null);

      const mockNewRoom = {
        _id: ROOM_ID,
        memberID: [USER_ID, DOCTOR_ID],
        roomCode: 'new-room-code',
      };

      ChatRoom.create.mockResolvedValue(mockNewRoom);

      await controller.createChatRoom(req, res, next);

      expect(ChatRoom.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockNewRoom,
      });
    });
  });

  describe('getAllChatRoomByUserID', () => {
    it('should fetch all chat rooms and sort them by latest message', async () => {
      const mockRooms = [
        {
          _id: ROOM_ID,
          memberID: [
            {
              _id: USER_ID,
              email: 'test@example.com',
              fullname: 'Test User',
              image: 'user.jpg',
              slug: 'test-user',
              lastSeen: new Date('2023-01-01'),
              status: 'online',
            },
            {
              _id: DOCTOR_ID,
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
              _id: MESSAGE_ID,
              senderID: {
                _id: USER_ID,
                email: 'test@example.com',
                fullname: 'Test User',
                image: 'user.jpg',
                slug: 'test-user',
              },
              message: 'Hello Doctor One',
              date: new Date('2023-01-01'),
            },
          ],
        },
        {
          _id: ROOM_ID_2,
          memberID: [
            {
              _id: USER_ID,
              email: 'test@example.com',
              fullname: 'Test User',
              image: 'user.jpg',
              slug: 'test-user',
              lastSeen: new Date('2023-01-02'),
              status: 'online',
            },
            {
              _id: DOCTOR_ID_2,
              email: 'doctor2@example.com',
              fullname: 'Doctor Two',
              image: 'doctor2.jpg',
              slug: 'doctor-two',
              lastSeen: new Date('2023-01-02'),
              status: 'online',
            },
          ],
          message: [
            {
              _id: MESSAGE_ID_2,
              senderID: {
                _id: USER_ID,
                email: 'test@example.com',
                fullname: 'Test User',
                image: 'user.jpg',
                slug: 'test-user',
              },
              message: 'Hello Doctor Two',
              date: new Date('2023-01-02'), // More recent message
            },
          ],
        },
      ];

      ChatRoom.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockRooms),
      });

      await controller.getAllChatRoomByUserID(req, res, next);

      expect(ChatRoom.find).toHaveBeenCalledWith({
        memberID: { $in: [req.user._id] },
      });
      expect(next).toHaveBeenCalled();
      expect(req.room).toBeDefined();
      expect(req.room[0]._id).toEqual(mockRooms[0]._id); // Should be sorted by latest message
    });

    it('should call next if no rooms found', async () => {
      ChatRoom.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      });

      await controller.getAllChatRoomByUserID(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should call next if error occurs', async () => {
      ChatRoom.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await controller.getAllChatRoomByUserID(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('getThisChatRoom', () => {
    it('should find a specific chat room between user and doctor', async () => {
      req.params.slug = 'doctor-slug';

      User.findOne.mockResolvedValue({
        _id: DOCTOR_ID,
        role: 'doctor',
        fullname: 'Doctor Name',
      });

      const mockRoom = {
        _id: ROOM_ID,
        memberID: [USER_ID, DOCTOR_ID],
        roomCode: 'room-code',
      };

      ChatRoom.find.mockResolvedValue([mockRoom]);

      await controller.getThisChatRoom(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({
        slug: 'doctor-slug',
      });
      expect(ChatRoom.find).toHaveBeenCalledWith({
        memberID: { $all: [USER_ID, DOCTOR_ID] },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { room: [mockRoom] },
      });
      expect(next).toHaveBeenCalled();
    });

    it('should call next if no room found', async () => {
      req.params.slug = 'doctor-slug';

      User.findOne.mockResolvedValue({
        _id: DOCTOR_ID,
        role: 'doctor',
        fullname: 'Doctor Name',
      });

      ChatRoom.find.mockResolvedValue([]);

      await controller.getThisChatRoom(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should call next if error occurs', async () => {
      req.params.slug = 'doctor-slug';

      User.findOne.mockRejectedValue(new Error('Database error'));

      await controller.getThisChatRoom(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('getMessageInRoom', () => {
    it('should get messages from a specific room and update notifications', async () => {
      req.params.roomCode = 'room-code';

      const mockRoom = {
        _id: ROOM_ID,
        memberID: [
          {
            _id: USER_ID,
            fullname: 'Test User',
            image: 'user.jpg',
            slug: 'test-user',
            status: 'online',
            lastSeen: new Date('2023-01-01'),
          },
          {
            _id: DOCTOR_ID,
            fullname: 'Doctor Name',
            image: 'doctor.jpg',
            slug: 'doctor-slug',
            status: 'offline',
            lastSeen: new Date('2023-01-01'),
          },
        ],
        message: [
          {
            _id: MESSAGE_ID,
            senderID: {
              _id: USER_ID,
              email: 'test@example.com',
              fullname: 'Test User',
              image: 'user.jpg',
              slug: 'test-user',
            },
            message: 'Hello Doctor',
            date: new Date('2023-01-01'),
          },
        ],
        roomCode: 'room-code',
      };

      ChatRoom.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockRoom),
      });

      Notification.findOneAndUpdate.mockResolvedValue({});

      await controller.getMessageInRoom(req, res, next);

      expect(ChatRoom.findOne).toHaveBeenCalledWith({
        roomCode: 'room-code',
      });
      expect(Notification.findOneAndUpdate).toHaveBeenCalledWith(
        {
          chatRoom: ROOM_ID,
          'to.targetID': USER_ID,
        },
        {
          $set: {
            'to.$[element].haveRead': true,
          },
        },
        { arrayFilters: [{ 'element.targetID': USER_ID }] }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockRoom,
      });
    });

    it('should return 400 if room not found', async () => {
      req.params.roomCode = 'nonexistent-room';

      ChatRoom.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      });

      await controller.getMessageInRoom(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'failed',
        message: 'This room is not created',
      });
      expect(res.end).toHaveBeenCalled();
    });

    it('should return 400 if error occurs', async () => {
      req.params.roomCode = 'room-code';

      ChatRoom.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await controller.getMessageInRoom(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'failed',
        message: 'Can not find chat room',
      });
      expect(res.end).toHaveBeenCalled();
    });
  });

  describe('createMessage', () => {
    it('should create a new message in the chat room', async () => {
      req.body = {
        roomCode: 'room-code',
        message: 'Hello Doctor',
      };

      ChatRoom.findOne.mockResolvedValue({
        _id: ROOM_ID,
        memberID: [USER_ID, DOCTOR_ID],
        roomCode: 'room-code',
      });

      const mockNewMessage = {
        _id: MESSAGE_ID,
        senderID: USER_ID,
        message: 'Hello Doctor',
        roomID: ROOM_ID,
      };

      ChatLog.create.mockResolvedValue(mockNewMessage);

      await controller.createMessage(req, res, next);

      expect(ChatRoom.findOne).toHaveBeenCalledWith({
        roomCode: 'room-code',
      });
      expect(ChatLog.create).toHaveBeenCalledWith({
        senderID: USER_ID,
        message: 'Hello Doctor',
        roomID: ROOM_ID,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockNewMessage,
      });
    });

    it('should return 400 if room not found', async () => {
      req.body = {
        roomCode: 'nonexistent-room',
        message: 'Hello Doctor',
      };

      ChatRoom.findOne.mockResolvedValue(null);

      await controller.createMessage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'failed',
        message: 'Can not find this chat room',
      });
      expect(res.end).toHaveBeenCalled();
    });

    it('should return 404 if error occurs', async () => {
      req.body = {
        roomCode: 'room-code',
        message: 'Hello Doctor',
      };

      ChatRoom.findOne.mockRejectedValue(new Error('Database error'));

      await controller.createMessage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'failed',
        message: 'Database error',
      });
      expect(res.end).toHaveBeenCalled();
    });
  });
});
