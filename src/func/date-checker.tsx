import { dateChanger } from '@/data/firebase';

export function todayChecker(date: string) {
  if (!String(date).includes('-')) {
    date = dateChanger(date);
  }
  let today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  const todayDate = year + '-' + month + '-' + day;
  if (date.split(' ')[0] == todayDate) {
    return date.split(' ')[1].slice(0, 5);
  } else if (parseInt(date.split(' ')[0].split('-')[2]) + 1 == parseInt(day)) {
    return '1일 전';
  } else if (parseInt(date.split(' ')[0].split('-')[2]) + 2 == parseInt(day)) {
    return '2일 전';
  } else if (parseInt(date.split(' ')[0].split('-')[2]) + 3 == parseInt(day)) {
    return '3일 전';
  } else {
    if (parseInt(date.split(' ')[0].split('-')[0]) == year) {
      let exceptYear = date.split(' ')[0].split('-');
      return exceptYear[1] + '.' + exceptYear[2];
    } else {
      return date.split(' ')[0].split('-').join('.');
    }
  }
}
