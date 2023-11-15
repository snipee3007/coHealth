const hospitals = require('./../models/hospitals_schema');

exports.getAllHospitals = async (req, res) => {
  try {
    const data = await hospitals.find();
    res.status(200).json({
      loc: data,
    });
  } catch (err) {
    console.error(err);
  }
};
