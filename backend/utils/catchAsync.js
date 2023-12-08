exports.catchAsync = async (func) => {
  try {
    await func;
  } catch (err) {
    console.error('Can not using async await function with: ', err);
  }
};
