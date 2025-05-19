// Import and mock CatchAsync
const catchAsync = require('../utils/catchAsync');
jest.mock('../utils/catchAsync');

// Manually recreate how catchAsync is supposed to work
catchAsync.mockImplementation((fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
});

// Import the controller after mocking
const symptomController = require('../controllers/symptomController');
// Import and mock other dependencies
const Symptom = require('../models/symptom_schema');
const returnData = require('../utils/returnData');

jest.mock('../models/symptom_schema');
jest.mock('../utils/returnData');

describe('Symptom Controller', () => {
  let req, res, next;

  beforeEach(() => {
    // Create mock request and response objects manually
    req = {
      params: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getAllSymptoms', () => {
    it('should get all symptoms sorted by symptom name', async () => {
      // Mock data
      const mockSymptoms = [
        { symptom: 'Headache', body: 'head' },
        { symptom: 'Cough', body: 'chest' },
        { symptom: 'Fever', body: 'general' },
      ];

      // Setup Mongoose model mock
      Symptom.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockSymptoms),
        }),
      });

      // Call the function
      await symptomController.getAllSymptoms(req, res, next);

      // Assertions
      expect(Symptom.find).toHaveBeenCalledWith({});
      expect(Symptom.find().sort).toHaveBeenCalledWith({ symptom: 1 });
      expect(returnData).toHaveBeenCalledWith(req, res, 200, mockSymptoms);
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      // Setup mock implementation to throw an error
      const error = new Error('Database error');
      Symptom.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockRejectedValue(error),
        }),
      });

      // Call the function
      await symptomController.getAllSymptoms(req, res, next);

      // Assertions
      expect(next).toHaveBeenCalledWith(error);
      expect(returnData).not.toHaveBeenCalled();
    });
  });

  describe('getSymptomByTag', () => {
    it('should get symptoms filtered by body tag', async () => {
      // Mock data
      const mockTag = 'head';
      const mockSymptoms = [
        { symptom: 'Headache', body: 'head' },
        { symptom: 'Migraine', body: 'head' },
      ];

      // Setup request parameters
      req.params = { name: mockTag };

      // Setup mock implementation
      Symptom.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockSymptoms),
        }),
      });

      // Call the function
      await symptomController.getSymptomByTag(req, res, next);

      // Assertions
      expect(Symptom.find).toHaveBeenCalledWith({ body: mockTag });
      expect(Symptom.find().sort).toHaveBeenCalledWith({ symptom: 1 });
      expect(returnData).toHaveBeenCalledWith(req, res, 200, mockSymptoms);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return empty array if no symptoms match the tag', async () => {
      // Mock data
      const mockTag = 'nonexistent';
      const mockEmptyResult = [];

      // Setup request parameters
      req.params = { name: mockTag };

      // Setup mock implementation
      Symptom.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockEmptyResult),
        }),
      });

      // Call the function
      await symptomController.getSymptomByTag(req, res, next);

      // Assertions
      expect(Symptom.find).toHaveBeenCalledWith({ body: mockTag });
      expect(returnData).toHaveBeenCalledWith(req, res, 200, mockEmptyResult);
    });

    it('should handle database errors', async () => {
      // Setup request parameters
      req.params = { name: 'head' };

      // Setup mock implementation to throw an error
      const error = new Error('Database error');
      Symptom.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockRejectedValue(error),
        }),
      });

      // Call the function
      await symptomController.getSymptomByTag(req, res, next);

      // Assertions
      expect(next).toHaveBeenCalledWith(error);
      expect(returnData).not.toHaveBeenCalled();
    });
  });
});
