const crypto = require('crypto');
const rimraf = require('rimraf');

const User = require('../models/users_schema.js');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');
const Doctor = require('../models/doctors_schema.js');
const returnData = require('../utils/returnData.js');
const Appointment = require('../models/appointments_schema.js');
const CalculateHistory = require('../models/calculateHistory_schema.js');
const ChatRoom = require('../models/chatRoom_schema.js');
const ChatLog = require('../models/chatLog_schema.js');
const Comment = require('../models/commentsSchema.js');
const News = require('../models/news_schema.js');
const Notification = require('../models/notificationSchema.js');
const SymptomHistory = require('../models/symptomHistory_schema.js');
const Email = require('./../utils/email.js');
exports.getDoctors = catchAsync(async (req, res, next) => {
  const doctorsList = await User.find({
    role: 'doctor',
  }).populate({ path: 'doctorInfo', select: 'major' });
  let doctors = [];
  // console.log('doctorList là ', doctorsList[0]._id);
  // console.log('user id hiện tại là: ', req.user._id);
  doctorsList.forEach((doctor) => {
    if (doctor.doctorInfo[0].major == req.query.major) {
      if (req.user) {
        if (!req.user._id.equals(doctor._id)) {
          doctors.push(doctor);
        }
      } else {
        doctors.push(doctor);
      }
    }
  });
  // console.log(doctors);
  returnData(req, res, 200, doctors);
});

exports.getDoctor = catchAsync(async (req, res, next) => {
  const doctor = await User.findOne({
    slug: req.originalUrl.split('/')[3],
    role: 'doctor',
  }).populate({ path: 'doctorInfo' });
  if (!doctor) {
    return next(
      new AppError('Can not found the doctor with provided slug', 400)
    );
  } else returnData(req, res, 200, doctor);
});

exports.createDoctor = catchAsync(async (req, res, next) => {
  const doctor = req.body;
  if (doctor.role.includes('doctor')) {
    if (doctor.gender == 'male') doctor.image = 'menAnonymous.jpg';
    else if (doctor.gender == 'female') doctor.image = 'womanAnonymous.jpg';

    doctor.password = crypto.randomBytes(16).toString('hex');
    doctor.confirmPassword = doctor.password;
    await new Email(doctor).sendNewPassword();
    const newDoctor = await User.create({
      email: doctor.email,
      password: doctor.password,
      confirmPassword: doctor.confirmPassword,
      fullname: doctor.fullname,
      gender: doctor.gender,
      phoneNumber: doctor.phoneNumber,
      yearOfBirth: doctor.yearOfBirth,
      role: doctor.role,
      image: doctor.image,
      lastSeen: Date.now(),
    });
    // console.log(newDoctor);
    const doctorExtend = await Doctor.create({
      major: doctor.major,
      workAt: doctor.workAt,
      rating: doctor.rating,
      yearEXP: doctor.yearEXP,
      userID: newDoctor._id,
    });
    // console.log(docterExtend);
    returnData(req, res, 200, { newDoctor, doctorExtend });
  } else {
    return next(
      new AppError(
        'This is a create doctor route, please create new user with role doctor!',
        400
      )
    );
  }
});

exports.deleteDoctor = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ slug: req.params.slug });
  if (!user)
    return next(
      new AppError(
        'Can not find doctor with provided slug. Please try different name!',
        400
      )
    );
  if (!user.role.includes('doctor')) {
    return next(
      new AppError(
        'Target user is not a doctor! Please try different user!',
        400
      )
    );
  }

  // Delete all appointment of this doctor
  await Appointment.deleteMany({ doctorID: user._id });

  // Delete all calculate history of this doctor
  await CalculateHistory.deleteMany({ userID: user._id });

  // Delete all chat room
  await ChatRoom.deleteMany({ memberID: user._id });

  // Delete all chat log
  await ChatLog.deleteMany({ senderID: user._id });

  // Delete all comment
  await Comment.deleteMany({ userID: user._id });

  // Delete all news from this doctor
  const doctorNews = await News.find({ userID: user._id });
  for (let i = 0; i < doctorNews.length; ++i) {
    rimraf.manual(`frontend/images/news/${doctorNews[i].slug}`);
    await Comment.deleteMany({ newsID: doctorNews[i]._id });
    await Notification.deleteMany({ newsID: doctorNews[i]._id });
    await News.findByIdAndDelete(doctorNews[i]._id);
  }

  // Delete all Notification from this doctor
  await Notification.deleteMany({
    $or: [{ 'to.targetID': user._id }, { from: user._id }],
  });

  // Delete all symptoms checker history
  await SymptomHistory.deleteMany({ userID: user._id });

  // Delete doctor info
  await Doctor.findOneAndDelete({ userID: user._id });

  // Delete user
  rimraf.manual(`frontend/images/users/profile/${req.params.slug}.png`);
  await User.findOneAndDelete({ slug: req.params.slug });

  returnData(
    req,
    res,
    204,
    { doctor: user.fullname, slug: user.slug, userID: req.user.id },
    'Delete doctor successful!'
  );
});
