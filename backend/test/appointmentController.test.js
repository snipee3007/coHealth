const userAppointmentController = require('../controllers/userAppointmentController');
const Appointment = require('../models/appointments_schema');
const User = require('../models/users_schema');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

// Mock the required modules
jest.mock('../models/appointments_schema');
jest.mock('../models/users_schema');
jest.mock('nodemailer');
jest.mock('../utils/returnData', () => jest.fn());

// Mock AppError properly
jest.mock('../utils/appError', () => {
  return jest.fn().mockImplementation((message, statusCode) => {
    return {
      message,
      statusCode,
      status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
      isOperational: true,
    };
  });
});

// Mock catchAsync to just run the function
jest.mock('../utils/catchAsync', () => (fn) => fn);

describe('UserAppointmentController', () => {
  let req;
  let res;
  let next;
  let returnData;
  let userId;
  let doctorId;

  beforeEach(() => {
    // Create new ObjectIds for each test
    userId = new mongoose.Types.ObjectId();
    doctorId = new mongoose.Types.ObjectId();

    req = {
      user: {
        _id: userId,
        role: 'user',
      },
      body: {},
      query: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    // Get a fresh reference to returnData for each test
    returnData = require('../utils/returnData');

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('updateAppointment', () => {
    test('should return 403 error if user is not a doctor', async () => {
      req.user.role = 'user';

      await userAppointmentController.updateAppointment(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe(
        'You do not have permission to perform this action'
      );
    });

    test('should update appointment status if user is a doctor', async () => {
      req.user.role = 'doctor';
      req.body = {
        status: 1,
        appointmentCode: 'ABC123',
      };

      const mockAppointment = {
        appointmentCode: 'ABC123',
        status: 1,
      };

      Appointment.findOneAndUpdate.mockResolvedValue(mockAppointment);

      await userAppointmentController.updateAppointment(req, res, next);

      expect(Appointment.findOneAndUpdate).toHaveBeenCalledWith(
        { appointmentCode: 'ABC123' },
        { status: 1 },
        { new: true, upsert: true }
      );

      expect(returnData).toHaveBeenCalledWith(req, res, 200, mockAppointment);
    });
  });

  describe('getAppointment', () => {
    test('should get appointments for regular user', async () => {
      req.user.role = 'user';

      const mockAppointments = [
        {
          _id: new mongoose.Types.ObjectId(),
          userID: userId,
          status: 1,
          time: new Date('2025-05-20'),
        },
        {
          _id: new mongoose.Types.ObjectId(),
          userID: userId,
          status: 0,
          time: new Date('2025-04-15'),
        },
      ];

      Appointment.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockAppointments),
      });

      await userAppointmentController.getAppointment(req, res, next);

      expect(Appointment.find).toHaveBeenCalledWith({ userID: userId });
      expect(req.appointments).toBeDefined();
      expect(req.totalPages).toBeDefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getAppointmentEachPage', () => {
    test('should get paginated appointments for regular user', async () => {
      req.user.role = 'user';
      req.query.page = 2;

      const mockAppointments = [
        {
          _id: new mongoose.Types.ObjectId(),
          userID: userId,
          status: 1,
          time: new Date('2025-05-20'),
        },
        {
          _id: new mongoose.Types.ObjectId(),
          userID: userId,
          status: 0,
          time: new Date('2025-04-15'),
        },
      ];

      Appointment.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockAppointments),
      });

      Appointment.countDocuments.mockResolvedValue(10);

      await userAppointmentController.getAppointmentEachPage(req, res, next);

      expect(Appointment.find).toHaveBeenCalledWith({ userID: userId });
      expect(Appointment.countDocuments).toHaveBeenCalledWith({
        userID: userId,
      });
      expect(returnData).toHaveBeenCalledWith(req, res, 200, {
        appointments: expect.any(Array),
        totalPages: 2,
      });
    });
  });

  describe('getAppointmentDetails', () => {
    test('should get details of a specific appointment', async () => {
      req.params.appointmentCode = 'ABC123';

      const mockAppointment = {
        appointmentCode: 'ABC123',
        doctorID: doctorId,
        status: 1,
      };

      Appointment.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockAppointment),
      });

      await userAppointmentController.getAppointmentDetails(req, res, next);

      expect(Appointment.findOne).toHaveBeenCalledWith({
        appointmentCode: 'ABC123',
      });
      expect(req.appointment).toEqual(mockAppointment);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('sendEmail', () => {
    test('should send confirmation email when appointment is accepted', async () => {
      const mockTransporter = {
        sendMail: jest.fn().mockResolvedValue({ messageId: 'abc123' }),
      };

      nodemailer.createTransport.mockReturnValue(mockTransporter);

      req.body = {
        status: '1',
        fullname: 'John Doe',
        email: 'john@example.com',
        date: '2025-05-20',
        time: '10:00 AM',
      };

      process.env.EMAIL_USER = 'test@example.com';
      process.env.EMAIL_PASS = 'password123';

      await userAppointmentController.sendEmail(req, res, next);

      expect(nodemailer.createTransport).toHaveBeenCalled();
      expect(mockTransporter.sendMail).toHaveBeenCalled();
      expect(mockTransporter.sendMail.mock.calls[0][0].to).toBe(
        'john@example.com'
      );
      expect(mockTransporter.sendMail.mock.calls[0][0].subject).toContain(
        'ACCEPTED'
      );
      expect(returnData).toHaveBeenCalledWith(req, res, 200, {
        messageId: 'abc123',
      });
    });

    test('should send rejection email when appointment is declined', async () => {
      const mockTransporter = {
        sendMail: jest.fn().mockResolvedValue({ messageId: 'abc123' }),
      };

      nodemailer.createTransport.mockReturnValue(mockTransporter);

      req.body = {
        status: '0',
        fullname: 'John Doe',
        email: 'john@example.com',
        date: '2025-05-20',
        time: '10:00 AM',
      };

      process.env.EMAIL_USER = 'test@example.com';
      process.env.EMAIL_PASS = 'password123';

      await userAppointmentController.sendEmail(req, res, next);

      expect(nodemailer.createTransport).toHaveBeenCalled();
      expect(mockTransporter.sendMail).toHaveBeenCalled();
      expect(mockTransporter.sendMail.mock.calls[0][0].to).toBe(
        'john@example.com'
      );
      expect(mockTransporter.sendMail.mock.calls[0][0].subject).toContain(
        'DECLINED'
      );
      expect(returnData).toHaveBeenCalledWith(req, res, 200, {
        messageId: 'abc123',
      });
    });
  });
});
