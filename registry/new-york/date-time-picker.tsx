"use client";

import { cn } from "cn";
import { format } from "date-fns";
import type { Locale } from "date-fns";
import { CalendarClock } from "lucide-react";
import * as React from "react";
import type { Matcher } from "react-day-picker";

import { Button } from "./button";
import { Calendar } from "./calendar";
import {
  formatTimeValue,
  mergeDateAndTime,
  normalizeDateTime,
  parseTimeValue,
} from "./date-time-picker-utils";
import type { DateTimePrecision } from "./date-time-picker-utils";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";

// Composes Vandor's Button, Popover and Calendar with a native time field. Values are
// local-time `Date`s; the draft is committed only by Apply (or Clear).

export type { DateTimePrecision };

export interface TimeFieldProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  precision: DateTimePrecision;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  describedBy?: string;
  onEnter?: () => void;
}

/**
 * Building block shared with DateTimeRangePicker; its API may change.
 *
 * @internal
 */
export const TimeField = ({
  id,
  label,
  value,
  onValueChange,
  precision,
  disabled,
  readOnly,
  invalid,
  describedBy,
  onEnter,
}: TimeFieldProps) => (
  <div data-slot="time-field" className="grid min-w-0 gap-1.5">
    <label htmlFor={id} className="text-sm font-medium">
      {label}
    </label>
    <input
      id={id}
      type="time"
      step={precision === "second" ? 1 : 60}
      value={value}
      disabled={disabled}
      readOnly={readOnly}
      aria-invalid={invalid ? true : undefined}
      aria-describedby={describedBy}
      onChange={(event) => {
        if (!(disabled || readOnly)) {
          onValueChange(event.currentTarget.value);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" && onEnter) {
          event.preventDefault();
          onEnter();
        }
      }}
      className="h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
    />
  </div>
);

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

const defaultTimeOf = (precision: DateTimePrecision) =>
  precision === "second" ? "00:00:00" : "00:00";

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
      : defaultTimeOf(precision),
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
          <div className="grid gap-3 border-t p-3">
            <TimeField
              id={`${triggerId}-time`}
              label={timeLabel}
              value={draft.time}
              precision={precision}
              disabled={disabled}
              readOnly={readOnly}
              invalid={parsedTime === undefined}
              onEnter={apply}
              onValueChange={(time) =>
                setDraft((current) => ({ ...current, time }))
              }
            />
            <div className="flex justify-end gap-2">
              {clearable && committed && !blocked ? (
                <Button
                  type="button"
                  variant="ghost"
                  whileTap={whileTap}
                  onClick={() => commit()}
                >
                  {clearLabel}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                whileTap={whileTap}
                onClick={() => setOpen(false)}
              >
                {cancelLabel}
              </Button>
              <Button
                type="button"
                disabled={!canApply}
                whileTap={whileTap}
                onClick={apply}
              >
                {applyLabel}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
