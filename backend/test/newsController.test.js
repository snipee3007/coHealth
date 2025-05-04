const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const newsController = require('../controllers/newsController');
const News = require('../models/news_schema');
const AppError = require('../utils/appError');
const multer = require('multer');
const sharp = require('sharp');

// Mock các module cần thiết
jest.mock('../models/news_schema');
jest.mock('../utils/appError');
jest.mock('../utils/catchAsync', () => (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
});
jest.mock('multer', () => {
  return {
    memoryStorage: jest.fn().mockReturnValue('memoryStorage'),
    diskStorage: jest.fn(),
  };
});
jest.mock('sharp');
jest.mock('slugify');
jest.mock('../utils/removeAscent');
jest.mock('mkdirp');

describe('News Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      files: {},
      user: {
        id: new ObjectId('60d21b4667d0d8992e610c85'),
      },
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      writeHead: jest.fn(),
      end: jest.fn(),
    };
    next = jest.fn();

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('uploadImages', () => {
    test('should call multer with correct configuration', () => {
      expect(multer).toHaveBeenCalledWith({
        storage: 'memoryStorage',
        fileFilter: expect.any(Function),
      });
    });
  });

  describe('resizeImages', () => {
    test('should call next() when no files uploaded', async () => {
      await newsController.resizeImages(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.body.images).toBeUndefined();
    });

    test('should process images when uploaded', async () => {
      const mockSharpInstance = {
        resize: jest.fn().mockReturnThis(),
        toFormat: jest.fn().mockReturnThis(),
        png: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue(undefined),
      };

      sharp.mockReturnValue(mockSharpInstance);

      req.files = {
        images: [
          { buffer: Buffer.from('test-image') },
          { buffer: Buffer.from('test-image-2') },
        ],
        coverImage: [{ buffer: Buffer.from('cover-image') }],
      };

      req.body.title = 'Test News Title';
      req.slug = 'test-news-title';

      await newsController.resizeImages(req, res, next);

      expect(req.body.images).toHaveLength(2);
      expect(req.body.images).toEqual([
        'test-news-title-1.png',
        'test-news-title-2.png',
      ]);
      expect(req.body.coverImage).toBe('test-news-title-cover-image.png');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('createNews', () => {
    test('should return error if title already exists', async () => {
      News.distinct.mockResolvedValue(['Test News Title']);

      req.body = {
        title: 'Test News Title',
        description: 'Test description',
        category: 'Test',
        news: JSON.stringify({ content: 'Test news content' }),
        images: ['image1.png', 'image2.png'],
        coverImage: 'cover.png',
      };

      await newsController.createNews(req, res, next);

      expect(News.distinct).toHaveBeenCalledWith('title');
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    test('should create news successfully', async () => {
      const newsData = {
        _id: new ObjectId('60d21b4667d0d8992e610c86'),
        title: 'Test News Title',
        category: 'Test',
        news: { content: 'Test news content' },
        images: ['image1.png', 'image2.png'],
        description: 'Test description',
        userID: new ObjectId('60d21b4667d0d8992e610c85'),
        slug: 'test-news-title',
        coverImage: 'cover.png',
      };

      News.distinct.mockResolvedValue(['Different Title']);
      News.create.mockResolvedValue(newsData);

      req.body = {
        title: 'Test News Title',
        description: 'Test description',
        category: 'Test',
        news: JSON.stringify({ content: 'Test news content' }),
        images: ['image1.png', 'image2.png'],
        coverImage: 'cover.png',
      };

      req.slug = 'test-news-title';

      await newsController.createNews(req, res, next);

      expect(News.create).toHaveBeenCalledWith({
        title: 'Test News Title',
        category: 'Test',
        news: { content: 'Test news content' },
        images: ['image1.png', 'image2.png'],
        description: 'Test description',
        userID: new ObjectId('60d21b4667d0d8992e610c85'),
        slug: 'test-news-title',
        coverImage: 'cover.png',
      });
    });
  });

  describe('getNews', () => {
    test('should redirect to notFound if news not found', async () => {
      News.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      req.params.name = 'non-existent-news';

      await newsController.getNews(req, res, next);

      expect(News.findOne).toHaveBeenCalledWith({ slug: 'non-existent-news' });
      expect(res.writeHead).toHaveBeenCalledWith(
        302,
        "Can't find any news with given slug! Please try again later!",
        { location: '/notFound' }
      );
      expect(res.end).toHaveBeenCalled();
    });

    test('should increment visit count when type=visit', async () => {
      const newsData = {
        _id: new ObjectId('60d21b4667d0d8992e610c86'),
        title: 'Test News',
        slug: 'test-news',
        visit: 10,
      };

      News.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(newsData),
      });

      req.params.name = 'test-news';
      req.query.type = 'visit';

      await newsController.getNews(req, res, next);

      expect(News.findOneAndUpdate).toHaveBeenCalledWith(
        { slug: 'test-news' },
        { $inc: { visit: 1 } }
      );
      expect(req.news).toBe(newsData);
      expect(next).toHaveBeenCalled();
    });

    test('should set news data and call next() when news is found', async () => {
      const newsData = {
        _id: new ObjectId('60d21b4667d0d8992e610c86'),
        title: 'Test News',
        slug: 'test-news',
        userID: {
          _id: new ObjectId('60d21b4667d0d8992e610c85'),
          fullname: 'Test User',
        },
      };

      News.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(newsData),
      });

      req.params.name = 'test-news';

      await newsController.getNews(req, res, next);

      expect(News.findOne).toHaveBeenCalledWith({ slug: 'test-news' });
      expect(req.news).toBe(newsData);
      expect(next).toHaveBeenCalled();
    });
  });
});
