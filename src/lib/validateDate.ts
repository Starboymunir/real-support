import { getCurrentTime } from "./utils";
import { isBookingTimeValid } from "./validators/booking-detail-validator";

export const validateDateForSavedData = (date: Date) => {
  const currentDate = new Date();
  date.setHours(23, 59, 59, 999);
  if (date >= currentDate) {
    return date;
  } else {
    return currentDate;
  }
};

export const validateTimeForSavedData = (time: string, date: Date) => {
  const checkBookingTime = isBookingTimeValid(time, date);
  if (checkBookingTime) {
    return time;
  } else {
    return getCurrentTime();
  }
};


