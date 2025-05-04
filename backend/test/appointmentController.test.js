const appointmentController = require('../controllers/appointmentController');
const Appointment = require('../models/appointments_schema');
const User = require('../models/users_schema');
const crypto = require('crypto');
const mongoose = require('mongoose');

// Mock catchAsync trước khi import appointmentController
jest.mock('./../utils/catchAsync.js', () => (fn) => {
  return (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
});

// Mock các dependency
jest.mock('../models/appointments_schema');
jest.mock('../models/users_schema');
jest.mock('crypto');

describe('Appointment Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: {
        fullname: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        phoneNumber: '0123456789',
        docFullname: 'Dr. John Doe',
        specialty: 'Cardiology',
        time: new Date('2025-05-10T09:00:00Z'),
        reason: 'Khám tim',
      },
      user: {
        _id: 'user123',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('createAppointment', () => {
    it('should create an appointment successfully', async () => {
      // Mock doctor data
      const mockDoctor = {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        fullname: 'Dr. John Doe',
        doctorInfo: [
          {
            major: 'Cardiology',
          },
        ],
      };

      // Mock created appointment
      const mockAppointment = {
        _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c85'),
        fullname: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        phoneNumber: '0123456789',
        doctorID: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        time: new Date('2025-05-10T09:00:00Z'),
        reason: 'Khám tim',
        userID: 'user123',
        appointmentCode: 'mockToken123',
      };

      // Setup mocks properly with populate chain
      const populateMock = jest.fn().mockReturnValue([mockDoctor]);
      User.find = jest.fn().mockReturnValue({
        populate: populateMock,
      });

      Appointment.create = jest.fn().mockResolvedValue(mockAppointment);
      crypto.randomBytes = jest.fn().mockReturnValue({
        toString: jest.fn().mockReturnValue('mockToken123'),
      });

      // Call function
      await appointmentController.createAppointment(req, res, next);

      // Assertions
      expect(User.find).toHaveBeenCalledWith({
        fullname: 'Dr. John Doe',
      });
      expect(Appointment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fullname: 'Nguyễn Văn A',
          email: 'nguyenvana@example.com',
          phoneNumber: '0123456789',
          doctorID: mockDoctor._id,
          time: new Date('2025-05-10T09:00:00Z'),
          reason: 'Khám tim',
          userID: 'user123',
          appointmentCode: 'mockToken123',
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockAppointment,
      });
    });

    it('should return error when doctor is not found', async () => {
      // Mock empty doctors array - bác sĩ không tồn tại trong dtb
      const populateMock = jest.fn().mockReturnValue([]);
      User.find = jest.fn().mockReturnValue({
        populate: populateMock,
      });

      // Call function
      await appointmentController.createAppointment(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Can not find this doctor do sai chuyên môn',
      });
      expect(Appointment.create).not.toHaveBeenCalled(); // Đảm bảo không tạo appointment
    });

    it('should return error when doctor specialty does not match', async () => {
      // Mock doctor with different specialty
      const mockDoctor = {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        fullname: 'Dr. John Doe',
        doctorInfo: [
          {
            major: 'Neurology', // Different specialty from request
          },
        ],
      };

      const populateMock = jest.fn().mockReturnValue([mockDoctor]);
      User.find = jest.fn().mockReturnValue({
        populate: populateMock,
      });

      // Call function
      await appointmentController.createAppointment(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Can not find this doctor do sai chuyên môn',
      });
      expect(Appointment.create).not.toHaveBeenCalled(); // Đảm bảo không tạo appointment
    });

    it('should create appointment with null user ID when not authenticated', async () => {
      // Remove user from request
      req.user = null;

      // Mock doctor data
      const mockDoctor = {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        fullname: 'Dr. John Doe',
        doctorInfo: [
          {
            major: 'Cardiology',
          },
        ],
      };

      // Mock created appointment
      const mockAppointment = {
        _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c85'),
        fullname: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        phoneNumber: '0123456789',
        doctorID: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        time: new Date('2025-05-10T09:00:00Z'),
        reason: 'Khám tim',
        userID: null,
        appointmentCode: 'mockToken123',
      };

      // Setup mocks
      const populateMock = jest.fn().mockReturnValue([mockDoctor]);
      User.find = jest.fn().mockReturnValue({
        populate: populateMock,
      });

      Appointment.create = jest.fn().mockResolvedValue(mockAppointment);
      crypto.randomBytes = jest.fn().mockReturnValue({
        toString: jest.fn().mockReturnValue('mockToken123'),
      });

      // Call function
      await appointmentController.createAppointment(req, res, next);

      // Assertions
      expect(Appointment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userID: null,
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getAllAppointment', () => {
    beforeEach(() => {
      // Mock Date.now() để đảm bảo kết quả ổn định
      jest
        .spyOn(Date, 'now')
        .mockImplementation(() => new Date('2025-05-04').getTime());
    });

    it('should get all future appointments (time >= Date.now)', async () => {
      // Mock appointments
      const mockAppointments = [
        {
          _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c85'),
          fullname: 'Nguyễn Văn A',
          doctorID: {
            _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
            fullname: 'Dr. John Doe',
            doctorInfo: [
              {
                major: 'Cardiology',
              },
            ],
          },
          time: new Date('2025-06-01T09:00:00Z'),
        },
        {
          _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c86'),
          fullname: 'Lê Thị B',
          doctorID: {
            _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
            fullname: 'Dr. Jane Smith',
            doctorInfo: [
              {
                major: 'Dermatology',
              },
            ],
          },
          time: new Date('2025-06-15T10:30:00Z'),
        },
      ];

      // Setup mocks
      const populateMock = jest.fn().mockResolvedValue(mockAppointments);
      Appointment.find = jest.fn().mockReturnValue({
        populate: populateMock,
      });

      // Call function
      await appointmentController.getAllAppointment(req, res, next);

      // Assertions
      expect(Appointment.find).toHaveBeenCalledWith({
        time: { $gte: expect.any(Number) },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockAppointments,
      });
    });

    it('should return empty array when no future appointments', async () => {
      // Setup mocks for empty result
      const populateMock = jest.fn().mockResolvedValue([]);
      Appointment.find = jest.fn().mockReturnValue({
        populate: populateMock,
      });

      // Call function
      await appointmentController.getAllAppointment(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: [],
      });
    });
  });
});
