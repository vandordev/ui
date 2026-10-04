"use client";

import { cn } from "cn";
import { format } from "date-fns";
import type { Locale } from "date-fns";
import { CalendarDays } from "lucide-react";
import * as React from "react";
import type { Matcher } from "react-day-picker";

import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface CalendarOptions {
  disabledDates?: Matcher | Matcher[];
  startMonth?: Date;
  endMonth?: Date;
}

export type DatePickerProps = CalendarOptions & {
  id?: string;
  label: string;
  placeholder?: string;
  clearable?: boolean;
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (date: Date | undefined) => void;
  locale?: Locale;
  dateFormat?: string;
  disabled?: boolean;
  readOnly?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

export const DatePicker = (props: DatePickerProps) => {
  const {
    id,
    label,
    placeholder = "Select a date",
    clearable = false,
    value,
    defaultValue,
    onValueChange,
    locale,
    dateFormat = "PPP",
    disabled,
    readOnly,
    open,
    defaultOpen = false,
    onOpenChange,
    className,
    ...calendarOptions
  } = props;
  const controlled = Object.hasOwn(props, "value");
  const [internal, setInternal] = React.useState(defaultValue);
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const current = controlled ? value : internal;
  const isOpen = open === undefined ? internalOpen : open;
  const setOpen = (next: boolean) => {
    if (open === undefined) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };
  const selectDate = (date?: Date) => {
    if (!controlled) {
      setInternal(date);
    }
    onValueChange?.(date);
  };

  return (
    <div data-slot="date-picker" className="grid min-w-0 gap-1.5">
      <span id={id ? `${id}-label` : undefined} className="text-sm font-medium">
        {label}
      </span>
      <Popover open={isOpen} onOpenChange={setOpen}>
        <PopoverTrigger
          disabled={disabled}
          aria-labelledby={id ? `${id}-label` : undefined}
          aria-label={id ? undefined : label}
          className={cn(
            "inline-flex h-9 min-w-0 items-center justify-start gap-2 rounded-md border border-input bg-background px-3 text-sm font-normal shadow-xs outline-none hover:bg-accent focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30",
            className
          )}
        >
          <CalendarDays aria-hidden="true" className="size-4 shrink-0" />
          <span className={cn("truncate", !current && "text-muted-foreground")}>
            {current ? format(current, dateFormat, { locale }) : placeholder}
          </span>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-auto max-w-[calc(100vw-1rem)] p-2"
        >
          <Calendar
            mode="single"
            locale={locale}
            selected={current}
            disabled={readOnly ? () => true : calendarOptions.disabledDates}
            startMonth={calendarOptions.startMonth}
            endMonth={calendarOptions.endMonth}
            onSelect={(date) => {
              selectDate(date);
              setOpen(false);
            }}
          />
          {clearable && current && !readOnly ? (
            <Button
              type="button"
              variant="ghost"
              className="mt-1 w-full"
              onClick={() => {
                selectDate();
                setOpen(false);
              }}
            >
              Clear date
            </Button>
          ) : null}
        </PopoverContent>
      </Popover>
    </div>
  );
};
