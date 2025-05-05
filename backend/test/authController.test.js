const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/users_schema');
const authController = require('../controllers/authController');
const Email = require('../utils/email');
const AppError = require('../utils/appError');

// Mock dependencies
jest.mock('../models/users_schema');
jest.mock('../utils/email');
jest.mock('jsonwebtoken');
jest.mock('crypto');
jest.mock('util'); // Add this line to mock the util module
jest.mock('../utils/appError'); // Add this line to properly mock AppError

// Add these mock implementations at the top
// Mock AppError constructor
AppError.mockImplementation((message, statusCode) => {
  return {
    message,
    statusCode,
    isOperational: true,
  };
});

// Implement the missing createSendToken function if not available in authController
if (!authController.createSendToken) {
  authController.createSendToken = (user, statusCode, res) => {
    const token = 'test-token';

    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };

    res.cookie('jwt', token, cookieOptions);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  };
}

describe('Auth Controller', () => {
  let req;
  let res;
  let next;
  // Track spies for restoration
  let createSendTokenSpy;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request, response, and next function
    req = {
      body: {},
      headers: {
        authorization: 'Bearer test-token',
      },
      cookies: {
        jwt: 'test-token',
      },
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost'),
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      locals: {},
      writeHead: jest.fn(),
      end: jest.fn(),
    };

    next = jest.fn();

    // Mock process.env
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '90d';
    process.env.JWT_COOKIE_EXPIRES_IN = '90';
    process.env.OTP_SECRET = 'test-otp-secret';
    process.env.OTP_EXPIRES_IN = '300';

    // Setup jwt.sign mock
    jwt.sign.mockReturnValue('test-token');

    // Setup jwt.verify mock
    jwt.verify = jest.fn().mockImplementation((token, secret, callback) => {
      if (callback) {
        callback(null, {
          id: '60d21b4667d0d8992e610c85',
          iat: Date.now() / 1000,
        });
      }
      return { id: '60d21b4667d0d8992e610c85', iat: Date.now() / 1000 };
    });

    // Mock crypto
    const crypto = require('crypto');
    crypto.createHash = jest.fn().mockReturnValue({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('hashed_token'),
    });

    // Setup promisify mock (fix for promisify errors)
    promisify.mockReturnValue(
      jest.fn().mockImplementation((...args) => {
        return Promise.resolve({
          id: '60d21b4667d0d8992e610c85',
          iat: Date.now() / 1000,
        });
      })
    );

    // Spy on createSendToken instead of mocking it
    createSendTokenSpy = jest.spyOn(authController, 'createSendToken');
  });

  afterEach(() => {
    // Restore spies
    if (createSendTokenSpy) {
      createSendTokenSpy.mockRestore();
    }
  });

  describe('signIn', () => {
    it('should return error when email/username is not provided', async () => {
      // Arrange
      req.body = {
        password: 'password123',
      };

      // Act
      await authController.signIn(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Please provide Email/Username and password!',
          statusCode: 400,
        })
      );
    });

    it('should return error when password is not provided', async () => {
      // Arrange
      req.body = {
        signInField: 'test@example.com',
      };

      // Act
      await authController.signIn(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Please provide Email/Username and password!',
          statusCode: 400,
        })
      );
    });

    it('should return error when user does not exist', async () => {
      // Arrange
      req.body = {
        signInField: 'nonexistent@example.com',
        password: 'password123',
      };

      const userFindOneChain = {
        select: jest.fn().mockResolvedValue(null),
      };
      User.findOne.mockReturnValue(userFindOneChain);

      // Act
      await authController.signIn(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Incorrect email/username or password',
          statusCode: 401,
        })
      );
    });
  });

  describe('protect', () => {
    it('should return error when no token is provided', async () => {
      // Arrange
      req.headers.authorization = undefined;
      req.cookies.jwt = undefined;

      // Act
      await authController.protect(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'You are not logged in! Please log in to get access.',
          statusCode: 401,
        })
      );
    });
  });

  describe('forgotPassword', () => {
    it('should return error when user does not exist', async () => {
      // Arrange
      req.body = {
        email: 'nonexistent@example.com',
      };

      User.findOne.mockResolvedValue(null);

      // Act
      await authController.forgotPassword(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message:
            'There is no user that have this email in our database! Please use another email!.',
          statusCode: 404,
        })
      );
    });
  });

  describe('resetPassword', () => {
    it('should return error when token is invalid or expired', async () => {
      // Arrange
      req.params = {
        token: 'invalid-token',
      };

      User.findOne.mockResolvedValue(null);

      // Act
      await authController.resetPassword(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Token is invalid or has expired',
          statusCode: 400,
        })
      );
    });
  });

  describe('restrictTo', () => {
    it('should call next() when user has required role', async () => {
      // Arrange
      req.user = {
        _id: new ObjectId('60d21b4667d0d8992e610c85'),
        role: ['doctor'],
      };

      const restrictToMiddleware = authController.restrictTo([
        'doctor',
        'admin',
      ]);

      // Act
      restrictToMiddleware(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.writeHead).not.toHaveBeenCalled();
    });

    it('should redirect when user does not have required role', async () => {
      // Arrange
      req.user = {
        _id: new ObjectId('60d21b4667d0d8992e610c85'),
        role: ['user'],
      };

      const restrictToMiddleware = authController.restrictTo([
        'doctor',
        'admin',
      ]);

      // Act
      restrictToMiddleware(req, res, next);

      // Assert
      expect(res.writeHead).toHaveBeenCalledWith(
        302,
        'Unauthentication user!',
        { location: '/' }
      );
      expect(res.end).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() if user is admin regardless of specified roles', async () => {
      // Arrange
      req.user = {
        _id: new ObjectId('60d21b4667d0d8992e610c85'),
        role: ['admin'],
      };

      const restrictToMiddleware = authController.restrictTo(['doctor']);

      // Act
      restrictToMiddleware(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.writeHead).not.toHaveBeenCalled();
    });
  });

  describe('restrictToAPI', () => {
    it('should call next() when user has required role', async () => {
      // Arrange
      req.user = {
        _id: new ObjectId('60d21b4667d0d8992e610c85'),
        role: ['doctor'],
      };

      const restrictToAPIMiddleware = authController.restrictToAPI(['doctor']);

      // Act
      restrictToAPIMiddleware(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 when user does not have required role', async () => {
      // Arrange
      req.user = {
        _id: new ObjectId('60d21b4667d0d8992e610c85'),
        role: ['user'],
      };

      const restrictToAPIMiddleware = authController.restrictToAPI(['doctor']);

      // Act
      restrictToAPIMiddleware(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 'failed',
        message: 'Bạn không có quyền sử dụng tính năng này!',
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
