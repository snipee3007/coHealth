const schedule = require('node-schedule');
const Appointment = require('./../models/appointments_schema.js');
const axios = require('axios');
const nodemailer = require('nodemailer');
exports.cancelAppointment = function (req, res, next) {
  const job = schedule.scheduleJob('* 0,30 * * * *', async function (e) {
    try {
      const appointments = await Appointment.find({
        $and: [
          { time: { $lte: new Date(Date.now() + 1000 * 60 * 60 * 1.5) } },
          { time: { $gte: Date.now() } },
          { status: -1 },
        ],
      });
      if (appointments.length > 0) {
        for (let i = 0; i < appointments.length; ++i) {
          const appointment = appointments[i];
          console.log({
            status: 0,
            fullname: appointment.fullname,
            date: new Date(appointment.time).toLocaleDateString(),
            email: appointment.email,
          });
          const res = await sendEmail({
            status: 0,
            fullname: appointment.fullname,
            date: new Date(appointment.time).toLocaleDateString({
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }),
            email: appointment.email,
          });
          await Appointment.findByIdAndUpdate(appointment.id, { status: 0 });
        }
      }
    } catch (err) {
      console.log(err);
    }
  });
  next();
};

// HELPER FUNCTION
const sendEmail = async function (data) {
  const objAppointment = data;
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
  await transporter.sendMail({
    from: `"coHealth " <${process.env.EMAIL_USER}>`,
    to: objAppointment.email, // Email người nhận
    subject: subject,
    html: htmlContent,
  });
};
