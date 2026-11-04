"use client";

import { cn } from "cn";
import { format } from "date-fns";
import type { Locale } from "date-fns";
import { CalendarClock } from "lucide-react";
import * as React from "react";
import type { Matcher } from "react-day-picker";

import { Button } from "./button";
import { Calendar } from "./calendar";
import { PickerFooter, TimeField } from "./date-time-picker-parts";
import type { TimeUnitLabels } from "./date-time-picker-parts";
import {
  defaultTimeValue,
  formatTimeValue,
  mergeDateAndTime,
  normalizeDateTime,
  parseTimeValue,
  resolveHourCycle,
} from "./date-time-picker-utils";
import type { DateTimePrecision, HourCycle } from "./date-time-picker-utils";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";

// Composes Vandor's Button, Popover and Calendar with a Vandor time field. Values are
// local-time `Date`s; the draft is committed only by Apply (or Clear).

export type { DateTimePrecision, HourCycle, TimeUnitLabels };

export interface DateTimePickerProps {
  id?: string;
  label: string;
  placeholder?: string;
  clearable?: boolean;
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (date: Date | undefined) => void;
  locale?: Locale;
  dateFormat?: string;
  precision?: DateTimePrecision;
  hourCycle?: HourCycle;
  timeUnitLabels?: TimeUnitLabels;
  disabled?: boolean;
  readOnly?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabledDates?: Matcher | Matcher[];
  startMonth?: Date;
  endMonth?: Date;
  timeLabel?: string;
  applyLabel?: string;
  cancelLabel?: string;
  clearLabel?: string;
  className?: string;
  motion?: boolean;
}

const withPickerDefaults = ({
  placeholder = "Select date and time",
  clearable = false,
  dateFormat = "PPP p",
  precision = "minute",
  defaultOpen = false,
  timeLabel = "Time",
  applyLabel = "Apply",
  cancelLabel = "Cancel",
  clearLabel = "Clear",
  motion = true,
  ...props
}: DateTimePickerProps) => ({
  ...props,
  applyLabel,
  cancelLabel,
  clearLabel,
  clearable,
  dateFormat,
  defaultOpen,
  motion,
  placeholder,
  precision,
  timeLabel,
});

export const DateTimePicker = (props: DateTimePickerProps) => {
  const {
    id,
    label,
    placeholder,
    clearable,
    value,
    defaultValue,
    onValueChange,
    locale,
    dateFormat,
    precision,
    hourCycle,
    timeUnitLabels,
    disabled,
    readOnly,
    open,
    defaultOpen,
    onOpenChange,
    disabledDates,
    startMonth,
    endMonth,
    timeLabel,
    applyLabel,
    cancelLabel,
    clearLabel,
    className,
    motion,
  } = withPickerDefaults(props);
  const blocked = Boolean(disabled || readOnly);
  const controlled = Object.hasOwn(props, "value");
  const generatedId = React.useId();
  const triggerId = id ?? generatedId;
  const [internal, setInternal] = React.useState(defaultValue);
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const committed = controlled ? value : internal;
  const isOpen = !disabled && (open === undefined ? internalOpen : open);
  React.useEffect(() => {
    if (disabled) {
      setInternalOpen(false);
    }
  }, [disabled]);

  const fromCommitted = () => ({
    day: committed,
    time: committed
      ? formatTimeValue(committed, precision)
      : defaultTimeValue("start", precision),
  });
  const [draft, setDraft] = React.useState(fromCommitted);
  // The draft mirrors the committed value whenever the popup is closed, so a reopen
  // (including a controlled `open`) never shows a discarded or stale edit.
  const resetDraft = React.useEffectEvent(() => setDraft(fromCommitted()));
  const committedTime = committed?.getTime();
  React.useEffect(() => {
    if (!isOpen) {
      resetDraft();
    }
  }, [isOpen, committedTime, precision]);

  const setOpen = (next: boolean) => {
    if (disabled && next) {
      return;
    }
    if (open === undefined) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };
  const commit = (next?: Date) => {
    if (blocked) {
      return;
    }
    if (!controlled) {
      setInternal(next);
    }
    onValueChange?.(next);
    setOpen(false);
  };

  const parsedTime = parseTimeValue(draft.time);
  const canApply =
    !blocked && draft.day !== undefined && parsedTime !== undefined;
  const apply = () => {
    if (canApply && draft.day && parsedTime) {
      commit(mergeDateAndTime(draft.day, parsedTime, precision));
    }
  };
  const whileTap = motion ? { scale: 0.96 } : false;
  const shown = committed
    ? format(normalizeDateTime(committed, precision), dateFormat, { locale })
    : placeholder;

  return (
    <div data-slot="date-time-picker" className="grid min-w-0 gap-1.5">
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
          render={<Button variant="outline" whileTap={whileTap} />}
          className={cn(
            "inline-flex h-9 min-w-0 items-center justify-start gap-2 rounded-md border border-input bg-background px-3 text-sm font-normal shadow-xs outline-none hover:bg-accent focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30",
            className
          )}
        >
          <CalendarClock aria-hidden="true" className="size-4 shrink-0" />
          <span
            id={`${triggerId}-value`}
            className={cn("truncate", !committed && "text-muted-foreground")}
          >
            {shown}
          </span>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          animated={motion}
          className="w-auto gap-0 p-0"
        >
          <PopoverTitle className="sr-only">{label}</PopoverTitle>
          <div className="flex flex-col sm:flex-row">
            <Calendar
              mode="single"
              motion={motion}
              autoFocus
              defaultMonth={draft.day}
              locale={locale}
              selected={draft.day}
              disabled={blocked ? () => true : disabledDates}
              startMonth={startMonth}
              endMonth={endMonth}
              onSelect={(day) => {
                // Re-clicking the selected day must not empty the draft.
                if (day && !blocked) {
                  setDraft((current) => ({ ...current, day }));
                }
              }}
            />
            <div className="border-t p-3 sm:border-t-0 sm:border-l">
              <TimeField
                id={`${triggerId}-time`}
                label={timeLabel}
                value={draft.time}
                precision={precision}
                hourCycle={resolveHourCycle(locale, hourCycle)}
                locale={locale}
                unitLabels={timeUnitLabels}
                disabled={disabled}
                readOnly={readOnly}
                onEnter={apply}
                onValueChange={(time) =>
                  setDraft((current) => ({ ...current, time }))
                }
              />
            </div>
          </div>
          <div className="border-t p-3">
            <PickerFooter
              showClear={Boolean(clearable && committed && !blocked)}
              canApply={canApply}
              whileTap={whileTap}
              labels={{
                apply: applyLabel,
                cancel: cancelLabel,
                clear: clearLabel,
              }}
              onClear={() => commit()}
              onCancel={() => setOpen(false)}
              onApply={apply}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
