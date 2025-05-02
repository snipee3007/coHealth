const Hospitals = require('./../models/hospitals_schema');

exports.getAllNearestHospitals = async (req, res) => {
  try {
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
    res.status(200).json({
      message: 'success',
      data,
    });
  } catch (err) {
    console.error(err);
  }
};

exports.getAllHospitals = async (req, res) => {
  try {
    const data = await Hospitals.find();
    res.status(200).json({
      message: 'success',
      data,
    });
  } catch (err) {
    console.error(err);
  }
};
