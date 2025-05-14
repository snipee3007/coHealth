const News = require('./../models/news_schema.js');
const Comment = require('./../models/commentsSchema.js');
const Notification = require('./../models/notificationSchema.js');
const AppError = require('../utils/appError.js');
const catchAsync = require('../utils/catchAsync.js');
const returnData = require('../utils/returnData.js');
const multer = require('multer');
const sharp = require('sharp');
const slugify = require('slugify');
const { mkdirp } = require('mkdirp');
const removeAscent = require('../utils/removeAscent.js');
const rimraf = require('rimraf');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadImages = upload.fields([
  { name: 'images' },
  { name: 'coverImage', maxCount: 1 },
]);

exports.resizeImages = catchAsync(async (req, res, next) => {
  // Check if exist title
  const allTitle = await News.distinct('title');
  if (allTitle.includes(req.body.title)) {
    // If existed, do not do the later process
    return next(
      new AppError(
        'This title has already taken! Please use different title!',
        400
      )
    );
  }

  // If not, do all the later process
  if (
    (!req.files?.images || req.files?.images.length == 0) &&
    (!req.files?.coverImage || req.files?.coverImage.length == 0)
  )
    return next();
  req.body.images = [];
  const slug = slugify(
    removeAscent(
      req.body.title
        .replace(/[,]/g, 'cm')
        .replace(/[.]/g, 'dt')
        .replace(/["]/g, 'dq')
        .replace(/[!]/g, 'em')
        .replace(/[']/g, 'qt')
        .replace(/[(]/g, 'ob')
        .replace(/[:]/g, 'td')
        .replace(/[;]/g, 'dc')
        .replace(/[)]/g, 'cb')
    )
  ).toLowerCase();
  req.slug = slug;
  if (req.files?.images && req.files?.images.length > 0) {
    await mkdirp(`frontend/images/news/${slug}`);
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `${slug}-${i + 1}.png`;
        await sharp(file.buffer)
          .resize({
            width: 1920,
            fit: sharp.fit.contain,
          })
          .toFormat('png')
          .png({ quality: 90 })
          .toFile(`frontend/images/news/${slug}/${filename}`);
        req.body.images.push(filename);
      })
    );
  }
  if (req.files?.coverImage && req.files?.coverImage.length == 1) {
    await mkdirp(`frontend/images/news/${slug}`);
    await Promise.all(
      req.files.coverImage.map(async (file, i) => {
        const filename = `${slug}-cover-image.png`;
        await sharp(file.buffer)
          .resize({
            width: 1920,
            fit: sharp.fit.contain,
          })
          .toFormat('png')
          .png({ quality: 90 })
          .toFile(`frontend/images/news/${slug}/${filename}`);
        req.body.coverImage = filename;
      })
    );
  }
  console.log('hello');
  next();
});

exports.createNews = catchAsync(async (req, res, next) => {
  const { title, description, category, news, images, coverImage } = req.body;
  const fixNews = JSON.parse(news);
  // console.log(fixNews);
  let newNews = await News.create({
    title,
    category,
    news: fixNews,
    images,
    description,
    userID: req.user.id,
    slug: req.slug,
    coverImage,
  });
  returnData(res, 201, newNews, '');
});

exports.get6NearsestNews = catchAsync(async (req, res, next) => {
  const newsFound = await News.find().sort('_id').limit(6);
  returnData(req, res, 200, { results: newsFound.length, news: newsFound });
});

exports.getAllNews = catchAsync(async (req, res, next) => {
  const newsFound = await News.find().sort('-createdAt');
  returnData(req, res, 200, { results: newsFound.length, news: newsFound });
});

exports.getNewsItem = catchAsync(async (req, res) => {
  let newsFound = await News.find({ slug: req.params.name });
  if (!newsFound) {
    throw new Error("Can not find the request's news");
  }
  returnData(req, res, 200, newsFound);
});

exports.deleteNews = catchAsync(async (req, res, next) => {
  const news = await News.findOne({ slug: req.params.name });
  if (news) {
    rimraf.manual(`frontend/images/news/${req.params.name}`);
    await Comment.deleteMany({ newsID: news._id });
    await News.findByIdAndDelete(news._id);
    await Notification.deleteMany({ newsID: news._id });
    returnData(
      req,
      res,
      204,
      { slug: req.params.name, userID: req.user.id },
      'Delete news successful'
    );
  } else
    return next(new AppError('The news trying to delete is not existed!', 400));
});

/////////////////////////
// FOR TEMPLATE RENDER //
/////////////////////////

exports.getNews = catchAsync(async (req, res, next) => {
  // Query
  const news = await News.findOne({ slug: req.params.name }).populate({
    path: 'userID',
    select: 'fullname',
  });
  if (req.query.type == 'visit') {
    await News.findOneAndUpdate(
      { slug: req.params.name },
      {
        $inc: {
          visit: 1,
        },
      }
    );
  }
  if (!news) {
    res.writeHead(
      302,
      "Can't find any news with given slug! Please try again later!",
      {
        location: '/notFound',
      }
    );
    res.end();
  } else {
    // Return data
    req.news = news;
    next();
  }
});
