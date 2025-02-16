const hospitals = require('./../models/hospitals_schema');

exports.getAllHospitals = async (req, res) => {
  try {
    // chua sort
    const data = await hospitals.find().limit(6);
    res.status(200).json({
      status: 200,
      length: data.length,
      loc: data,
    });
  } catch (err) {
    console.error(err);
  }
};
