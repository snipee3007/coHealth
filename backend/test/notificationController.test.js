const notificationController = require('../controllers/notificationController');
const Notification = require('../models/notificationSchema');
const User = require('../models/users_schema');
const returnData = require('../utils/returnData');
const catchAsync = require('../utils/catchAsync');

// Mock the required modules
jest.mock('../models/notificationSchema');
jest.mock('../models/users_schema');
jest.mock('../utils/returnData');
jest.mock('../utils/catchAsync', () => {
  return jest.fn((fn) => {
    return async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  });
});

describe('Notification Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock request, response, and next function
    req = {
      user: {
        _id: 'mockUserId',
        id: 'mockUserId',
      },
      params: {
        id: 'mockNotificationId',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  describe('updateReadNotification', () => {
    test('should update notification as read when news and user are provided', async () => {
      // Arrange
      req.news = { _id: 'mockNewsId' };
      Notification.findOneAndUpdate = jest.fn().mockResolvedValue({});

      // Act
      await notificationController.updateReadNotification(req, res, next);

      // Assert
      expect(Notification.findOneAndUpdate).toHaveBeenCalledWith(
        { newsID: 'mockNewsId' },
        {
          $set: {
            'to.$[element].haveRead': true,
          },
        },
        { arrayFilters: [{ 'element.targetID': 'mockUserId' }] }
      );
      expect(next).toHaveBeenCalled();
    });

    test('should update notification as read when only user is provided', async () => {
      // Arrange
      Notification.findByIdAndUpdate = jest.fn().mockResolvedValue({});

      // Act
      await notificationController.updateReadNotification(req, res, next);

      // Assert
      expect(Notification.findByIdAndUpdate).toHaveBeenCalledWith(
        'mockNotificationId',
        {
          $set: {
            'to.$[element].haveRead': true,
          },
        },
        { arrayFilters: [{ 'element.targetID': 'mockUserId' }] }
      );
      expect(returnData).toHaveBeenCalledWith(
        req,
        res,
        200,
        {},
        'Update read notification successful!'
      );
    });

    test('should call next when neither news nor user is provided', async () => {
      // Arrange
      req.user = null;

      // Act
      await notificationController.updateReadNotification(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(Notification.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(Notification.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe('deleteNotification', () => {
    test('should delete notification and return success message', async () => {
      // Arrange
      const mockNotification = {
        _id: 'mockNotificationId',
        type: 'comment',
      };

      Notification.findById = jest.fn().mockResolvedValue(mockNotification);

      // Act
      await notificationController.deleteNotification(req, res, next);

      // Assert
      expect(Notification.findById).toHaveBeenCalledWith('mockNotificationId');
      expect(returnData).toHaveBeenCalledWith(
        req,
        res,
        204,
        { type: 'comment', userID: 'mockUserId' },
        'Delete notification successful!'
      );
    });

    test('should handle when notification is not found', async () => {
      // Arrange
      Notification.findById = jest.fn().mockResolvedValue(null);

      // Mock the error handling from catchAsync
      const error = new Error("Cannot read property 'type' of null");

      // Act
      await notificationController.deleteNotification(req, res, next);

      // Assert
      expect(Notification.findById).toHaveBeenCalledWith('mockNotificationId');
      // Since notification is null, your catchAsync will catch the TypeError and pass it to next
      expect(next).toHaveBeenCalled();
    });
  });

  // Add a test for getNotification (which is currently empty in the source code)
  describe('getNotification', () => {
    test('should be defined', () => {
      // Assert
      expect(notificationController.getNotification).toBeDefined();
    });
  });
});
