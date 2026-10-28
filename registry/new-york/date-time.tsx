"use client";

import { useSyncExternalStore } from "react";
import type { ComponentPropsWithoutRef, Ref } from "react";

import { formatDate, toDate } from "./date-time-utils";
import type { DateFormatOptions, DateInput } from "./date-time-utils";

export type DateTimeProps = Omit<
  ComponentPropsWithoutRef<"time">,
  "children" | "dateTime"
> & {
  value: DateInput;
  locale?: DateFormatOptions["locale"];
  timeZone?: string;
  format?: Intl.DateTimeFormatOptions;
  fallback?: string;
  ref?: Ref<HTMLTimeElement>;
};

const subscribe = () => () => {
  // No external clock: updates come from props.
};
const getServerSnapshot = () => "";

export const DateTime = ({
  value,
  locale,
  timeZone,
  format,
  fallback = "—",
  ref,
  ...props
}: DateTimeProps) => {
  const instant = toDate(value);
  const iso = instant?.toISOString();
  const text = useSyncExternalStore(
    subscribe,
    () => formatDate(value, { fallback, format, locale, timeZone }),
    getServerSnapshot
  );
  return (
    <time {...props} ref={ref} data-slot="date-time" dateTime={iso}>
      {text || fallback}
    </time>
  );
};
