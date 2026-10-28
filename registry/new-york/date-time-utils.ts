export type DateInput = string | number | Date | null | undefined;

export interface DateFormatOptions {
  locale?: string | string[];
  timeZone?: string;
  format?: Intl.DateTimeFormatOptions;
  fallback?: string;
}

const instantPattern =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|[+-]\d{2}:\d{2})$/;
const isLeapYear = (year: number) =>
  year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

const isCalendarDate = (year: number, month: number, day: number) => {
  const days = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  return month >= 1 && month <= 12 && day >= 1 && day <= (days[month - 1] ?? 0);
};

export const toDate = (value: DateInput): Date | null => {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? new Date(value) : null;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) && Number.isFinite(new Date(value).getTime())
      ? new Date(value)
      : null;
  }
  if (typeof value !== "string") {
    return null;
  }
  const match = instantPattern.exec(value);
  if (!match) {
    return null;
  }
  const [
    ,
    yearText,
    monthText,
    dayText,
    hourText,
    minuteText,
    secondText,
    fraction = "",
    zone = "Z",
  ] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  if (
    !isCalendarDate(year, month, day) ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    return null;
  }
  let offsetMinutes = 0;
  if (zone !== "Z") {
    const sign = zone[0] === "+" ? 1 : -1;
    const offsetHour = Number(zone.slice(1, 3));
    const offsetMinute = Number(zone.slice(4, 6));
    if (offsetHour > 23 || offsetMinute > 59) {
      return null;
    }
    offsetMinutes = sign * (offsetHour * 60 + offsetMinute);
  }
  const milliseconds = Number(`${fraction}000`.slice(0, 3));
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hour, minute - offsetMinutes, second, milliseconds);
  return Number.isFinite(date.getTime()) ? date : null;
};

export const formatDate = (
  value: DateInput,
  options: DateFormatOptions = {}
): string => {
  const date = toDate(value);
  if (!date) {
    return options.fallback ?? "—";
  }
  const format = options.format ?? {};
  const timeZone = options.timeZone ?? format.timeZone;
  const intlOptions: Intl.DateTimeFormatOptions = options.format
    ? { ...format, ...(timeZone === undefined ? {} : { timeZone }) }
    : {
        day: "numeric",
        hour: "2-digit",
        hourCycle: "h23",
        minute: "2-digit",
        month: "short",
        year: "numeric",
        ...format,
        ...(timeZone === undefined ? {} : { timeZone }),
      };
  return new Intl.DateTimeFormat(options.locale ?? "en-US", intlOptions).format(
    date
  );
};
