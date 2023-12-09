const foods = require('./../models/food_schema');

exports.getRandomBreakfast = async (req, res) => {
  const breakfast = await foods.findOne({ meal: 'breakfast' });
  const randomIndex = Math.trunc(Math.random() * breakfast.items.length);
  res.status(200).json({
    status: 'success',
    data: breakfast.items[randomIndex],
  });
};
exports.getRandomLunch = async (req, res) => {
  const lunch = foods.find({ meal: 'lunch' });
  const randomIndex = Math.trunc(Math.random() * lunch.items.length);
  res.status(200).json({
    status: 'success',
    data: lunch.items[randomIndex],
  });
};
exports.getRandomTea = async (req, res) => {
  const tea = foods.find({ meal: 'tea' });
  const randomIndex = Math.trunc(Math.random() * tea.items.length);
  res.status(200).json({
    status: 'success',
    data: tea.items[randomIndex],
  });
};
exports.getRandomDinner = async (req, res) => {
  const dinner = foods.find({ meal: 'dinner' });
  const randomIndex = Math.trunc(Math.random() * dinner.items.length);
  res.status(200).json({
    status: 'success',
    data: dinner.items[randomIndex],
  });
};
