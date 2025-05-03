const User = require('../models/users_schema.js');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');
const Doctor = require('../models/doctors_schema.js');

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
  console.log(doctors);
  res.status(200).json({
    status: 'success',
    data: doctors,
  });
});

exports.getDoctor = catchAsync(async (req, res, next) => {
  const doctor = await User.findOne({
    slug: req.originalUrl.split('/')[3],
    role: 'doctor',
  }).populate({ path: 'doctorInfo' });
  if (!doctor) {
    res.status(404).json({
      status: 'failed',
      message: 'Can not found the doctor that request',
    });
  } else
    res.status(200).json({
      status: 'success',
      length: doctor.length,
      data: doctor,
    });
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
    const docterExtend = await Doctor.create({
      major: doctor.major,
      workAt: doctor.workAt,
      rating: doctor.rating,
      yearEXP: doctor.yearEXP,
      userID: newDoctor._id,
    });
    // console.log(docterExtend);

    res.status(200).json({
      status: 'success',
      data: { newDoctor, docterExtend },
    });
  } else {
    res.status(401).json({
      status: 'failed',
      message: 'You are not a doctor! Please try again!',
    });
    res.end();
  }
});

exports.getRecommendDoctor = catchAsync(async (req, res, next) => {
  const doctor = await User.findOne({
    slug: req.originalUrl.split('/')[3],
    role: 'doctor',
  }).populate({ path: 'doctorInfo' });

  const recommendDoctors = await User.find({
    role: 'doctor',
  }).populate({
    path: 'doctorInfo',
    match: { major: { $eq: doctor.doctorInfo[0].major } },
  });
  if (!recommendDoctors) {
    res.status(404).json({
      status: 'failed',
      message: 'Can not found the recommendDoctors that request',
    });
  } else
    res.status(200).json({
      status: 'success',
      length: recommendDoctors.length,
      data: recommendDoctors,
    });
});
