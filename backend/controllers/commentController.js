const Comment = require('./../models/commentsSchema.js');
const catchAsync = require('../utils/catchAsync.js');
const returnData = require('../utils/returnData.js');

exports.createComment = catchAsync(async (req, res, next) => {
  const { message, newsID } = req.body;
  const userID = req.user.id;
  const data = await Comment.create({ message, newsID, userID });
  returnData(req, res, 201, data);
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const data = await Comment.findById(req.params.id);
  if (data) {
    await Comment.deleteOne(data._id);
    returnData(req, res, 204, {}, 'Delete comment successful');
  } else {
    returnData(
      req,
      res,
      400,
      {},
      'This comment is no longer exist! Please try different comments!'
    );
  }
});

exports.getComments = catchAsync(async (req, res, next) => {
  const comments = await Comment.find({ newsID: req.news.id })
    .populate('userID')
    .sort('-createAt -updatedAt');
  req.comments = comments;
  next();
});
