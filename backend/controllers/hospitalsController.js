const AppError = require('../utils/appError.js');
const catchAsync = require('../utils/catchAsync.js');
const returnData = require('../utils/returnData.js');
const Hospitals = require('./../models/hospitals_schema.js');

exports.getAllNearestHospitals = catchAsync(async (req, res, next) => {
  // dùng dấu ? thì xài query -> dùng cái / là params
  const lat = req.query.lat;
  const long = req.query.long;
  // console.log('kiểu dữ liệu của lat là', lat);
  // console.log('kiểu dữ liệu của long là', long);

  // phải lưu theo long, lat thì mới xài được cái dưới
  // lọc theo geoWithin -> centerSphere là cái vòng tròn
  // tính theo miles -> 5km ~~ 3.1 miles

  // const data = await Hospitals.find({
  //   coordinates: {
  //     $geoWithin: {
  //       $centerSphere: [
  //         [parseFloat(long), parseFloat(lat)],
  //         3.10685596 / 3963.2,
  //       ], // Chuyển đổi mét sang radians
  //     },
  //   },
  // });
  const data = await Hospitals.find({
    coordinates: {
      $nearSphere: [parseFloat(long), parseFloat(lat)],
      $minDistance: 0, //radians
      $maxDistance: 3.10685596 / 3963.2,
    },
  });
  returnData(req, res, 200, data);
});

exports.getAllHospitals = catchAsync(async (req, res, next) => {
  const data = await Hospitals.find();
  returnData(req, res, 200, data);
});

exports.deleteHospital = catchAsync(async (req, res, next) => {
  const hospital = await Hospitals.findById(req.params.id);
  if (hospital) {
    await Hospitals.findByIdAndDelete(req.params.id);
    returnData(
      req,
      res,
      204,
      { name: hospital.name, userID: req.user.id },
      'Delete Hospital Successful'
    );
  } else
    return next(
      new AppError(
        'Can not find hospital with provided id! Please try different id!',
        400
      )
    );
});

exports.createHospital = catchAsync(async (req, res, next) => {
  const body = req.body;
  const hospitalIdx = await Hospitals.find({}).distinct('id');
  let idx;
  for (let i = 1; i <= hospitalIdx.length; ++i) {
    if (!hospitalIdx.includes(i)) {
      idx = i;
      break;
    }
  }
  if (!idx) idx = hospitalIdx.length + 1;
  body.id = idx;
  console.log(body);
  await Hospitals.create(body);
  returnData(req, res, 200, body);
});
