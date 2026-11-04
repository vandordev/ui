"use client";

import { useState } from "react";

import { DateTimePicker } from "@/registry/new-york/date-time-picker";

export const DateTimePickerDemo = () => {
  const [date, setDate] = useState<Date>();
  return (
    <DateTimePicker
      label="Starts at"
      value={date}
      onValueChange={setDate}
      clearable
    />
  );
};
