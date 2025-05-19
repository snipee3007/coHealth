const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('./../utils/appError.js');
const Appointment = require('../models/appointments_schema.js');
const User = require('../models/users_schema.js');
const crypto = require('crypto');
const returnData = require('../utils/returnData.js');
function generateToken() {
  return crypto.randomBytes(16).toString('hex'); // 16 bytes = 32 ký tự hex
}

exports.createAppointment = catchAsync(async (req, res, next) => {
  const doctor = await User.findById(req.body.doctorID).populate({
    path: 'doctorInfo',
  });
  if (!doctor) {
    return next(new AppError('Can not find this doctor!', 400));
  }

  const userID = req.user ? req.user._id : null;
  const now = new Date(Date.now());
  const time = new Date(req.body.time);
  if (time.getTime() <= now.getTime())
    return next(
      new AppError(
        'Invalid time for your appointment! Please try different time!',
        400
      )
    );
  const appointment = await Appointment.create({
    fullname: req.body.fullname,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    doctorID: req.body.doctorID,
    time: req.body.time,
    reason: req.body.reason,
    userID: userID,
    appointmentCode: generateToken(),
  });
  returnData(req, res, 200, appointment);
});

// hàm này query để tìm coi có trùng giờ ông bác sĩ đó không => tìm những cái cuộc hẹn nó có thời gian xa hơn Date.now() thui
exports.getAllAppointment = catchAsync(async (req, res, next) => {
  const appointments = await Appointment.find({
    time: { $gte: Date.now() },
  }).populate({
    path: 'doctorID',
    select: 'fullname',
    populate: { path: 'doctorInfo' },
  });
  returnData(req, res, 200, appointments);
});

exports.deleteAppointment = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);
  if (appointment) {
    await Appointment.findByIdAndDelete(req.params.id);
    returnData(
      req,
      res,
      204,
      {
        patient: appointment.userID,
        doctor: appointment.doctorID,
        reason: appointment.reason,
        userID: req.user._id,
      },
      'Delete appointment successful'
    );
  } else
    return next(
      new AppError('Can not find appointment with provided id!', 400)
    );
});

exports.getBookedAppointment = catchAsync(async (req, res, next) => {
  const { doctorID, email } = req.query;
  const personalBookedAppointment = await Appointment.find({
    email,
    time: { $gte: Date.now() },
  });
  if (personalBookedAppointment.length > 0) {
  }
  const bookedAppointment = await Appointment.find({
    doctorID,
    time: { $gte: Date.now() },
  });
  returnData(req, res, 200, { personalBookedAppointment, bookedAppointment });
});
