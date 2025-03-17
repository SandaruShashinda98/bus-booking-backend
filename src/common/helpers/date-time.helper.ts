//The following function extracts the number of hours minutes and seconds from a subtracted or added date object
export function getHoursMinutesAndSeconds(timeInMilliSeconds: number): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const totalSeconds = timeInMilliSeconds;
  const hours = Math.floor(totalSeconds / (1000 * 60 * 60)) % 24;
  const minutes = Math.floor(totalSeconds / (1000 * 60)) % 60;
  const seconds = Math.floor(totalSeconds / 1000) % 60;

  return { hours, minutes, seconds };
}

//The following function adds 0 padding to time measurement values
export function addTimePadding(time: number): string {
  return time < 10 ? '0' + time : time.toString();
}

//Following function formats time in hh:mm:ss form
export function getFormattedTime(time: number): string {
  const { hours, minutes, seconds } = getHoursMinutesAndSeconds(time);
  return [hours, minutes, seconds].map(addTimePadding).join(':');
}
