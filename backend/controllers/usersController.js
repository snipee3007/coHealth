const User = require('./../models/users_schema');

exports.getUserByToken = async (req) => {
  const data = req.rawHeaders.filter((str) => str.includes('jwt'))[0];
  const token = data
    .split(';')
    .filter((str) => str.includes('jwt'))[0]
    .replace('jwt=', '');
  const user = await User.find({
    token: `${token}`,
  });
  return user[0];
};
