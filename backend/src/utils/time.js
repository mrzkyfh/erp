import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { env } from "../config/env.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export function nowJakarta() {
  return dayjs().tz(env.APP_TIMEZONE);
}

export function todayDate() {
  return nowJakarta().format("YYYY-MM-DD");
}

export function monthRange(month, year) {
  const start = dayjs.tz(`${year}-${String(month).padStart(2, "0")}-01 00:00`, env.APP_TIMEZONE);
  return {
    start: start.toISOString(),
    end: start.endOf("month").toISOString(),
  };
}

export function isLate(checkInAt, workStartTime = "08:00:00", toleranceMinutes = 15) {
  const day = dayjs(checkInAt).tz(env.APP_TIMEZONE).format("YYYY-MM-DD");
  const deadline = dayjs.tz(`${day} ${workStartTime}`, env.APP_TIMEZONE).add(toleranceMinutes, "minute");
  return dayjs(checkInAt).tz(env.APP_TIMEZONE).isAfter(deadline);
}

