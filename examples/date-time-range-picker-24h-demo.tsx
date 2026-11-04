"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { DateTimeRangePicker } from "@/registry/new-york/date-time-range-picker";

export const DateTimeRangePicker24hDemo = () => {
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(2026, 9, 5, 9, 0),
    to: new Date(2026, 9, 5, 17, 30),
  });
  return (
    <DateTimeRangePicker
      label="Opening hours"
      value={range}
      onValueChange={setRange}
      dateFormat="PPP HH:mm"
    />
  );
};
