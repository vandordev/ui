"use client";

import { useState } from "react";

import { DateTimePicker } from "@/registry/new-york/date-time-picker";

export const DateTimePickerSecondsDemo = () => {
  const [date, setDate] = useState<Date | undefined>(
    new Date(2026, 9, 5, 14, 30, 15)
  );
  return (
    <DateTimePicker
      label="Backup window"
      value={date}
      onValueChange={setDate}
      precision="second"
      dateFormat="PPP HH:mm:ss"
    />
  );
};
