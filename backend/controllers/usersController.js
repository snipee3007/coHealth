const User = require('./../models/users_schema');

exports.getUserByToken = async (req) => {
  const data = req.rawHeaders.find((str) => str.includes('jwt'));

  if (!data) {
    // console.error('No JWT header found');
    return null; // Consider returning null or some other appropriate value in case of error
  }

  const token = data
    .split(';')
    .filter((str) => str.includes('jwt'))[0]
    .replace('jwt=', '')
    .trim();
  if (!token) {
    // console.error('No JWT present in the header');
    return null; // Consider returning null or some other appropriate value in case of error
  }

  const user = await User.findOne({
    token: token.replace('jwt=', '').trim(),
  });

  return user;
};
