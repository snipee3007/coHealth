const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const {
  get6NearsestNews,
  getAllNews,
  getNewsItem,
} = require('../controllers/newsGetController');
const News = require('../models/news_schema.js');

// Mock cho model News
jest.mock('../models/news_schema.js');

describe('News Controller Tests', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get6NearsestNews', () => {
    it('should return 6 nearest news successfully', async () => {
      const mockNews = [
        {
          _id: new ObjectId('60d21b4667d0d8992e610c85'),
          title: 'News 1',
          content: 'Content 1',
        },
        {
          _id: new ObjectId('60d21b4667d0d8992e610c86'),
          title: 'News 2',
          content: 'Content 2',
        },
        {
          _id: new ObjectId('60d21b4667d0d8992e610c87'),
          title: 'News 3',
          content: 'Content 3',
        },
        {
          _id: new ObjectId('60d21b4667d0d8992e610c88'),
          title: 'News 4',
          content: 'Content 4',
        },
        {
          _id: new ObjectId('60d21b4667d0d8992e610c89'),
          title: 'News 5',
          content: 'Content 5',
        },
        {
          _id: new ObjectId('60d21b4667d0d8992e610c8a'),
          title: 'News 6',
          content: 'Content 6',
        },
      ];

      News.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockNews),
        }),
      });

      await get6NearsestNews(req, res);

      expect(News.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: 6,
        data: {
          newsFound: mockNews,
        },
      });
    });

    it('should handle error when getting 6 nearest news', async () => {
      News.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      await get6NearsestNews(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'failed',
        message: 'Can not get 6 nearest news from database',
      });
    });
  });

  describe('getAllNews', () => {
    it('should return all news successfully', async () => {
      const mockNews = [
        {
          _id: new ObjectId('60d21b4667d0d8992e610c85'),
          title: 'News 1',
          content: 'Content 1',
          createdAt: new Date('2023-01-02'),
        },
        {
          _id: new ObjectId('60d21b4667d0d8992e610c86'),
          title: 'News 2',
          content: 'Content 2',
          createdAt: new Date('2023-01-01'),
        },
      ];

      News.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockNews),
      });

      await getAllNews(req, res);

      expect(News.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: 2,
        data: {
          newsFound: mockNews,
        },
      });
    });

    it('should handle error when getting all news', async () => {
      News.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      await getAllNews(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'failed',
        message: 'Can not get all news from database',
      });
    });
  });

  describe('getNewsItem', () => {
    it('should return a specific news item by slug', async () => {
      const mockNews = [
        {
          _id: new ObjectId('60d21b4667d0d8992e610c85'),
          title: 'News 1',
          content: 'Content 1',
          slug: 'news-1',
        },
      ];

      req.params = { name: 'news-1' };

      News.find.mockResolvedValue(mockNews);

      await getNewsItem(req, res);

      expect(News.find).toHaveBeenCalledWith({ slug: 'news-1' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          newsFound: mockNews,
        },
      });
    });

    it('should handle error when news item is not found', async () => {
      req.params = { name: 'non-existent-news' };

      News.find.mockResolvedValue(null);

      await getNewsItem(req, res);

      expect(News.find).toHaveBeenCalledWith({ slug: 'non-existent-news' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'failed',
        message: 'Can not found the news that request',
      });
    });

    it('should handle error when database query fails', async () => {
      req.params = { name: 'news-1' };

      News.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      await getNewsItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'failed',
        message: 'Can not found the news that request',
      });
    });
  });
});
