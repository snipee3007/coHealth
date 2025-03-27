const multer = require('multer');
const sharp = require('sharp');
const slugify = require('slugify');
const rimraf = require('rimraf');

const User = require('./../models/users_schema');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

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

exports.uploadImage = upload.fields([{ name: 'userProfile', maxCount: 1 }]);

exports.updateImagePath = catchAsync(async (req, res, next) => {
  // console.log(req.files);
  if (!req.files.userProfile) return next();
  const userID = req.user['_id'];

  if (req.files.userProfile) {
    const filename = `${userID}.png`;

    if (
      req.body.prevUserProfile !== 'menAnonymous.jpg' &&
      req.body.prevUserProfile !== 'womanAnonymous.jpg'
    )
      rimraf.manual(
        `frontend/images/users/profile/${req.body.prevuserProfile}`
      );

    await sharp(req.files.userProfile[0].buffer)
      .resize({ width: 600, height: 600, fit: sharp.fit.cover })
      .toFormat('png')
      .png({ quality: 100 })
      .toFile(`frontend/images/users/profile/${filename}`);

    req.userProfile = filename;
  }

  if (req.files.coverImage) {
    const filename = `${slug}-cover-image.png`;

    if (req.body.prevCoverImage !== 'defaultCoverImage.png')
      rimraf.manual(
        `frontend/images/Users/teacherCoverImage/${req.body.prevCoverImage}`
      );

    await sharp(req.files.coverImage[0].buffer)
      .resize({ width: 600, height: 800, fit: sharp.fit.cover })
      .toFormat('png')
      .png({ quality: 100 })
      .toFile(`frontend/images/Users/teacherCoverImage/${filename}`);

    req.coverImage = filename;
  }

  next();
});

exports.getUserByToken = async (req) => {
  const data = req.rawHeaders.find((str) => str.includes('jwt'));

  if (!data) {
    // console.error('No JWT header found');
    return null; // Consider returning null or some other appropriate value in case of error
  }

  const token = data
    .split(';')
    .filter((str) => str.includes('jwt'))[0]
    .replace('jwt=', '')
    .trim();
  if (!token) {
    // console.error('No JWT present in the header');
    return null; // Consider returning null or some other appropriate value in case of error
  }

  const user = await User.findOne({
    token: token.replace('jwt=', '').trim(),
  });

  return user;
};

exports.editProfile = catchAsync(async (req, res, next) => {
  const currentUser = req.user;
  const data = req.body;
  await User.findOneAndUpdate(
    currentUser['_id'],
    {
      fullname: data.fullname,
      gender: data.gender,
      address: data.address,
      phoneNumber: data.phoneNumber,
      yearOfBirth: data.yearOfBirth,
      email: data.email,
      image: req.userProfile,
    },
    { runValidator: true }
  );

  res.status(201).json({
    status: 'success',
    message: 'Update User Profile successful!',
  });
});
