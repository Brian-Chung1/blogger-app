const dateFormatter = (date) => {
  //Year Month Date
  const ymd = date.substring(0, 10).split('-');
  const month = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ][(ymd[1] % 12) - 1 || 0];
  return `${month} ${Number(ymd[2])} ${ymd[0]}`;
};

const randomColor = () => {
  let hex = Math.floor(Math.random() * 0xffffff);
  let color = '#' + hex.toString(16);
  return color;
};

const usernameColor = (str, s, l) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let h = hash % 360;
  return 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
};

const getToken = () => {
  const currentUser = window.localStorage.getItem('blogAppUser');
  if (currentUser) {
    const { accessToken } = JSON.parse(currentUser);
    return accessToken;
  } else {
    return null;
  }
};

export { dateFormatter, randomColor, usernameColor, getToken };
