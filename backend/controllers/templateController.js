const News = require('./../models/news_schema.js');
const User = require('./../models/users_schema.js');
const Hospital = require('./../models/hospitals_schema.js');
const catchAsync = require('./../utils/catchAsync.js');
const CalculateHistory = require('./../models/calculateHistory_schema.js');
const Doctor = require('./../models/doctors_schema.js');
<<<<<<< HEAD
const Comment = require('./../models/commentsSchema.js');
// const AdultCompendium = require('../models/adultCompendium_schema.js');

=======
const AdultCompendium = require('../models/adultCompendium_schema.js');
const dotenv = require('dotenv');
dotenv.config();
>>>>>>> 49b60972610ee456f30705b3cf966d026b0df4c0
//////////////////////////// EXPORT TEMPLATES /////////////////////////////////

exports.getNewsTemplate = catchAsync(async (req, res, next) => {
  const allNews = await News.find().sort('-createdAt -updatedAt');
  res.status(200).render('news', {
    title: 'News',
    allNews,
  });
});

exports.getNewsItemTemplate = catchAsync(async (req, res, next) => {
  const recommendNews = await News.find().sort('-view').limit(3);

  res.status(200).render('newsItem', {
    title: 'News',
    news: req.news,
    recommendNews,
    comments: req.comments,
    user: req.user,
  });
});

exports.getUploadTemplate = catchAsync(async (req, res, next) => {
  const categories = await News.find({}).distinct('category');
  res.status(200).render('upload', {
    title: 'Upload',
    categories,
  });
});

exports.getHomePageTemplate = catchAsync(async (req, res, next) => {
  const mostViewNews = await News.find()
    .sort('-view')
    .sort('createDate')
    .limit(6);

  const latestNews = await News.find().sort('createDate').limit(3);
  res.status(200).render('homepage', {
    title: 'Welcome',
    mostViewNews,
    latestNews,
  });
});

exports.getAboutUsTemplate = catchAsync(async (req, res, next) => {
  res.status(200).render('aboutUs', {
    title: 'About Us',
  });
});

exports.getCalculateTemplate = async (req, res) => {
  res.status(200).render('calculate', {
    title: 'Calculate BMI/TDEE',
  });
};

exports.getResultBMITemplate = async (req, res) => {
  res.status(200).render('result', {
    title: 'Result',
  });
};

exports.getHospitalTemplate = async (req, res) => {
  const hospitals = await Hospital.find();
  res.status(200).render('hospital', {
    title: 'Hospital',
    hospitals,
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
  });
};

exports.getsignUpTemplate = async (req, res) => {
  res.status(200).render('signUp', {
    title: 'Sign Up',
  });
};

exports.getsignInTemplate = async (req, res) => {
  res.status(200).render('signIn', {
    title: 'Sign In',
  });
};

exports.getForgotPasswordTemplate = async (req, res) => {
  res.status(200).render('forgotPassword', {
    title: 'Forgot Password',
  });
};

exports.getProfileTemplate = async (req, res) => {
  res.status(200).render('profile', {
    title: 'User Profile',
    userProfileTitle: 'Basic Info',
  });
};

exports.getHealthHistoryTemplate = catchAsync(async (req, res) => {
  const calculateHistory = await CalculateHistory.find({}).sort(
    '-updatedAt -createdAt'
  );
  const calculateDateRange = [];

  calculateHistory.forEach((history) => {
    const takenDate = new Date(history.updatedAt);
    let diff = (takenDate.getDay() == 0 ? 7 : takenDate.getDay()) - 1;
    const startDayWeek = new Date(
      takenDate.getTime() - 1000 * 60 * 60 * 24 * diff
    );
    const endDayWeek = new Date(
      startDayWeek.getTime() + 1000 * 60 * 60 * 24 * 6
    );
    let existedRange = false;
    for (let i = 0; i < calculateDateRange.length; ++i) {
      const range = calculateDateRange[i];
      if (
        range.start.time.getTime() == startDayWeek.getTime() &&
        range.end.time.getTime() == endDayWeek.getTime()
      ) {
        existedRange = true;
        break;
      }
    }
    if (!existedRange) {
      const startDateFormat = `${startDayWeek
        .getDate()
        .toString()
        .padStart(2, 0)}-${(startDayWeek.getMonth() + 1)
        .toString()
        .padStart(2, 0)}-${startDayWeek.getFullYear()}`;
      const endDateFormat = `${endDayWeek
        .getDate()
        .toString()
        .padStart(2, 0)}-${(endDayWeek.getMonth() + 1)
        .toString()
        .padStart(2, 0)}-${endDayWeek.getFullYear()}`;
      calculateDateRange.push({
        start: { format: startDateFormat, time: startDayWeek },
        end: { format: endDateFormat, time: endDayWeek },
      });
    }
  });
  res.status(200).render('healthHistory', {
    title: 'Health History',
    calculateHistory: calculateHistory,
    userProfileTitle: 'Health History',
    calculateDateRange: calculateDateRange,
  });
});

exports.getDoctorsTemplate = catchAsync(async (req, res, next) => {
  const doctors = await User.find({
    role: 'doctor',
  }).populate({ path: 'doctorInfo' });

  res.status(200).render('doctors', {
    title: 'doctors',
    doctors,
  });
});

exports.getDoctorItemTemplate = catchAsync(async (req, res, next) => {
  const doctor = await User.findOne({
    slug: req.originalUrl.split('/')[2],
    role: 'doctor',
  }).populate({ path: 'doctorInfo' });
  const recommendDoctors = await User.find({
    role: 'doctor',
    _id: { $ne: doctor._id },
  }).populate({
    path: 'doctorInfo',
    match: { major: { $eq: doctor.doctorInfo[0].major } },
  });

  res.status(200).render('doctorItem', {
    title: 'Doctors',
    doctor,
    recommendDoctors,
  });
});

exports.getListOfChatTemplate = async (req, res) => {
  res.status(200).render('listOfChat', {
    title: 'List of Chat',
    rooms: req.room,
  });
};

exports.getAppointmentTemplate = async (req, res) => {
  const doctorMajors = await Doctor.find({}).distinct('major');
  res.status(200).render('appointment', {
    title: 'Appointment',
    majors: doctorMajors,
  });
};

exports.getListAppointmentTemplate = async (req, res) => {
  res.status(200).render('listAppointment', {
    title: 'List Appointment',
    appointments: req.appointments,
    totalPages: req.totalPages,
    userProfileTitle: 'List of Appointment',
  });
};

exports.getAppointmentDetailsTemplate = async (req, res) => {
  res.status(200).render('appointmentDetails', {
    title: 'Appointment Details',
    appointment: req.appointment,
    userProfileTitle: 'Appointment Details',
  });
};

exports.getSymptomCheckerTemplate = async (req, res) => {
  res.status(200).render('symptomChecker', {
    title: 'Symptom Checker',
  });
};
