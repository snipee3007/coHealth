const News = require('./../models/news_schema.js');
const AppError = require('../utils/appError.js');
const catchAsync = require('../utils/catchAsync.js');
const returnData = require('../utils/returnData.js');
const multer = require('multer');
const sharp = require('sharp');
const slugify = require('slugify');
const { mkdirp } = require('mkdirp');
const removeAscent = require('../utils/removeAscent.js');

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

  next();
});

exports.createNews = catchAsync(async (req, res, next) => {
  const { title, description, category, news, images, coverImage } = req.body;
  const allTitle = await News.distinct('title');
  if (allTitle.includes(title)) {
    return next(
      new AppError(
        'This title has already taken! Please use different title!',
        400
      )
    );
  }
  const fixNews = JSON.parse(news);
  console.log(fixNews);
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
