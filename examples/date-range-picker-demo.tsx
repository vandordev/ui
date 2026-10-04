"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { DateRangePicker } from "@/registry/new-york/date-range-picker";

export function DateRangePickerDemo() {
  const [range, setRange] = useState<DateRange>();
  return (
    <DateRangePicker
      label="Reporting period"
      value={range}
      onValueChange={setRange}
      features={["twoMonths", "shortcuts"]}
      clearable
    />
  );
}
