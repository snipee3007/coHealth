const userAppointmentController = require('../controllers/userAppointmentController');
const Appointment = require('../models/appointments_schema');
const User = require('../models/users_schema');
const catchAsync = require('../utils/catchAsync');
const { ObjectId } = require('mongodb');
const nodemailer = require('nodemailer');

// Mock dependencies
jest.mock('../models/appointments_schema');
jest.mock('../models/users_schema');
jest.mock('../utils/catchAsync', () => jest.fn((fn) => fn));
jest.mock('nodemailer');

describe('userAppointmentController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: {
        _id: new ObjectId('60d0fe4f5311236168a109ca'),
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

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('updateAppointment', () => {
    it('should return 403 if user is not a doctor', async () => {
      req.user.role = 'user';
      req.body = {
        status: '1',
        appointmentCode: 'APP123',
      };

      await userAppointmentController.updateAppointment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'You do not have permission to perform this action',
      });
      expect(Appointment.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('should update appointment if user is a doctor', async () => {
      req.user.role = 'doctor';
      req.body = {
        status: '1',
        appointmentCode: 'APP123',
      };

      const updatedAppointment = {
        appointmentCode: 'APP123',
        status: '1',
        time: new Date(),
        doctorID: new ObjectId('60d0fe4f5311236168a109cb'),
      };

      Appointment.findOneAndUpdate.mockResolvedValue(updatedAppointment);

      await userAppointmentController.updateAppointment(req, res, next);

      expect(Appointment.findOneAndUpdate).toHaveBeenCalledWith(
        { appointmentCode: 'APP123' },
        { status: '1' },
        { new: true, upsert: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'success',
        data: updatedAppointment,
      });
    });
  });

  describe('getAppointment', () => {
    it('should fetch user appointments if user is not a doctor', async () => {
      req.user.role = 'user';

      const appointments = [
        {
          _id: new ObjectId('60d0fe4f5311236168a109cc'),
          status: 1,
          time: new Date(Date.now() + 86400000), // Future date
          userID: req.user._id,
          doctorID: {
            _id: new ObjectId('60d0fe4f5311236168a109cb'),
            fullname: 'Dr. John Doe',
            doctorInfo: {
              specialization: 'Cardiology',
            },
          },
          appointmentCode: 'APP123',
        },
        {
          _id: new ObjectId('60d0fe4f5311236168a109cd'),
          status: 0,
          time: new Date(Date.now() - 86400000), // Past date
          userID: req.user._id,
          doctorID: {
            _id: new ObjectId('60d0fe4f5311236168a109cb'),
            fullname: 'Dr. Jane Smith',
            doctorInfo: {
              specialization: 'Neurology',
            },
          },
          appointmentCode: 'APP124',
        },
      ];

      Appointment.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(appointments),
      });

      await userAppointmentController.getAppointment(req, res, next);

      expect(Appointment.find).toHaveBeenCalledWith({
        userID: req.user._id,
      });
      expect(req.appointments).toBeDefined();
      expect(req.totalPages).toBe(1);
      expect(next).toHaveBeenCalled();
    });

    it('should fetch doctor appointments if user is a doctor', async () => {
      req.user.role = 'doctor';

      const appointments = [
        {
          _id: new ObjectId('60d0fe4f5311236168a109cc'),
          status: 1,
          time: new Date(Date.now() + 86400000), // Future date
          userID: new ObjectId('60d0fe4f5311236168a109ce'),
          doctorID: {
            _id: req.user._id,
            fullname: 'Dr. John Doe',
            doctorInfo: {
              specialization: 'Cardiology',
            },
          },
          appointmentCode: 'APP123',
        },
        {
          _id: new ObjectId('60d0fe4f5311236168a109cd'),
          status: -1,
          time: new Date(Date.now() - 86400000), // Past date
          userID: new ObjectId('60d0fe4f5311236168a109cf'),
          doctorID: {
            _id: req.user._id,
            fullname: 'Dr. John Doe',
            doctorInfo: {
              specialization: 'Cardiology',
            },
          },
          appointmentCode: 'APP124',
        },
      ];

      Appointment.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(appointments),
      });

      await userAppointmentController.getAppointment(req, res, next);

      expect(Appointment.find).toHaveBeenCalledWith({
        doctorID: req.user._id,
      });
      expect(req.appointments).toBeDefined();
      expect(req.totalPages).toBe(1);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getAppointmentEachPage', () => {
    it('should fetch paginated user appointments if user is not a doctor', async () => {
      req.user.role = 'user';
      req.query.page = 1;

      const appointments = [
        {
          _id: new ObjectId('60d0fe4f5311236168a109cc'),
          status: 1,
          time: new Date(Date.now() + 86400000), // Future date
          userID: req.user._id,
          doctorID: {
            _id: new ObjectId('60d0fe4f5311236168a109cb'),
            fullname: 'Dr. John Doe',
            doctorInfo: {
              specialization: 'Cardiology',
            },
          },
          appointmentCode: 'APP123',
        },
      ];

      Appointment.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(appointments),
      });

      Appointment.countDocuments.mockResolvedValue(1);

      await userAppointmentController.getAppointmentEachPage(req, res, next);

      expect(Appointment.find).toHaveBeenCalledWith({
        userID: req.user._id,
      });
      expect(Appointment.countDocuments).toHaveBeenCalledWith({
        userID: req.user._id,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'success',
        data: {
          appointments: expect.any(Array),
          totalPages: 1,
        },
      });
    });

    it('should fetch paginated doctor appointments if user is a doctor', async () => {
      req.user.role = 'doctor';
      req.query.page = 1;

      const appointments = [
        {
          _id: new ObjectId('60d0fe4f5311236168a109cc'),
          status: 1,
          time: new Date(Date.now() + 86400000), // Future date
          userID: new ObjectId('60d0fe4f5311236168a109ce'),
          doctorID: req.user._id,
          appointmentCode: 'APP123',
        },
      ];

      Appointment.find.mockResolvedValue(appointments);
      Appointment.countDocuments.mockResolvedValue(1);

      await userAppointmentController.getAppointmentEachPage(req, res, next);

      expect(Appointment.find).toHaveBeenCalledWith({
        doctorID: req.user._id,
      });
      expect(Appointment.countDocuments).toHaveBeenCalledWith({
        userID: req.user._id,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'success',
        data: {
          appointments: expect.any(Array),
          totalPages: 1,
        },
      });
    });
  });

  describe('getAppointmentDetails', () => {
    it('should fetch appointment details by appointmentCode', async () => {
      req.params.appointmentCode = 'APP123';

      const appointmentDetails = {
        _id: new ObjectId('60d0fe4f5311236168a109cc'),
        status: 1,
        time: new Date(),
        appointmentCode: 'APP123',
        doctorID: {
          _id: new ObjectId('60d0fe4f5311236168a109cb'),
          fullname: 'Dr. John Doe',
          email: 'john.doe@example.com',
          phoneNumber: '1234567890',
          doctorInfo: {
            specialization: 'Cardiology',
          },
        },
      };

      Appointment.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(appointmentDetails),
      });

      await userAppointmentController.getAppointmentDetails(req, res, next);

      expect(Appointment.findOne).toHaveBeenCalledWith({
        appointmentCode: 'APP123',
      });
      expect(req.appointment).toEqual(appointmentDetails);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('sendEmail', () => {
    it('should send confirmation email when appointment is accepted', async () => {
      req.body = {
        status: '1',
        date: '2023-05-10',
        time: '10:00 AM',
        fullname: 'John Smith',
        email: 'john@example.com',
      };

      const mockTransporter = {
        sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-message-id' }),
      };

      nodemailer.createTransport.mockReturnValue(mockTransporter);

      await userAppointmentController.sendEmail(req, res, next);

      expect(nodemailer.createTransport).toHaveBeenCalled();
      expect(mockTransporter.sendMail).toHaveBeenCalled();
      expect(mockTransporter.sendMail.mock.calls[0][0].subject).toContain(
        'ACCEPTED'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { messageId: 'mock-message-id' },
      });
    });

    it('should send decline email when appointment is rejected', async () => {
      req.body = {
        status: '0',
        date: '2023-05-10',
        time: '10:00 AM',
        fullname: 'John Smith',
        email: 'john@example.com',
      };

      const mockTransporter = {
        sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-message-id' }),
      };

      nodemailer.createTransport.mockReturnValue(mockTransporter);

      await userAppointmentController.sendEmail(req, res, next);

      expect(nodemailer.createTransport).toHaveBeenCalled();
      expect(mockTransporter.sendMail).toHaveBeenCalled();
      expect(mockTransporter.sendMail.mock.calls[0][0].subject).toContain(
        'DECLINED'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { messageId: 'mock-message-id' },
      });
    });
  });
});
