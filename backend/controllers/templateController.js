const News = require('./../models/news_schema.js');
const User = require('./../models/users_schema.js');
const Hospital = require('./../models/hospitals_schema.js');
const catchAsync = require('./../utils/catchAsync.js');
const CalculateHistory = require('./../models/calculateHistory_schema.js');
const Doctor = require('./../models/doctors_schema.js');
const Comment = require('./../models/commentsSchema.js');
const Exercise = require('./../models/exerciseSchema.js');
const logger = require('../utils/logger.js');

// const AdultCompendium = require('../models/adultCompendium_schema.js');

//////////////////////////// EXPORT TEMPLATES /////////////////////////////////

exports.getNewsTemplate = catchAsync(async (req, res, next) => {
  const allNews = await News.find().sort('-createdAt -updatedAt');
  res.status(200).render('news', {
    title: 'News',
    allNews,
  });
});

exports.getNewsItemTemplate = catchAsync(async (req, res, next) => {
  // console.log(req.news);
  res.status(200).render('newsItem', {
    title: 'News',
    news: req.news,
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
    .sort('-view -updatedAt -createdAt')
    .limit(6);

  const latestNews = await News.find().sort('-updatedAt -createdAt').limit(3);
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
  const exerciseMechanic = await Exercise.find().distinct('mechanic');
  const exerciseEquipment = await Exercise.find().distinct('equipment');
  const exercisePrimaryMuscles = await Exercise.find().distinct(
    'primaryMuscles'
  );
  const exerciseCategory = await Exercise.find().distinct('category');

  res.status(200).render('result', {
    title: 'Result',
    exercisePrimaryMuscles,
    exerciseMechanic,
    exerciseEquipment,
    exerciseCategory,
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
  if (req.user) {
    res.writeHead(302, 'Already Login! You will be redirect to homepage!', {
      location: '/',
    });
    return res.end();
  }
  res.status(200).render('forgotPassword', {
    title: 'Forgot Password',
  });
};

exports.getResetPasswordTemplate = (req, res) => {
  if (req.user) {
    res.writeHead(302, 'Already Login! You will be redirect to homepage!', {
      location: '/',
    });
    return res.end();
  }
  res.status(200).render('resetPassword', {
    title: 'Khôi phục mật khẩu',
  });
};

exports.getChangePasswordTemplate = (req, res, next) => {
  if (req.user) {
    res.status(200).render('changePassword', {
      title: 'Đổi mật khẩu',
    });
  } else {
    res.writeHead(
      302,
      'You are not signed in! You will be redirect to homepage!',
      {
        location: '/',
      }
    );
    return res.end();
  }
};

exports.getProfileTemplate = async (req, res) => {
  res.status(200).render('profile', {
    title: 'User Profile',
    userProfileTitle: 'Basic Info',
  });
};

exports.getHealthHistoryTemplate = catchAsync(async (req, res) => {
  const calculateHistory = await CalculateHistory.find({
    userID: req.user.id,
  }).sort('-updatedAt -createdAt');
  const symptomsHistory = req.symptomsHistory;
  const calculateDateRange = [];
  const symptomCheckDateRange = [];
  [symptomsHistory, calculateHistory].forEach((field, idx) => {
    field.forEach((history) => {
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
        if (idx == 0) {
          let found = false;
          for (let i = 0; i < symptomCheckDateRange.length; ++i) {
            const value = symptomCheckDateRange[i];
            if (
              value.start.format == startDateFormat &&
              value.end.format == endDateFormat
            ) {
              found = true;
              break;
            }
          }
          if (!found)
            symptomCheckDateRange.push({
              start: { format: startDateFormat, time: startDayWeek },
              end: { format: endDateFormat, time: endDayWeek },
            });
        } else if (idx == 1) {
          let found = false;
          for (let i = 0; i < calculateDateRange.length; ++i) {
            const value = calculateDateRange[i];
            if (
              value.start.format == startDateFormat &&
              value.end.format == endDateFormat
            ) {
              found = true;
              break;
            }
          }
          if (!found)
            calculateDateRange.push({
              start: { format: startDateFormat, time: startDayWeek },
              end: { format: endDateFormat, time: endDayWeek },
            });
        }
      }
    });
  });
  res.status(200).render('healthHistory', {
    title: 'Health History',
    calculateHistory: calculateHistory,
    userProfileTitle: 'Health History',
    calculateDateRange,
    symptomCheckDateRange,
    symptomsHistory,
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
  const slug = req.params.name;
  const doctor = await User.findOne({
    slug,
    role: 'doctor',
  }).populate({ path: 'doctorInfo' });
  if (!doctor) {
    res.writeHead(
      302,
      "Can't find any doctor with given slug! Please try again later!",
      {
        location: '/notFound',
      }
    );
    return res.end();
  }

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
    recommendDoctors: recommendDoctors.filter((doctor) => doctor.doctorInfo[0]),
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
    history: JSON.stringify(req.history),
  });
};

exports.getAdminTemplate = async (req, res) => {
  const doctorList = await User.find({ role: 'doctor' })
    .populate('doctorInfo')
    .lean();
  const userList = await User.find({ role: 'user' }).lean();
  const hospitalList = await Hospital.find({}).lean();
  const newsList = await News.find({}).lean();
  // console.log(newsList);
  res.status(200).render('admin', {
    title: 'Admin',
    doctorList,
    userList,
    hospitalList,
    newsList,
  });
};

exports.getNotFoundTemplate = (req, res) => {
  logger.error({
    ip: req.clientIp,
    method: req.method,
    message: 'Page not Found',
    url: req.originalUrl,
  });
  res.status(404).render('notFound', {
    title: 'Page Not Found',
  });
};
