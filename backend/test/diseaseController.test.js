const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const {
  getAllDiseases,
  getDetailsDisease,
  createDisease,
  predictDisease,
} = require('../controllers/diseaseController');
const Disease = require('../models/disease_schema');
const AppError = require('../utils/appError');
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

// Mock dependencies
jest.mock('../models/disease_schema');
jest.mock('../utils/appError');
jest.mock('fs');
jest.mock('child_process');
jest.mock('path');

describe('Disease Controller', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllDiseases', () => {
    test('should get all diseases successfully', async () => {
      // Mock data
      const mockDiseases = [
        {
          _id: new ObjectId('60d5ec59c8c8a52cecdb3471'),
          name: 'Disease 1',
          description: 'Description 1',
          commonSymptoms: ['Symptom 1', 'Symptom 2'],
          riskFactors: ['Risk 1'],
        },
        {
          _id: new ObjectId('60d5ec59c8c8a52cecdb3472'),
          name: 'Disease 2',
          description: 'Description 2',
          commonSymptoms: ['Symptom 3', 'Symptom 4'],
          riskFactors: ['Risk 2', 'Risk 3'],
        },
      ];

      // Setup mocks
      Disease.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockDiseases),
      });

      // Mock request and response
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      // Call the function
      await getAllDiseases(req, res, next);

      // Assertions
      expect(Disease.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockDiseases,
      });
      expect(next).not.toHaveBeenCalled();
    });

    // test('should handle errors', async () => {
    //   // Setup mocks to throw error
    //   const error = new Error('Database error');
    //   Disease.find.mockReturnValue({
    //     lean: jest.fn().mockRejectedValue(error),
    //   });

    //   // Mock request and response
    //   const req = {};
    //   const res = {
    //     status: jest.fn().mockReturnThis(),
    //     json: jest.fn(),
    //   };
    //   const next = jest.fn();

    //   // Call the function
    //   await getAllDiseases(req, res, next);

    //   // Assertions
    //   expect(next).toHaveBeenCalledWith(error);
    //   expect(res.status).not.toHaveBeenCalled();
    //   expect(res.json).not.toHaveBeenCalled();
    // });
  });

  describe('getDetailsDisease', () => {
    test('should get a specific disease by name', async () => {
      // Mock data
      const diseaseName = 'Disease 1';
      const mockDisease = {
        _id: new ObjectId('60d5ec59c8c8a52cecdb3473'),
        name: diseaseName,
        description: 'Description for Disease 1',
        commonSymptoms: ['Symptom 1', 'Symptom 2'],
        riskFactors: ['Risk 1'],
      };

      // Setup mocks
      Disease.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockDisease),
      });

      // Mock request and response
      const req = {
        params: { name: diseaseName },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      // Call the function
      await getDetailsDisease(req, res, next);

      // Assertions
      expect(Disease.findOne).toHaveBeenCalledWith({ name: diseaseName });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockDisease,
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle case when disease is not found', async () => {
      // Setup mocks
      Disease.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      // Mock request and response
      const req = {
        params: { name: 'Non-existent Disease' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      // Call the function
      await getDetailsDisease(req, res, next);

      // Assertions
      expect(Disease.findOne).toHaveBeenCalledWith({
        name: 'Non-existent Disease',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: null,
      });
    });
  });

  describe('createDisease', () => {
    test('should create diseases from JSON files', async () => {
      // Mock data
      const mockFiles = ['disease1.json', 'disease2.json', 'data.txt'];
      const mockDisease1 = {
        name: 'Disease 1',
        description: 'Description 1',
        commonSymptoms: ['Symptom 1', 'Symptom 2'],
        riskFactors: ['Risk 1'],
      };
      const mockDisease2 = [
        {
          disease: 'Disease 2',
          description: 'Description 2',
          commonSymptoms: ['Symptom 3', 'Symptom 4'],
        },
      ];

      // Setup mocks
      path.join.mockImplementation((...args) => args.join('/'));
      fs.readdirSync.mockReturnValue(mockFiles);
      fs.readFileSync
        .mockReturnValueOnce(JSON.stringify(mockDisease1))
        .mockReturnValueOnce(JSON.stringify(mockDisease2));

      const insertedData = [
        {
          _id: new ObjectId('60d5ec59c8c8a52cecdb3474'),
          ...mockDisease1,
        },
        {
          _id: new ObjectId('60d5ec59c8c8a52cecdb3475'),
          name: 'Disease 2',
          description: 'Description 2',
          commonSymptoms: ['Symptom 3', 'Symptom 4'],
          riskFactors: ['Không có thông tin'],
        },
      ];

      Disease.insertMany.mockResolvedValue(insertedData);

      // Mock request and response
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      // Call the function
      await createDisease(req, res, next);

      // Assertions
      expect(fs.readdirSync).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalledTimes(2);
      expect(Disease.insertMany).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: 2,
        data: insertedData,
      });
    });

    test('should handle validation errors', async () => {
      // Mock data
      const mockFiles = ['disease1.json'];
      const mockDisease = {
        name: 'Disease 1',
        // Missing description which is required
      };

      // Setup mocks
      path.join.mockImplementation((...args) => args.join('/'));
      fs.readdirSync.mockReturnValue(mockFiles);
      fs.readFileSync.mockReturnValue(JSON.stringify(mockDisease));

      const validationError = new mongoose.Error.ValidationError();
      validationError.errors = {
        description: { message: 'Description is required' },
      };
      Disease.insertMany.mockRejectedValue(validationError);

      // Mock request and response
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      // Call the function
      await createDisease(req, res, next);

      // Assertions
      expect(next).toHaveBeenCalled();
      expect(AppError).toHaveBeenCalled();
    });
  });

  describe('predictDisease', () => {
    test('should predict diseases based on symptoms', async () => {
      // Mock data
      const mockSymptoms = ['fever', 'cough', 'headache'];
      const mockPredictionResult = JSON.stringify({
        'Common Cold': 0.75,
        Flu: 0.2,
        'COVID-19': 0.05,
      });

      // Setup mocks
      path.join.mockImplementation((...args) => args.join('/'));

      const mockOn = jest.fn((event, callback) => {
        if (
          event === 'data' &&
          mockOn.mock.calls.filter((call) => call[0] === 'data').length === 1
        ) {
          callback(Buffer.from(mockPredictionResult));
        }
        return mockOn;
      });

      const mockEventEmitter = {
        stdout: { on: mockOn },
        stderr: { on: mockOn },
        on: (event, callback) => {
          if (event === 'close') {
            // Simulate successful completion
            callback(0);
          }
        },
      };

      spawn.mockReturnValue(mockEventEmitter);

      // Mock request and response
      const req = {
        body: { symptoms: mockSymptoms },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Call the function
      await predictDisease(req, res);

      // Assertions
      expect(spawn).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          input_symptoms: mockSymptoms,
          // predictions: {
          //   'Common Cold': '75.00%',
          //   Flu: '20.00%',
          //   'COVID-19': '5.00%',
          // },
          raw_predictions: {
            'Common Cold': 0.75,
            Flu: 0.2,
            'COVID-19': 0.05,
          },
        },
      });
    });

    test('should handle invalid symptoms input', async () => {
      // Setup request with invalid symptoms
      const req = {
        body: { symptoms: [] }, // Empty symptoms array
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Call the function
      await predictDisease(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Vui lòng cung cấp danh sách triệu chứng',
      });
      expect(spawn).not.toHaveBeenCalled();
    });
  });
});
