"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { Calendar } from "@/registry/new-york/calendar";

export const CalendarRangeDemo = () => {
  const [range, setRange] = useState<DateRange>();
  return (
    <Calendar
      mode="range"
      selected={range}
      onSelect={setRange}
      numberOfMonths={2}
    />
  );
};
