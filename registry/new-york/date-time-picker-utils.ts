import type { Locale } from "date-fns";

export type DateTimePrecision = "minute" | "second";

export interface TimeParts {
  hours: number;
  minutes: number;
  seconds: number;
}

const pad = (value: number) => String(value).padStart(2, "0");

const timePattern = /^(\d{2}):(\d{2})(?::(\d{2}))?$/;

/** Parses a canonical time value ("HH:mm" or "HH:mm:ss"); undefined if invalid. */
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

/** Formats a date's local time at the given precision. */
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

/** Time shown before the user picks one: start of day, or the last moment for an end. */
export const defaultTimeValue = (
  kind: "start" | "end",
  precision: DateTimePrecision
): string => {
  const base = kind === "start" ? "00:00" : "23:59";
  if (precision === "minute") {
    return base;
  }
  return kind === "start" ? `${base}:00` : `${base}:59`;
};

export interface DateTimeRangeDraft {
  start?: Date;
  end?: Date;
  startTimeInvalid: boolean;
  endTimeInvalid: boolean;
  orderInvalid: boolean;
}

/**
 * Resolves a range draft. A single clicked day is a same-day range, so a time window
 * inside one day needs no second click. `orderInvalid` means both ends exist but the end
 * is before the start.
 */
export const resolveDateTimeRangeDraft = (
  days: { from?: Date; to?: Date } | undefined,
  startTime: string,
  endTime: string,
  precision: DateTimePrecision
): DateTimeRangeDraft => {
  const startParts = parseTimeValue(startTime);
  const endParts = parseTimeValue(endTime);
  const lastDay = days?.to ?? days?.from;
  const start =
    days?.from && startParts
      ? mergeDateAndTime(days.from, startParts, precision)
      : undefined;
  const end =
    lastDay && endParts
      ? mergeDateAndTime(lastDay, endParts, precision)
      : undefined;
  return {
    end,
    endTimeInvalid: endParts === undefined,
    orderInvalid: Boolean(start && end && !isDateTimeRangeValid(start, end)),
    start,
    startTimeInvalid: startParts === undefined,
  };
};

export type HourCycle = 12 | 24;

/**
 * An explicit cycle wins. Otherwise follow the locale's short time pattern: a day-period
 * token (a, b, B) means 12-hour. Without a locale this is 12-hour, like date-fns' default.
 */
export const resolveHourCycle = (
  locale?: Locale,
  explicit?: HourCycle
): HourCycle => {
  if (explicit) {
    return explicit;
  }
  const pattern = locale?.formatLong?.time({ width: "short" });
  return pattern && !/[abB]/.test(pattern) ? 24 : 12;
};

export const to12Hour = (hours: number): { hour: number; pm: boolean } => ({
  hour: hours % 12 || 12,
  pm: hours >= 12,
});

export const from12Hour = (hour: number, pm: boolean): number =>
  (hour % 12) + (pm ? 12 : 0);

export type TimePart = keyof TimeParts;

/** Returns the canonical "HH:mm[:ss]" value with one part replaced. */
export const withTimePart = (
  value: string,
  part: TimePart,
  next: number,
  precision: DateTimePrecision
): string => {
  const parts = {
    hours: 0,
    minutes: 0,
    seconds: 0,
    ...parseTimeValue(value),
    [part]: next,
  };
  const base = `${pad(parts.hours)}:${pad(parts.minutes)}`;
  return precision === "second" ? `${base}:${pad(parts.seconds)}` : base;
};
