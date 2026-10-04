"use client";

import { useState } from "react";

import { DatePicker } from "@/registry/new-york/date-picker";

export function DatePickerDemo() {
  const [date, setDate] = useState<Date>();
  return (
    <DatePicker
      label="Appointment date"
      value={date}
      onValueChange={setDate}
      clearable
    />
  );
}
