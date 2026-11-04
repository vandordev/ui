export type DateTimePrecision = "minute" | "second";

export interface TimeParts {
  hours: number;
  minutes: number;
  seconds: number;
}

export const defaultStartTime = "00:00";
export const defaultEndTime = "23:59";

const pad = (value: number) => String(value).padStart(2, "0");

const timePattern = /^(\d{2}):(\d{2})(?::(\d{2}))?$/;

/** Parses a native time input value ("HH:mm" or "HH:mm:ss"); undefined if invalid. */
export const parseTimeValue = (value: string): TimeParts | undefined => {
  const match = timePattern.exec(value);
  if (!match) {
    return undefined;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] ?? 0);
  if (hours > 23 || minutes > 59 || seconds > 59) {
    return undefined;
  }
  return { hours, minutes, seconds };
};

/** Formats a date's local time for a native time input at the given precision. */
export const formatTimeValue = (
  date: Date,
  precision: DateTimePrecision
): string => {
  const base = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  return precision === "second" ? `${base}:${pad(date.getSeconds())}` : base;
};

/** Drops the parts a precision does not expose: milliseconds always, seconds for minutes. */
export const normalizeDateTime = (
  date: Date,
  precision: DateTimePrecision
): Date =>
  new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    precision === "second" ? date.getSeconds() : 0,
    0
  );

/**
 * Combines a calendar day with a local time.
 * shortcut: a time skipped by a DST gap resolves to the next valid local time, as
 * `new Date(y, m, d, h, min)` does; upgrade when a timeZone prop is added.
 */
export const mergeDateAndTime = (
  day: Date,
  time: TimeParts,
  precision: DateTimePrecision
): Date =>
  normalizeDateTime(
    new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      time.hours,
      time.minutes,
      time.seconds,
      0
    ),
    precision
  );

/** A range is committable when both ends exist and `from` is not after `to`. */
export const isDateTimeRangeValid = (
  from: Date | undefined,
  to: Date | undefined
): boolean =>
  from !== undefined && to !== undefined && from.getTime() <= to.getTime();
