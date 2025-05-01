const catchAsync = require('./../utils/catchAsync.js');
const Appointment = require('../models/appointments_schema.js');
const User = require('../models/users_schema.js');
const crypto = require('crypto');

function generateToken() {
  return crypto.randomBytes(16).toString('hex'); // 16 bytes = 32 ký tự hex
}

exports.createAppointment = catchAsync(async (req, res, next) => {
  const doctors = await User.find({
    fullname: req.body.docFullname,
  }).populate({ path: 'doctorInfo' });
  if (!doctors) {
    res.status(400).json({
      status: 'fail',
      message: 'Can not find this doctor',
    });
  }
  console.log('nguyên dãy doctor ở đây', doctors);
  const matchDoctor = doctors.find(
    (doctor) =>
      doctor.doctorInfo[0] && doctor.doctorInfo[0].major === req.body.specialty
  );
  console.log('lọc lại còn 1 thằng matchDoctor nè', matchDoctor);
  if (!matchDoctor) {
    res.status(400).json({
      status: 'fail',
      message: 'Can not find this doctor do sai chuyên môn',
    });
  } else {
    const userID = req.user ? req.user._id : null;
    console.log(req.body);
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
    console.log(appointment);
    res.status(200).json({
      status: 'success',
      data: appointment,
    });
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
  res.status(200).json({
    status: 'success',
    data: appointments,
  });
});
