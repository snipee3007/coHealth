const catchAsync = require('./../utils/catchAsync.js');
const Appointment = require('../models/appointments_schema.js');
const User = require('../models/users_schema.js');
const crypto = require('crypto');
const returnData = require('../utils/returnData.js');
function generateToken() {
  return crypto.randomBytes(16).toString('hex'); // 16 bytes = 32 ký tự hex
}

exports.createAppointment = catchAsync(async (req, res, next) => {
  const doctors = await User.find({
    fullname: req.body.docFullname,
  }).populate({ path: 'doctorInfo' });
  if (!doctors) {
    return next(new AppError('Can not find this doctor!', 400));
  }
  const matchDoctor = doctors.find(
    (doctor) =>
      doctor.doctorInfo[0] && doctor.doctorInfo[0].major === req.body.specialty
  );
  if (!matchDoctor) {
    return next(
      new AppError(
        'Can not find this doctor because the provide major is different!',
        400
      )
    );
  } else {
    const userID = req.user ? req.user._id : null;
    const appointment = await Appointment.create({
      fullname: req.body.fullname,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      doctorID: matchDoctor._id,
      time: req.body.time,
      reason: req.body.reason,
      userID: userID,
      appointmentCode: generateToken(),
    });
    returnData(req, res, 200, appointment);
  }
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
