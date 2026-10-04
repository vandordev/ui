import {
  addDays,
  endOfMonth,
  endOfWeek,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from "date-fns";
import type { DateRange } from "react-day-picker";

export type DateShortcut =
  | "last7Days"
  | "last14Days"
  | "last30Days"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth";

export function resolveDateShortcut(
  shortcut: DateShortcut,
  today: Date,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1
): { from: Date; to: Date } {
  const current = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const dayCounts = { last14Days: 14, last30Days: 30, last7Days: 7 } as const;
  if (
    shortcut === "last7Days" ||
    shortcut === "last14Days" ||
    shortcut === "last30Days"
  ) {
    const count = dayCounts[shortcut];
    return { from: subDays(current, count - 1), to: current };
  }

  const weekStart = startOfWeek(current, { weekStartsOn });
  const asCalendarDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());
  switch (shortcut) {
    case "thisWeek": {
      return {
        from: weekStart,
        to: asCalendarDay(endOfWeek(current, { weekStartsOn })),
      };
    }
    case "lastWeek": {
      const previous = subDays(weekStart, 1);
      return {
        from: startOfWeek(previous, { weekStartsOn }),
        to: asCalendarDay(endOfWeek(previous, { weekStartsOn })),
      };
    }
    case "thisMonth": {
      return {
        from: startOfMonth(current),
        to: asCalendarDay(endOfMonth(current)),
      };
    }
    case "lastMonth": {
      const previous = subMonths(current, 1);
      return {
        from: startOfMonth(previous),
        to: asCalendarDay(endOfMonth(previous)),
      };
    }
    default: {
      const exhaustive: never = shortcut;
      throw new Error(`Unsupported date shortcut: ${exhaustive}`);
    }
  }
}

export function toLocalDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isSelectableDateRange(
  range: DateRange | undefined,
  disabledDates: readonly Date[] = []
): boolean {
  if (
    !range?.from ||
    !range.to ||
    isAfter(startOfDay(range.from), startOfDay(range.to))
  ) {
    return false;
  }
  return !disabledDates.some(
    (date) =>
      (isSameDay(date, range.from as Date) ||
        isAfter(startOfDay(date), startOfDay(range.from as Date))) &&
      (isSameDay(date, range.to as Date) ||
        isBefore(startOfDay(date), startOfDay(range.to as Date)))
  );
}

export function isDateDisabled(
  date: Date,
  disabledDates: readonly Date[] = []
): boolean {
  return disabledDates.some((disabled) => isSameDay(date, disabled));
}

export function rangeIncludesDisabledDate(
  range: DateRange | undefined,
  disabledDates: readonly Date[] = []
): boolean {
  if (!range?.from || !range.to) {
    return false;
  }
  return disabledDates.some(
    (date) =>
      (isSameDay(date, range.from as Date) ||
        isAfter(date, range.from as Date)) &&
      (isSameDay(date, range.to as Date) || isBefore(date, range.to as Date))
  );
}

export { addDays };
