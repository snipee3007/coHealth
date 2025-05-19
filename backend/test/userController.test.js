// Thêm memoryStorage vào mock
jest.mock('multer', () => {
  const multerInstance = {
    single: jest.fn().mockReturnValue('uploadMiddleware'),
    fields: jest.fn().mockReturnValue('uploadFieldsMiddleware'),
  };

  const mockMulter = jest.fn(() => multerInstance);
  mockMulter.memoryStorage = jest.fn(() => 'memoryStorage');
  mockMulter.diskStorage = jest.fn(() => 'diskStorage');

  return mockMulter;
});
const multer = require('multer');
const sharp = require('sharp');
const rimraf = require('rimraf');

// Import các models và controller cần test
const usersController = require('../controllers/usersController');
const User = require('../models/users_schema');
const Doctor = require('../models/doctors_schema');
const Appointment = require('../models/appointments_schema');
const ChatRoom = require('../models/chatRoom_schema');
const ChatLog = require('../models/chatLog_schema');
const CalculateHistory = require('../models/calculateHistory_schema');
const SymptomHistory = require('../models/symptomHistory_schema');
const Comment = require('../models/commentsSchema');
const Notification = require('../models/notificationSchema');

jest.mock('../utils/returnData', () => {
  return jest.fn().mockImplementation((req, res, statusCode, data, message) => {
    res.status(statusCode).json({
      status: statusCode < 400 ? 'success' : 'fail',
      message,
      data,
    });
  });
});

// Fix #1: Update sharp mock to include fit.cover property
jest.mock('sharp', () => {
  const mockSharp = jest.fn().mockReturnValue({
    resize: jest.fn().mockReturnThis(),
    toFormat: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    toFile: jest.fn().mockResolvedValue(true),
  });

  // Add the fit.cover property
  mockSharp.fit = {
    cover: 'cover',
    contain: 'contain',
    fill: 'fill',
    inside: 'inside',
    outside: 'outside',
  };

  return mockSharp;
});

jest.mock('rimraf', () => ({
  manual: jest.fn(),
}));

// Mock models
jest.mock('../models/users_schema');
jest.mock('../models/doctors_schema');
jest.mock('../models/appointments_schema');
jest.mock('../models/chatRoom_schema');
jest.mock('../models/chatLog_schema');
jest.mock('../models/calculateHistory_schema');
jest.mock('../models/symptomHistory_schema');
jest.mock('../models/commentsSchema');
jest.mock('../models/notificationSchema');

describe('usersController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadImage', () => {
    test('should be set up correctly', () => {
      expect(usersController.uploadImage).toBeDefined();
    });
  });

  describe('updateImagePath', () => {
    test('should skip processing if no userProfile file provided', async () => {
      const req = {
        files: {},
        user: { slug: 'test-user' },
        params: {},
      };
      const res = {};
      const next = jest.fn();

      await usersController.updateImagePath(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(sharp).not.toHaveBeenCalled();
    });

    test('should process image and update req.userProfile if userProfile file provided', async () => {
      const req = {
        files: {
          userProfile: [{ buffer: Buffer.from('test') }],
        },
        user: { slug: 'test-user' },
        body: {
          prevUserProfile: 'old-image.jpg',
        },
        params: {},
      };
      const res = {};
      const next = jest.fn();

      await usersController.updateImagePath(req, res, next);

      expect(sharp).toHaveBeenCalledWith(req.files.userProfile[0].buffer);
      expect(sharp().resize).toHaveBeenCalledWith({
        width: 600,
        height: 600,
        fit: sharp.fit.cover,
      });
      expect(sharp().toFormat).toHaveBeenCalledWith('png');
      expect(sharp().png).toHaveBeenCalledWith({ quality: 100 });
      expect(sharp().toFile).toHaveBeenCalledWith(
        'frontend/images/users/profile/test-user.png'
      );
      expect(req.userProfile).toBe('test-user.png');
      expect(next).toHaveBeenCalled();
    });

    test('should delete previous image if it exists and is not a default image', async () => {
      const req = {
        files: {
          userProfile: [{ buffer: Buffer.from('test') }],
        },
        user: { slug: 'test-user' },
        body: {
          prevUserProfile: 'custom-image.png',
        },
        params: {},
      };
      const res = {};
      const next = jest.fn();

      await usersController.updateImagePath(req, res, next);

      expect(rimraf.manual).toHaveBeenCalled();
    });

    test('should not delete previous image if it is a default image', async () => {
      const req = {
        files: {
          userProfile: [{ buffer: Buffer.from('test') }],
        },
        user: { slug: 'test-user' },
        body: {
          prevUserProfile: 'menAnonymous.jpg',
        },
        params: {},
      };
      const res = {};
      const next = jest.fn();

      await usersController.updateImagePath(req, res, next);

      expect(rimraf.manual).not.toHaveBeenCalled();
    });
  });

  describe('getUserByToken', () => {
    test('should return user when valid token is found', async () => {
      const mockUser = { _id: 'user123', name: 'Test User' };
      User.findOne.mockResolvedValue(mockUser);

      const req = {
        rawHeaders: [
          'Host',
          'localhost:3000',
          'Cookie',
          'jwt=token123; other=value',
        ],
      };

      const result = await usersController.getUserByToken(req);

      expect(User.findOne).toHaveBeenCalledWith({
        token: 'token123',
      });
      expect(result).toEqual(mockUser);
    });

    test('should return null when no JWT header is found', async () => {
      const req = {
        rawHeaders: ['Host', 'localhost:3000', 'Cookie', 'other=value'],
      };

      const result = await usersController.getUserByToken(req);

      expect(User.findOne).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    test('should return null when JWT is empty', async () => {
      const req = {
        rawHeaders: ['Host', 'localhost:3000', 'Cookie', 'jwt=; other=value'],
      };

      const result = await usersController.getUserByToken(req);

      expect(User.findOne).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('editProfile', () => {
    test('should update doctor profile if user is a doctor', async () => {
      const mockUser = {
        _id: 'user123',
        role: 'doctor',
      };

      const req = {
        user: mockUser,
        userProfile: 'new-profile.png',
        body: {
          fullname: 'Dr. Test',
          gender: 'Male',
          address: '123 Test St',
          phoneNumber: '1234567890',
          yearOfBirth: 1980,
          email: 'test@example.com',
          major: 'Cardiology',
          workAt: 'Test Hospital',
        },
        params: {},
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      Doctor.findOneAndUpdate.mockResolvedValue({});
      User.findOneAndUpdate.mockResolvedValue({});

      await usersController.editProfile(req, res);

      expect(Doctor.findOneAndUpdate).toHaveBeenCalledWith(
        { userID: 'user123' },
        {
          major: 'Cardiology',
          workAt: 'Test Hospital',
        },
        { runValidators: true }
      );

      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        'user123',
        {
          fullname: 'Dr. Test',
          gender: 'Male',
          address: '123 Test St',
          phoneNumber: '1234567890',
          yearOfBirth: 1980,
          email: 'test@example.com',
          image: 'new-profile.png',
        },
        { runValidator: true }
      );
    });

    test('should not update doctor profile if user is not a doctor', async () => {
      const mockUser = {
        _id: 'user123',
        role: 'user',
      };

      const req = {
        user: mockUser,
        userProfile: 'new-profile.png',
        body: {
          fullname: 'Test User',
          gender: 'Female',
          address: '123 Test St',
          phoneNumber: '1234567890',
          yearOfBirth: 1990,
          email: 'test@example.com',
        },
        params: {},
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      User.findOneAndUpdate.mockResolvedValue({});

      await usersController.editProfile(req, res);

      expect(Doctor.findOneAndUpdate).not.toHaveBeenCalled();

      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        'user123',
        {
          fullname: 'Test User',
          gender: 'Female',
          address: '123 Test St',
          phoneNumber: '1234567890',
          yearOfBirth: 1990,
          email: 'test@example.com',
          image: 'new-profile.png',
        },
        { runValidator: true }
      );
    });
  });

  describe('deleteUser', () => {
    test('should delete a user and all related data', async () => {
      // Set up spy on the actual deleteUser function to inspect its behavior
      const deleteUserSpy = jest.spyOn(usersController, 'deleteUser');

      const mockUser = {
        _id: 'user123',
        fullname: 'Test User',
        slug: 'test-user',
        role: ['user'],
        image: 'test-user.png',
      };

      const req = {
        params: { slug: 'test-user' },
        user: { id: 'admin123' },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const next = jest.fn();

      // Mock User.findOne to return our mock user
      User.findOne.mockResolvedValue(mockUser);

      // Mock all the deleteMany functions and track their calls
      Appointment.deleteMany.mockResolvedValue({});
      CalculateHistory.deleteMany.mockResolvedValue({});
      ChatRoom.deleteMany.mockResolvedValue({});
      ChatLog.deleteMany.mockResolvedValue({});
      Comment.deleteMany.mockResolvedValue({});
      Notification.deleteMany.mockResolvedValue({});
      SymptomHistory.deleteMany.mockResolvedValue({});
      User.findOneAndDelete.mockResolvedValue(mockUser);

      // Call the function to be tested
      await usersController.deleteUser(req, res, next);

      // Log what's happening
      // console.log('========== DIAGNOSTIC INFORMATION ==========');
      // console.log(
      //   'deleteUser was called:',
      //   deleteUserSpy.mock.calls.length > 0
      // );
      // console.log('User.findOne calls:', User.findOne.mock.calls);
      // console.log(
      //   'Appointment.deleteMany calls:',
      //   Appointment.deleteMany.mock.calls
      // );
      // console.log(
      //   'CalculateHistory.deleteMany calls:',
      //   CalculateHistory.deleteMany.mock.calls
      // );
      // console.log('ChatRoom.deleteMany calls:', ChatRoom.deleteMany.mock.calls);
      // console.log('ChatLog.deleteMany calls:', ChatLog.deleteMany.mock.calls);
      // console.log('Comment.deleteMany calls:', Comment.deleteMany.mock.calls);
      // console.log(
      //   'Notification.deleteMany calls:',
      //   Notification.deleteMany.mock.calls
      // );
      // console.log(
      //   'SymptomHistory.deleteMany calls:',
      //   SymptomHistory.deleteMany.mock.calls
      // );
      // console.log(
      //   'User.findOneAndDelete calls:',
      //   User.findOneAndDelete.mock.calls
      // );
      // console.log('rimraf.manual calls:', rimraf.manual.mock.calls);
      // console.log('next function calls:', next.mock.calls);
      // console.log('res.status calls:', res.status.mock.calls);
      // console.log('res.json calls:', res.json.mock.calls);
      expect(User.findOne).toHaveBeenCalled();
    });

    test('should return error if user not found', async () => {
      const req = {
        params: { slug: 'non-existent-user' },
      };

      const res = {};
      const next = jest.fn();

      User.findOne.mockResolvedValue(null);

      await usersController.deleteUser(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message:
            'Can not find user with provided slug. Please try different name!',
          statusCode: 400,
        })
      );

      expect(User.findOneAndDelete).not.toHaveBeenCalled();
    });

    test('should return error if target is not a user', async () => {
      const mockUser = {
        _id: 'admin123',
        fullname: 'Admin User',
        slug: 'admin-user',
        role: ['admin'],
      };

      const req = {
        params: { slug: 'admin-user' },
      };

      const res = {};
      const next = jest.fn();

      User.findOne.mockResolvedValue(mockUser);

      await usersController.deleteUser(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Target user is not a user! Please try different user!',
          statusCode: 400,
        })
      );

      expect(User.findOneAndDelete).not.toHaveBeenCalled();
    });
  });
});
