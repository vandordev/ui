"use client";

import { useState } from "react";
import { id } from "react-day-picker/locale";

import { Calendar } from "@/registry/new-york/calendar";

export const CalendarDropdownDemo = () => {
  const [date, setDate] = useState<Date>();
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      captionLayout="dropdown"
      locale={id}
      weekStartsOn={1}
      startMonth={new Date(2025, 0)}
      endMonth={new Date(2027, 11)}
      disabled={{ dayOfWeek: [0, 6] }}
    />
  );
};
