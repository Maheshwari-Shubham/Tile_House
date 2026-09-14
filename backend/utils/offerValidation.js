function getTodayStartOfDay() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function isOfferDateValid(validUntil) {
  if (!validUntil || validUntil === '') return true;

  const date = new Date(validUntil);
  if (Number.isNaN(date.getTime())) return false;

  return date >= getTodayStartOfDay();
}

module.exports = { isOfferDateValid, getTodayStartOfDay };
