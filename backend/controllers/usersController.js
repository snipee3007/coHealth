const multer = require('multer');
const sharp = require('sharp');
const slugify = require('slugify');
const rimraf = require('rimraf');

const User = require('./../models/users_schema.js');
const Doctor = require('./../models/doctors_schema.js');
const Appointment = require('./../models/appointments_schema.js');
const ChatRoom = require('./../models/chatRoom_schema.js');
const ChatLog = require('./../models/chatLog_schema.js');
const CalculateHistory = require('./../models/calculateHistory_schema.js');
const SymptomHistory = require('./../models/symptomHistory_schema.js');
const Comment = require('./../models/commentsSchema.js');
const Notification = require('./../models/notificationSchema.js');
const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('./../utils/appError.js');
const returnData = require('../utils/returnData.js');

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

  const filename = `${req.user.slug}.png`;

  if (
    req.body.prevUserProfile !== 'menAnonymous.jpg' &&
    req.body.prevUserProfile !== 'womanAnonymous.jpg'
  )
    rimraf.manual(`frontend/images/users/profile/${req.body.prevuserProfile}`);

  await sharp(req.files.userProfile[0].buffer)
    .resize({ width: 600, height: 600, fit: sharp.fit.cover })
    .toFormat('png')
    .png({ quality: 100 })
    .toFile(`frontend/images/users/profile/${filename}`);

  req.userProfile = filename;

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
  if (currentUser.role == 'doctor') {
    await Doctor.findOneAndUpdate(
      { userID: currentUser['_id'] },
      {
        major: data.major,
        workAt: data.workAt,
      },
      {
        runValidators: true,
      }
    );
  }
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
  returnData(req, res, 201, {}, 'Update user profile successful!');
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ slug: req.params.slug });
  if (!user)
    return next(
      new AppError(
        'Can not find user with provided slug. Please try different name!',
        400
      )
    );
  if (!user.role.includes('user')) {
    return next(
      new AppError('Target user is not a user! Please try different user!', 400)
    );
  }

  // Delete all appointment of this doctor
  await Appointment.deleteMany({ userID: user._id });

  // Delete all calculate history of this doctor
  await CalculateHistory.deleteMany({ userID: user._id });

  // Delete all chat room
  await ChatRoom.deleteMany({ memberID: user._id });

  // Delete all chat log
  await ChatLog.deleteMany({ senderID: user._id });

  // Delete all comment
  await Comment.deleteMany({ userID: user._id });

  // Delete all Notification from this doctor
  await Notification.deleteMany({
    $or: [{ 'to.targetID': user._id }, { from: user._id }],
  });

  // Delete all symptoms checker history
  await SymptomHistory.deleteMany({ userID: user._id });

  // Delete user
  rimraf.manual(`frontend/images/users/profile/${req.params.slug}.png`);
  await User.findOneAndDelete({ slug: req.params.slug });

  returnData(
    req,
    res,
    204,
    { user: user.fullname, slug: user.slug, userID: req.user.id },
    'Delete user successful!'
  );
});
