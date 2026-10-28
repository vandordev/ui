"use client";
import { DateTime } from "@/registry/new-york/date-time";
export const DateTimeFormatsDemo = () => (
  <div className="grid gap-2">
    <DateTime value="2026-10-24T08:00:00Z" format={{ dateStyle: "long" }} />
    <DateTime
      value="2026-10-24T08:00:00Z"
      format={{ hour: "numeric", minute: "2-digit" }}
      timeZone="UTC"
    />
  </div>
);
