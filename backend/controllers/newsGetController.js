const news = require('../models/news_schema.js');

exports.get6NearsestNews = async (req, res) => {
  try {
    const newsFound = await news.find().sort('_id').limit(6);
    res.status(200).json({
      status: 'success',
      results: newsFound.length,
      data: {
        newsFound,
      },
    });
  } catch {
    res.status(404).json({
      status: 'failed',
      message: 'Can not get 6 nearest news from database',
    });
  }
};

exports.getAllNews = async (req, res) => {
  try {
    const newsFound = await news.find().sort('-createdAt');
    res.status(200).json({
      status: 'success',
      results: newsFound.length,
      data: {
        newsFound,
      },
    });
  } catch {
    res.status(404).json({
      status: 'failed',
      message: 'Can not get all news from database',
    });
  }
};

exports.getNewsItem = async (req, res) => {
  try {
    let newsFound = await news.find({ slug: req.params.name });
    if (!newsFound) {
      throw new Error("Can not find the request's news");
    }
    res.status(200).json({
      status: 'success',
      data: {
        newsFound,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: 'Can not found the news that request',
    });
  }
};
