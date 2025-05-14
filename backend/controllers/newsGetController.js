const News = require('../models/news_schema.js');
const catchAsync = require('../utils/catchAsync.js');
const returnData = require('../utils/returnData.js');

exports.get6NearsestNews = catchAsync(async (req, res, next) => {
  const newsFound = await News.find().sort('_id').limit(6);
  returnData(req, res, 200, { results: newsFound.length, news: newsFound });
});

exports.getAllNews = catchAsync(async (req, res) => {
  const newsFound = await News.find().sort('-createdAt');
  returnData(req, res, 200, { results: newsFound.length, news: newsFound });
});

exports.getNewsItem = async (req, res) => {
  let newsFound = await News.find({ slug: req.params.name });
  if (!newsFound) {
    throw new Error("Can not find the request's news");
  }
  returnData(req, res, 200, newsFound);
};
