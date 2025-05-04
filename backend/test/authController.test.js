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

  describe('signUp', () => {
    it('should create a new user and send token', async () => {
      // Arrange
      const userId = new ObjectId('60d21b4667d0d8992e610c85');
      const mockUser = {
        _id: userId,
        email: 'test@example.com',
        password: 'password123',
        gender: 'male',
        yearOfBirth: 1990,
        fullname: 'Test User',
        save: jest.fn().mockResolvedValue({
          _id: userId,
          email: 'test@example.com',
          fullname: 'Test User',
          gender: 'male',
          yearOfBirth: 1990,
          token: 'test-token',
        }),
      };

      req.body = {
        email: 'test@example.com',
        password: 'password123',
        gender: 'male',
        yearOfBirth: 1990,
        fullname: 'Test User',
        confirmPassword: 'password123',
      };

      User.create.mockResolvedValue(mockUser);

      // Act
      await authController.signUp(req, res, next);

      // Assert
      expect(User.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        gender: 'male',
        yearOfBirth: 1990,
        fullname: 'Test User',
        confirmPassword: 'password123',
        image: undefined,
      });

      expect(createSendTokenSpy).toHaveBeenCalledWith(mockUser, 201, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('signIn', () => {
    it('should login user and send token when credentials are correct', async () => {
      // Arrange
      const userId = new ObjectId('60d21b4667d0d8992e610c85');
      const mockUser = {
        _id: userId,
        email: 'test@example.com',
        password: 'hashed_password',
        correctPassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue({
          _id: userId,
          email: 'test@example.com',
          token: 'test-token',
        }),
      };

      req.body = {
        signInField: 'test@example.com',
        password: 'password123',
      };

      const userFindOneChain = {
        select: jest.fn().mockResolvedValue(mockUser),
      };
      User.findOne.mockReturnValue(userFindOneChain);

      // Act
      await authController.signIn(req, res, next);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({
        $or: [{ email: 'test@example.com' }, { username: 'test@example.com' }],
      });

      expect(mockUser.correctPassword).toHaveBeenCalledWith(
        'password123',
        'hashed_password'
      );
      expect(createSendTokenSpy).toHaveBeenCalledWith(mockUser, 200, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

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

    it('should return error when password is incorrect', async () => {
      // Arrange
      const userId = new ObjectId('60d21b4667d0d8992e610c85');
      const mockUser = {
        _id: userId,
        email: 'test@example.com',
        password: 'hashed_password',
        correctPassword: jest.fn().mockResolvedValue(false),
      };

      req.body = {
        signInField: 'test@example.com',
        password: 'wrong_password',
      };

      const userFindOneChain = {
        select: jest.fn().mockResolvedValue(mockUser),
      };
      User.findOne.mockReturnValue(userFindOneChain);

      // Act
      await authController.signIn(req, res, next);

      // Assert
      expect(mockUser.correctPassword).toHaveBeenCalledWith(
        'wrong_password',
        'hashed_password'
      );
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Incorrect email/username or password',
          statusCode: 401,
        })
      );
    });
  });

  describe('protect', () => {
    it('should set req.user and call next when token is valid', async () => {
      // Arrange
      const userId = '60d21b4667d0d8992e610c85';
      const mockUser = {
        _id: new ObjectId(userId),
        email: 'test@example.com',
        changedPasswordAfter: jest.fn().mockReturnValue(false),
      };

      User.findById.mockResolvedValue(mockUser);

      // Act
      await authController.protect(req, res, next);

      // Assert
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(mockUser.changedPasswordAfter).toHaveBeenCalled();
      expect(req.user).toBe(mockUser);
      expect(next).toHaveBeenCalled();
    });

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

    it('should return error when user no longer exists', async () => {
      // Arrange
      const userId = '60d21b4667d0d8992e610c85';
      User.findById.mockResolvedValue(null);

      // Act
      await authController.protect(req, res, next);

      // Assert
      expect(res.clearCookie).toHaveBeenCalledWith('jwt');
      expect(next).toHaveBeenCalled();
    });

    it('should clear cookie when password was changed after token issued', async () => {
      // Arrange
      const userId = '60d21b4667d0d8992e610c85';
      const mockUser = {
        _id: new ObjectId(userId),
        email: 'test@example.com',
        changedPasswordAfter: jest.fn().mockReturnValue(true),
      };

      User.findById.mockResolvedValue(mockUser);

      // Act
      await authController.protect(req, res, next);

      // Assert
      expect(res.clearCookie).toHaveBeenCalledWith('jwt');
      expect(req.user).toBe(mockUser);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('should send reset token email when user exists', async () => {
      // Arrange
      const userId = new ObjectId('60d21b4667d0d8992e610c85');
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        createPasswordResetToken: jest.fn().mockReturnValue('reset-token'),
        passwordResetToken: 'hashed-reset-token',
        passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000),
      };

      req.body = {
        email: 'test@example.com',
      };

      User.findOne.mockResolvedValue(mockUser);
      User.findByIdAndUpdate.mockResolvedValue(mockUser);

      const mockEmailInstance = {
        sendPasswordReset: jest.fn().mockResolvedValue({}),
      };

      Email.mockImplementation(() => mockEmailInstance);

      // Act
      await authController.forgotPassword(req, res, next);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockUser.createPasswordResetToken).toHaveBeenCalled();
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        {
          passwordResetToken: 'hashed-reset-token',
          passwordResetExpires: expect.any(Date),
        },
        { runValidators: true }
      );

      expect(Email).toHaveBeenCalledWith(
        mockUser,
        'http://localhost/resetPassword/reset-token'
      );

      expect(mockEmailInstance.sendPasswordReset).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Token has been sent through email!',
      });
    });

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
    it('should reset password when token is valid', async () => {
      // Arrange
      const userId = new ObjectId('60d21b4667d0d8992e610c85');
      const mockUser = {
        _id: userId,
        password: 'old_password',
        confirmPassword: 'old_password',
        passwordResetToken: 'hashed_token',
        passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000),
        changedPasswordAt: Date.now() - 1000,
        save: jest.fn().mockResolvedValue({
          _id: userId,
          email: 'test@example.com',
        }),
      };

      req.params = {
        token: 'valid-token',
      };

      req.body = {
        password: 'new_password',
        confirmPassword: 'new_password',
      };

      User.findOne.mockResolvedValue(mockUser);

      // Act
      await authController.resetPassword(req, res, next);

      // Assert
      expect(mockUser.password).toBe('new_password');
      expect(mockUser.confirmPassword).toBe('new_password');
      expect(mockUser.passwordResetToken).toBeUndefined();
      expect(mockUser.passwordResetExpires).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(createSendTokenSpy).toHaveBeenCalled();
    });

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

  describe('updatePassword', () => {
    it('should update password when current password is correct', async () => {
      // Arrange
      const userId = new ObjectId('60d21b4667d0d8992e610c85');
      const mockUser = {
        id: userId,
        password: 'hashed_old_password',
        correctPassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue({
          _id: userId,
          email: 'test@example.com',
        }),
      };

      req.user = {
        id: userId,
      };

      req.body = {
        passwordCurrent: 'old_password',
        password: 'new_password',
        passwordConfirm: 'new_password',
      };

      const userFindByIdChain = {
        select: jest.fn().mockResolvedValue(mockUser),
      };
      User.findById.mockReturnValue(userFindByIdChain);

      // Act
      await authController.updatePassword(req, res, next);

      // Assert
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(mockUser.correctPassword).toHaveBeenCalledWith(
        'old_password',
        'hashed_old_password'
      );
      expect(mockUser.save).toHaveBeenCalled();
      expect(createSendTokenSpy).toHaveBeenCalled();
    });

    it('should return error when current password is incorrect', async () => {
      // Arrange
      const userId = new ObjectId('60d21b4667d0d8992e610c85');
      const mockUser = {
        id: userId,
        password: 'hashed_old_password',
        correctPassword: jest.fn().mockResolvedValue(false),
      };

      req.user = {
        id: userId,
      };

      req.body = {
        passwordCurrent: 'wrong_password',
        password: 'new_password',
        passwordConfirm: 'new_password',
      };

      const userFindByIdChain = {
        select: jest.fn().mockResolvedValue(mockUser),
      };
      User.findById.mockReturnValue(userFindByIdChain);

      // Act
      await authController.updatePassword(req, res, next);

      // Assert
      expect(mockUser.correctPassword).toHaveBeenCalledWith(
        'wrong_password',
        'hashed_old_password'
      );
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Your current password is wrong.',
          statusCode: 401,
        })
      );
    });
  });
});
