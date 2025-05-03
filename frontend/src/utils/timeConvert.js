const convertFunction = function (time) {
  let str = '';
  const date = new Date(time);
  const now = new Date(Date.now());
  const diff = now - date;
  const inSecs = 1000;
  const inMins = 1000 * 60;
  const inHrs = 1000 * 60 * 60;
  const inDays = 1000 * 60 * 60 * 24;
  const inWeeks = 1000 * 60 * 60 * 24 * 7;
  const inMonths = 1000 * 60 * 60 * 24 * 30;
  const inYears = 1000 * 60 * 60 * 24 * 30 * 12;
  if (Math.floor(diff / inYears) !== 0) {
    str = `${Math.floor(diff / inYears)} year(s) ago`;
  } else if (Math.floor(diff / inMonths) !== 0) {
    str = `${Math.floor(diff / inMonths)} month(s) ago`;
  } else if (Math.floor(diff / inWeeks) !== 0) {
    str = `${Math.floor(diff / inWeeks)} week(s) ago`;
  } else if (Math.floor(diff / inDays) !== 0) {
    str = `${Math.floor(diff / inDays)} day(s) ago`;
  } else if (Math.floor(diff / inHrs) !== 0) {
    str = `${Math.floor(diff / inHrs)} hour(s) ago`;
  } else if (Math.floor(diff / inMins) !== 0) {
    str = `${Math.floor(diff / inMins)} minute(s) ago`;
  } else if (Math.floor(diff / inSecs) !== 0) {
    str = `${Math.floor(diff / inSecs)} second(s) ago`;
  }
  return str;
};

const timeConvertFullPath = function (time) {
  let str = convertFunction(time);
  const date = new Date(time);
  str += ` ・ ${date.getDate().toString().padStart(2, '0')}/${(
    date.getMonth() + 1
  )
    .toString()
    .padStart(2, '0')}/${date.getFullYear()}`;
  return str;
};

const timeConvertShort = function (time) {
  return convertFunction(time);
};

export { timeConvertFullPath, timeConvertShort };
