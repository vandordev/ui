"use client";

import { cn } from "cn";
import { format } from "date-fns";
import type { Locale } from "date-fns";
import { CalendarDays } from "lucide-react";
import * as React from "react";
import type { Matcher } from "react-day-picker";

import { Button } from "./button";
import { Calendar } from "./calendar";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";

// Composes shadcn's Date Picker pattern with Vandor's Button, Popover and Calendar.

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
  motion?: boolean;
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
    motion = true,
    ...calendarOptions
  } = props;
  const controlled = Object.hasOwn(props, "value");
  const generatedId = React.useId();
  const triggerId = id ?? generatedId;
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
      <label
        htmlFor={triggerId}
        id={`${triggerId}-label`}
        className="text-sm font-medium"
      >
        {label}
      </label>
      <Popover open={isOpen} onOpenChange={setOpen}>
        <PopoverTrigger
          id={triggerId}
          disabled={disabled}
          aria-labelledby={`${triggerId}-label ${triggerId}-value`}
          render={
            <Button
              variant="outline"
              whileTap={motion ? { scale: 0.96 } : false}
            />
          }
          className={cn(
            "inline-flex h-9 min-w-0 items-center justify-start gap-2 rounded-md border border-input bg-background px-3 text-sm font-normal shadow-xs outline-none hover:bg-accent focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30",
            className
          )}
        >
          <CalendarDays aria-hidden="true" className="size-4 shrink-0" />
          <span
            id={`${triggerId}-value`}
            className={cn("truncate", !current && "text-muted-foreground")}
          >
            {current ? format(current, dateFormat, { locale }) : placeholder}
          </span>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          animated={motion}
          className="w-auto gap-0 p-0"
        >
          <PopoverTitle className="sr-only">{label}</PopoverTitle>
          <Calendar
            mode="single"
            motion={motion}
            autoFocus
            defaultMonth={current}
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
              whileTap={motion ? { scale: 0.96 } : false}
              className="m-2 mt-0 w-auto"
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
