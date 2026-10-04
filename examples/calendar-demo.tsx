"use client";

import { useState } from "react";

import { Calendar } from "@/registry/new-york/calendar";

export const CalendarDemo = () => {
  const [date, setDate] = useState<Date>();
  return <Calendar mode="single" selected={date} onSelect={setDate} />;
};
