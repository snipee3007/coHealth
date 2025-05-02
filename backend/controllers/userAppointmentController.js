const catchAsync = require('./../utils/catchAsync.js');
const Appointment = require('../models/appointments_schema.js');
const User = require('../models/users_schema.js');
const nodemailer = require('nodemailer');

const dotenv = require('dotenv');
dotenv.config({ path: '../../config.env' });

// từ khúc dưới này là quản lí appointment cho trang user
exports.updateAppointment = catchAsync(async (req, res, next) => {
  const user = req.user;
  if (user.role !== 'doctor') {
    res.status(403).json({
      message: 'You do not have permission to perform this action',
    });
  } else {
    const status = req.body.status;
    const appointmentCode = req.body.appointmentCode;
    console.log('appointment Code là cái này', appointmentCode);
    const appointment = await Appointment.findOneAndUpdate(
      { appointmentCode: appointmentCode },
      { status: status },
      { new: true, upsert: true }
    );
    console.log(appointment);
    res.status(200).json({
      message: 'success',
      data: appointment,
    });
  }
});

// hàm này lấy 5 thằng đầu tiên để hiển thị lên trang của user
exports.getAppointment = catchAsync(async (req, res, next) => {
  const user = req.user;
  const limit = 5;
  if (user.role !== 'doctor') {
    const allAppointments = await Appointment.find({
      userID: user._id,
    }).populate({
      path: 'doctorID',
      select: 'fullname',
      populate: { path: 'doctorInfo' },
    });
    // xếp trên đây thì xếp theo thứ tự 1 0 -1
    // rồi xếp theo ngày
    const appointments = allAppointments
      .sort((a, b) => {
        if (a.status != b.status) {
          return b.status - a.status;
        } else {
          const isFutureA = a.time >= new Date();
          const isFutureB = b.time >= new Date();
          if (isFutureA && !isFutureB) {
            return -1;
          } else if (!isFutureA && isFutureB) {
            return 1;
          } else return a.time - b.time;
        }
      })
      .slice(0, limit);
    const totalPages = Math.ceil(allAppointments.length / 5);
    req.appointments = appointments;
    req.totalPages = totalPages;
  } else {
    const allAppointments = await Appointment.find({
      doctorID: user._id,
    }).populate({
      path: 'doctorID',
      select: 'fullname',
      populate: { path: 'doctorInfo' },
    });
    // muốn xếp theo -1 1 0
    // nó đang mặc định là -1 0 1
    // sort a-b là theo thứ tự tăng dần 1 -1 0 -> a-b = 1 --1 = 2 > 0 -> đổi thành -1 1 0 -> xong tới 1 0 thì 1 - 0 = 1 -> đổi lại b-a
    // xong rồi xếp theo ngày, từ hiện tại -> tương lai
    const appointments = allAppointments
      .sort((a, b) => {
        console.log('từng cái 1 nè ', a.status, ' cái thứ 2 nè ', b.status);
        if (a.status != b.status) {
          if (
            (a.status === 1 && b.status === 0) ||
            (a.status === 0 && b.status === 1)
          ) {
            return b.status - a.status;
          } else return a.status - b.status;
        } else {
          const isFutureA = a.time >= new Date();
          const isFutureB = b.time >= new Date();
          if (isFutureA && !isFutureB) {
            return -1;
          } else if (!isFutureA && isFutureB) {
            return 1;
          } else return a.time - b.time;
        }
      })
      .slice(0, limit);
    //console.log(appointments)
    const totalPages = Math.ceil(allAppointments.length / 5);
    req.appointments = appointments;
    req.totalPages = totalPages;
  }
  next();
});

// hàm này query theo từng trang lấy req.params để xài
exports.getAppointmentEachPage = catchAsync(async (req, res, next) => {
  const user = req.user;
  const page = req.query.page || 1;
  const skip = (page - 1) * 5;
  const limit = 5;
  if (user.role !== 'doctor') {
    let appointments = await Appointment.find({
      userID: user._id,
    })
      // coi thử xem sort theo cái ngày gần với hiện nay
      .populate({
        path: 'doctorID',
        select: 'fullname',
        populate: { path: 'doctorInfo' },
      });
    appointments = appointments
      .sort((a, b) => {
        if (a.status != b.status) {
          return b.status - a.status;
        } else {
          const isFutureA = a.time >= new Date();
          const isFutureB = b.time >= new Date();
          if (isFutureA && !isFutureB) {
            return -1;
          } else if (!isFutureA && isFutureB) {
            return 1;
          } else return a.time - b.time;
        }
      })
      .slice(skip, skip + limit);
    const totalAppointments = await Appointment.countDocuments({
      userID: user._id,
    });
    const totalPages = Math.ceil(totalAppointments / limit);
    res.status(200).json({
      message: 'success',
      data: {
        appointments: appointments,
        totalPages: totalPages,
      },
    });
  } else {
    const allAppointments = await Appointment.find({
      doctorID: user._id,
    });
    console.log('trước khi sort nó là v');
    // muốn xếp theo -1 1 0
    // nó đang mặc định là -1 0 1
    // sort a-b là theo thứ tự tăng dần 1 -1 0 -> a-b = 1 --1 = 2 > 0 -> đổi thành -1 1 0 -> xong tới 1 0 thì 1 - 0 = 1 -> đổi lại b-a
    // xong rồi xếp theo thời gian, từ hiện tại đến tương lai trước r lấy quá khứ sau
    const appointments = allAppointments
      .sort((a, b) => {
        if (a.status != b.status) {
          if (
            (a.status === 1 && b.status === 0) ||
            (a.status === 0 && b.status === 1)
          ) {
            return b.status - a.status;
          } else return a.status - b.status;
        } else {
          const isFutureA = a.time >= new Date();
          const isFutureB = b.time >= new Date();
          if (isFutureA && !isFutureB) {
            return -1;
          } else if (!isFutureA && isFutureB) {
            return 1;
          } else return a.time - b.time;
        }
      })
      .slice(skip, skip + limit);
    console.log('đây là appointments sau khi slice', appointments);
    const totalAppointments = await Appointment.countDocuments({
      userID: user._id,
    });
    const totalPages = Math.ceil(totalAppointments / limit);
    res.status(200).json({
      message: 'success',
      data: {
        appointments: appointments,
        totalPages: totalPages,
      },
    });
  }
});

// hàm này để lấy nội dung trong từng appointment
exports.getAppointmentDetails = catchAsync(async (req, res, next) => {
  const appointmentCode = req.params.appointmentCode;
  const appointment = await Appointment.findOne({
    appointmentCode: appointmentCode,
  }).populate({
    path: 'doctorID',
    select: 'fullname email phoneNumber',
    populate: { path: 'doctorInfo' },
  });
  req.appointment = appointment;
  next();
});

// hàm này để gửi email đến người dùng khi bác sĩ đã chấp nhận hoặc từ chối lịch hẹn
exports.sendEmail = catchAsync(async (req, res, next) => {
  const objAppointment = req.body;
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Nội dung email
  let subject =
    objAppointment.status === '1'
      ? `YOUR APPOINTMENT IN ${objAppointment.date} HAS BEEN ACCEPTED `
      : `YOUR APPOINTMENT IN ${objAppointment.date} HAS BEEN DECLINED`;
  let htmlContent = `
    <div style="max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
        <h2 style="color: #2E86C1; text-align: center;">Your Appointment Status</h2>
        
        <!-- Logo 
        <div style="text-align: center;">
           <img src="https://drive.google.com/file/d/1uhsI4Pjc--KwXqUuy4DwMbqNARVhqVLg/view?usp=sharing" alt="coHealth logo" style="width: 150px;">
        </div> -->
        
        <p>Dear <strong>${objAppointment.fullname}</strong>,</p>

        ${
          objAppointment.status === '1'
            ? `
            <p>We are pleased to inform you that your appointment request has been <strong style="color: green;">accepted</strong>. Here are the details:</p>
            <p>📅 <strong>Date:</strong> ${objAppointment.date}</p>
            <p>⏰ <strong>Time:</strong> ${objAppointment.time}</p>
            <p>Please arrive <strong>15 minutes early</strong> to ensure a smooth check-in process.</p>
        `
            : `
            <p>We regret to inform you that your appointment request has been <strong style="color: red;">declined</strong>. Please contact us to reschedule.</p>
        `
        }
        
        <p>If you have any questions, feel free to <a href="mailto:${
          process.env.EMAIL_USER
        }">contact us</a>.</p>
        
        <p>Best regards,</p>
        <p><strong>coHealth team</strong></p>
    </div>
    `;
  let info = await transporter.sendMail({
    from: `"coHealth " <${process.env.EMAIL_USER}>`,
    to: objAppointment.email, // Email người nhận
    subject: subject,
    html: htmlContent,
  });
  res.status(200).json({
    status: 'success',
    data: info,
  });
});
