const {
  getAllDiseases,
  getDetailsDisease,
  createDisease,
  predictDisease,
} = require('../controllers/diseaseController');
const Disease = require('../models/disease_schema');
const Symptom = require('../models/symptom_schema');
const AppError = require('../utils/appError');
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

// Mock dependencies
jest.mock('../models/disease_schema');
jest.mock('../models/symptom_schema');
jest.mock('fs');
jest.mock('child_process');
jest.mock('path');

// Mock catchAsync wrapper to properly pass errors to next
jest.mock('../utils/catchAsync', () => {
  return (fn) => {
    return async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  };
});

// Mock dependencies
jest.mock('../models/disease_schema');
jest.mock('../models/symptom_schema');
jest.mock('fs');
jest.mock('child_process');
jest.mock('path');

// Mock return data utility
jest.mock('../utils/returnData', () => {
  return jest.fn((req, res, statusCode, data) => {
    res.status(statusCode).json({
      status: 'success',
      data,
    });
  });
});

describe('Disease Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getAllDiseases', () => {
    it('should get all diseases and return success response', async () => {
      // Mock data
      const mockDiseases = [
        { name: 'Disease 1', description: 'Description 1' },
        { name: 'Disease 2', description: 'Description 2' },
      ];

      // Setup mock
      Disease.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockDiseases),
      });

      // Execute
      await getAllDiseases(req, res, next);

      // Assert
      expect(Disease.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockDiseases,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error if database query fails', async () => {
      // Setup mock to throw error
      const error = new Error('Database error');

      // We need to mock the entire chain to ensure the error is thrown properly
      const mockLeanFn = jest.fn().mockRejectedValue(error);
      Disease.find.mockReturnValue({ lean: mockLeanFn });

      // Use try-catch to properly test async error handling
      try {
        await getAllDiseases(req, res, next);
      } catch (e) {
        // The error should be caught by catchAsync, not here
        console.error('Test error caught:', e);
      }

      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toEqual(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getDetailsDisease', () => {
    it('should get disease details by name and return success response', async () => {
      // Mock data
      const diseaseName = 'Diabetes';
      const mockDisease = {
        name: 'Diabetes',
        description: 'A chronic disease related to blood sugar levels',
        commonSymptoms: ['Frequent urination', 'Increased thirst'],
        riskFactors: ['Family history', 'Obesity'],
      };

      // Setup mock
      req.params.name = diseaseName;
      Disease.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockDisease),
      });

      // Execute
      await getDetailsDisease(req, res, next);

      // Assert
      expect(Disease.findOne).toHaveBeenCalledWith({ name: diseaseName });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockDisease,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error if disease lookup fails', async () => {
      // Setup mock to throw error
      req.params.name = 'Unknown';
      const error = new Error('Database error');

      // We need to mock the entire chain to ensure the error is thrown properly
      const mockLeanFn = jest.fn().mockRejectedValue(error);
      Disease.findOne.mockReturnValue({ lean: mockLeanFn });

      // Use try-catch to properly test async error handling
      try {
        await getDetailsDisease(req, res, next);
      } catch (e) {
        // The error should be caught by catchAsync, not here
        console.error('Test error caught:', e);
      }

      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toEqual(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('createDisease', () => {
    it('should create diseases from JSON files and return success response', async () => {
      // Mock data
      const mockFiles = ['disease1.json', 'disease2.json'];
      const mockDisease1 = {
        name: 'Disease 1',
        description: 'Description 1',
        commonSymptoms: ['Symptom 1', 'Symptom 2'],
        riskFactors: ['Risk 1'],
      };
      const mockDisease2 = {
        disease: 'Disease 2',
        description: 'Description 2',
      };
      const mockInserted = [
        mockDisease1,
        {
          name: 'Disease 2',
          description: 'Description 2',
          commonSymptoms: ['Không có thông tin'],
          riskFactors: ['Không có thông tin'],
        },
      ];

      // Setup mocks
      path.join
        .mockReturnValueOnce('/mock/path/to/diseases') // for folderPath
        .mockReturnValueOnce('/mock/path/to/diseases/disease1.json') // for first filePath
        .mockReturnValueOnce('/mock/path/to/diseases/disease2.json'); // for second filePath

      fs.readdirSync.mockReturnValue(mockFiles);
      fs.readFileSync
        .mockReturnValueOnce(JSON.stringify([mockDisease1]))
        .mockReturnValueOnce(JSON.stringify(mockDisease2));

      Disease.insertMany.mockResolvedValue(mockInserted);

      // Execute
      await createDisease(req, res, next);

      // Assert
      expect(fs.readdirSync).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalledTimes(2);
      expect(Disease.insertMany).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockInserted,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error if no valid disease data found', async () => {
      // Setup mocks for empty data scenario
      const mockFiles = ['empty.json'];
      path.join.mockReturnValue('/mock/path');
      fs.readdirSync.mockReturnValue(mockFiles);
      fs.readFileSync.mockReturnValue('[]');

      // Execute
      await createDisease(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
      expect(next.mock.calls[0][0].message).toContain(
        'Không tìm thấy dữ liệu bệnh hợp lệ'
      );
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('predictDisease', () => {
    it('should predict diseases based on symptoms and return success response', async () => {
      // Mock data
      const mockSymptoms = ['headache', 'fever'];
      const mockPredictions = {
        diseases: [
          { name: 'Flu', probability: 0.85 },
          { name: 'Common Cold', probability: 0.65 },
        ],
      };

      // Setup mocks
      req.body.symptoms = mockSymptoms;

      // Mock symptom validation
      Symptom.findOne.mockResolvedValue({ symptom: 'headache' });

      // Mock Python process
      const mockSpawn = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn(),
      };

      spawn.mockReturnValue(mockSpawn);
      path.join.mockReturnValue('/mock/path/to/python/script.py');

      // Simulate Python process output
      const stdoutCallback = {};
      const stderrCallback = {};
      const closeCallback = {};

      mockSpawn.stdout.on.mockImplementation((event, callback) => {
        stdoutCallback[event] = callback;
        return mockSpawn.stdout;
      });

      mockSpawn.stderr.on.mockImplementation((event, callback) => {
        stderrCallback[event] = callback;
        return mockSpawn.stderr;
      });

      mockSpawn.on.mockImplementation((event, callback) => {
        closeCallback[event] = callback;
        return mockSpawn;
      });

      // Execute
      const predictPromise = predictDisease(req, res, next);

      // Simulate Python process output and completion
      stdoutCallback.data(Buffer.from(JSON.stringify(mockPredictions)));
      closeCallback.close(0);

      // Wait for the function to complete
      await predictPromise;

      // Assert
      expect(spawn).toHaveBeenCalledWith('python', [
        '/mock/path/to/python/script.py',
        JSON.stringify(mockSymptoms),
      ]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          input_symptoms: mockSymptoms,
          raw_predictions: mockPredictions,
        },
      });
    });

    it('should call next with error if no symptoms provided', async () => {
      // Setup empty symptoms
      req.body.symptoms = [];

      // Execute
      await predictDisease(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
      expect(next.mock.calls[0][0].message).toContain('No symptom provided');
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next with error if invalid symptom provided', async () => {
      // Setup invalid symptom
      req.body.symptoms = ['nonexistentsymptom'];

      // Mock symptom validation to return null (symptom not found)
      Symptom.findOne.mockResolvedValue(null);

      // Execute
      await predictDisease(req, res, next);

      // Assert
      expect(Symptom.findOne).toHaveBeenCalledWith({
        symptom: 'nonexistentsymptom',
      });
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
      expect(next.mock.calls[0][0].message).toContain(
        'symptom is not provided'
      );
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next with error if Python process fails', async () => {
      // Mock data
      req.body.symptoms = ['headache', 'fever'];

      // Mock symptom validation
      Symptom.findOne.mockResolvedValue({ symptom: 'headache' });

      // Mock Python process
      const mockSpawn = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn(),
      };

      spawn.mockReturnValue(mockSpawn);

      // Simulate Python process output
      const stdoutCallback = {};
      const stderrCallback = {};
      const closeCallback = {};

      mockSpawn.stdout.on.mockImplementation((event, callback) => {
        stdoutCallback[event] = callback;
        return mockSpawn.stdout;
      });

      mockSpawn.stderr.on.mockImplementation((event, callback) => {
        stderrCallback[event] = callback;
        return mockSpawn.stderr;
      });

      mockSpawn.on.mockImplementation((event, callback) => {
        closeCallback[event] = callback;
        return mockSpawn;
      });

      // Execute
      const predictPromise = predictDisease(req, res, next);

      // Simulate Python process error and failure
      stderrCallback.data(
        Buffer.from('FileNotFoundError: No such file or directory')
      );

      // Need to emit the close event with error code to complete the function execution
      closeCallback.close(1);

      // Wait for the function to complete
      await predictPromise;

      // Assert
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toContain('Can not find the neccessary model');
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
