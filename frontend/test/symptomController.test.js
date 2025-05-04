const symptomController = require('../../backend/controllers/symptomController.js');
const Symptom = require('../../backend/models/symptom_schema');
const fs = require('fs');
const path = require('path');

// Mock the dependencies
jest.mock('../../backend/models/symptom_schema');
jest.mock('fs');
jest.mock('path');

describe('Symptom Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('getAllSymptoms', () => {
    it('should return all symptoms sorted by symptom name', async () => {
      const mockSymptoms = [{ symptom: 'Fever' }, { symptom: 'Cough' }];
      Symptom.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockSymptoms),
        }),
      });

      await symptomController.getAllSymptoms(req, res, next);

      expect(Symptom.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockSymptoms,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error if find fails', async () => {
      const error = new Error('Database error');
      Symptom.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockRejectedValue(error),
        }),
      });

      await symptomController.getAllSymptoms(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getSymptomByTag', () => {
    it('should return symptoms matching the tag', async () => {
      const mockSymptoms = [{ symptom: 'Fever', body: 'head' }];
      req.params = { name: 'head' };
      Symptom.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockSymptoms),
        }),
      });

      await symptomController.getSymptomByTag(req, res, next);

      expect(Symptom.find).toHaveBeenCalledWith({ body: 'head' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockSymptoms,
      });
    });

    it('should call next with error if find fails', async () => {
      const error = new Error('Database error');
      req.params = { name: 'head' };
      Symptom.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockRejectedValue(error),
        }),
      });

      await symptomController.getSymptomByTag(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createSymptom', () => {
    it('should create symptoms from JSON files', async () => {
      const mockFiles = ['symptoms1.json', 'symptoms2.json'];
      const mockSymptoms = [{ symptom: 'Fever' }, { symptom: 'Cough' }];

      path.join.mockReturnValue('/path/to/symptoms');
      fs.readdirSync.mockReturnValue(mockFiles);
      fs.readFileSync
        .mockReturnValueOnce(JSON.stringify([mockSymptoms[0]]))
        .mockReturnValueOnce(JSON.stringify([mockSymptoms[1]]));
      Symptom.insertMany.mockResolvedValue(mockSymptoms);

      await symptomController.createSymptom(req, res, next);

      expect(fs.readdirSync).toHaveBeenCalledWith('/path/to/symptoms');
      expect(Symptom.insertMany).toHaveBeenCalledWith(mockSymptoms);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: mockSymptoms.length,
        data: mockSymptoms,
      });
    });

    it('should call next with error if file reading fails', async () => {
      const error = new Error('File system error');
      path.join.mockReturnValue('/path/to/symptoms');
      fs.readdirSync.mockImplementation(() => {
        throw error;
      });

      await symptomController.createSymptom(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should call next with error if insertMany fails', async () => {
      const error = new Error('Database error');
      path.join.mockReturnValue('/path/to/symptoms');
      fs.readdirSync.mockReturnValue(['symptoms.json']);
      fs.readFileSync.mockReturnValue(JSON.stringify([{ symptom: 'Fever' }]));
      Symptom.insertMany.mockRejectedValue(error);

      await symptomController.createSymptom(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
