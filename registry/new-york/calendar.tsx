"use client";

import { cn } from "cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import type { ClassNames, DayPickerProps } from "react-day-picker";

const calendarClassNames: Partial<ClassNames> = {
  button_next:
    "inline-flex size-8 items-center justify-center rounded-md border border-input bg-background p-0 text-foreground hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
  button_previous:
    "inline-flex size-8 items-center justify-center rounded-md border border-input bg-background p-0 text-foreground hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
  caption_label: "text-sm font-medium",
  day: "relative size-9 p-0 text-center text-sm",
  day_button:
    "inline-flex size-9 items-center justify-center rounded-md p-0 font-normal text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:z-10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-selected:bg-primary aria-selected:text-primary-foreground",
  disabled: "text-muted-foreground opacity-40",
  month: "flex w-full flex-col gap-4",
  month_caption: "relative flex h-9 items-center justify-center",
  month_grid: "w-full border-collapse",
  months: "relative flex flex-col gap-4 sm:flex-row",
  nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between",
  outside: "text-muted-foreground opacity-40",
  root: "group/calendar w-fit",
  selected: "bg-primary text-primary-foreground",
  today: "bg-accent text-accent-foreground",
  week: "mt-2 flex w-full",
  weekday: "flex-1 text-center text-[0.8rem] font-normal text-muted-foreground",
  weekdays: "flex",
};

export const Calendar = ({
  className,
  classNames,
  components,
  showOutsideDays = true,
  ...props
}: DayPickerProps) => (
  <DayPicker
    showOutsideDays={showOutsideDays}
    className={cn("bg-background p-2", className)}
    classNames={{ ...calendarClassNames, ...classNames }}
    components={{
      Chevron: ({ orientation, ...chevronProps }) =>
        orientation === "left" ? (
          <ChevronLeft aria-hidden="true" {...chevronProps} />
        ) : (
          <ChevronRight aria-hidden="true" {...chevronProps} />
        ),
      ...components,
    }}
    {...props}
  />
);
