const User = require('../models/users_schema.js');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');
const Doctor = require('../models/doctors_schema.js');
const returnData = require('../utils/returnData.js');

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
  // console.log(req.body);
  if (doctor.role.includes('doctor')) {
    const newDoctor = await User.create({
      email: doctor.email,
      password: doctor.password,
      confirmPassword: doctor.confirmPassword,
      fullname: doctor.fullname,
      gender: doctor.gender,
      phoneNumber: doctor.phoneNumber,
      yearOfBirth: doctor.yearOfBirth,
      role: doctor.role,
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
