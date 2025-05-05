const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const fs = require('fs');
const path = require('path');

// Import controller
const symptomController = require('../controllers/symptomController');
const Symptom = require('../models/symptom_schema');
const AppError = require('../utils/appError');

// Mock các module
jest.mock('../models/symptom_schema');
jest.mock('../utils/appError');
jest.mock('../utils/catchAsync', () => (fn) => {
  // This is where the fix is applied - correctly handle errors
  return (...args) => {
    return fn(...args).catch(args[2]); // Ensure error is passed to next
  };
});
jest.mock('fs');
jest.mock('path');

describe('Symptom Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('getAllSymptoms', () => {
    it('should get all symptoms sorted by symptom name', async () => {
      // Arrange
      const mockSymptoms = [
        {
          _id: new ObjectId('6450b2b2a6d5acb5f174e70c'),
          symptom: 'Cough',
          body: 'respiratory',
        },
        {
          _id: new ObjectId('6450b2b2a6d5acb5f174e70d'),
          symptom: 'Fever',
          body: 'general',
        },
      ];

      Symptom.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockSymptoms),
        }),
      });

      // Act
      await symptomController.getAllSymptoms(req, res, next);

      // Assert
      expect(Symptom.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockSymptoms,
      });
    });

    it('should handle errors and pass to next middleware', async () => {
      // Arrange
      const error = new Error('Database error');
      Symptom.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockRejectedValue(error),
        }),
      });

      // Act
      await symptomController.getAllSymptoms(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getSymptomByTag', () => {
    it('should get symptoms by tag name', async () => {
      // Arrange
      const mockTag = 'respiratory';
      req.params.name = mockTag;

      const mockSymptoms = [
        {
          _id: new ObjectId('6450b2b2a6d5acb5f174e70e'),
          symptom: 'Cough',
          body: 'respiratory',
        },
        {
          _id: new ObjectId('6450b2b2a6d5acb5f174e70f'),
          symptom: 'Shortness of breath',
          body: 'respiratory',
        },
      ];

      Symptom.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockSymptoms),
        }),
      });

      // Act
      await symptomController.getSymptomByTag(req, res, next);

      // Assert
      expect(Symptom.find).toHaveBeenCalledWith({ body: mockTag });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockSymptoms,
      });
    });

    it('should handle errors and pass to next middleware', async () => {
      // Arrange
      req.params.name = 'respiratory';
      const error = new Error('Database error');

      Symptom.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockRejectedValue(error),
        }),
      });

      // Act
      await symptomController.getSymptomByTag(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createSymptom', () => {
    it('should read symptom data from files and insert to database', async () => {
      // Arrange
      const mockDirPath = '/app/datas/symptom';
      const mockFiles = ['symptoms1.json', 'symptoms2.json', 'not-a-json.txt'];
      const mockSymptoms1 = [
        { symptom: 'Headache', body: 'head' },
        { symptom: 'Nausea', body: 'stomach' },
      ];
      const mockSymptoms2 = [{ symptom: 'Dizziness', body: 'head' }];

      const mockInserted = [
        { _id: new ObjectId('6450b2b2a6d5acb5f174e710'), ...mockSymptoms1[0] },
        { _id: new ObjectId('6450b2b2a6d5acb5f174e711'), ...mockSymptoms1[1] },
        { _id: new ObjectId('6450b2b2a6d5acb5f174e712'), ...mockSymptoms2[0] },
      ];

      path.join
        .mockReturnValueOnce(mockDirPath)
        .mockReturnValueOnce(`${mockDirPath}/${mockFiles[0]}`)
        .mockReturnValueOnce(`${mockDirPath}/${mockFiles[1]}`);

      fs.readdirSync.mockReturnValue(mockFiles);

      fs.readFileSync
        .mockReturnValueOnce(JSON.stringify(mockSymptoms1))
        .mockReturnValueOnce(JSON.stringify(mockSymptoms2));

      Symptom.insertMany.mockResolvedValue(mockInserted);

      // Act
      await symptomController.createSymptom(req, res, next);

      // Assert
      expect(fs.readdirSync).toHaveBeenCalledWith(mockDirPath);
      expect(fs.readFileSync).toHaveBeenCalledTimes(2);
      expect(Symptom.insertMany).toHaveBeenCalledWith([
        ...mockSymptoms1,
        ...mockSymptoms2,
      ]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: mockInserted.length,
        data: mockInserted,
      });
    });

    it('should handle errors and pass to next middleware', async () => {
      // Arrange
      const error = new Error('Database error');
      Symptom.insertMany.mockRejectedValue(error);

      // Setup for createSymptom function
      const mockDirPath = '/app/datas/symptom';
      const mockFiles = ['symptoms1.json'];
      const mockSymptoms1 = [{ symptom: 'Headache', body: 'head' }];

      path.join
        .mockReturnValueOnce(mockDirPath)
        .mockReturnValueOnce(`${mockDirPath}/${mockFiles[0]}`);

      fs.readdirSync.mockReturnValue(mockFiles);
      fs.readFileSync.mockReturnValueOnce(JSON.stringify(mockSymptoms1));

      // Act
      await symptomController.createSymptom(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
