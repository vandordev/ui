"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { DateTimeRangePicker } from "@/registry/new-york/date-time-range-picker";

export const DateTimeRangePickerDemo = () => {
  const [range, setRange] = useState<DateRange>();
  return (
    <DateTimeRangePicker
      label="Maintenance window"
      value={range}
      onValueChange={setRange}
      clearable
    />
  );
};
