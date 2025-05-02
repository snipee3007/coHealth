const Comment = require('./../models/commentsSchema.js');
const catchAsync = require('../utils/catchAsync.js');

exports.createComment = catchAsync(async (req, res, next) => {
  const { message, newsID } = req.body;
  const userID = req.user.id;
  const data = await Comment.create({ message, newsID, userID });
  res.status(201).json({
    status: 'success',
    data,
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const data = await Comment.findById(req.params.id);
  if (data) {
    await Comment.deleteOne(data._id);
    res.status(204).json({
      status: 'success',
      message: 'Delete successful!',
    });
  } else {
    res.status(400).json({
      status: 'failed',
      message:
        'This comment is no longer exist! Please try different comments!',
    });
  }
});

exports.getComments = catchAsync(async (req, res, next) => {
  const comments = await Comment.find({ newsID: req.news.id })
    .populate('userID')
    .sort('-createAt -updatedAt');
  req.comments = comments;
  next();
});
