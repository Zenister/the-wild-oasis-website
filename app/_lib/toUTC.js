export function toUTC(date) {
  if (!date) return null;
  return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
}
