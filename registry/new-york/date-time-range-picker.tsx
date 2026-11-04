"use client";

import { cn } from "cn";
import { format } from "date-fns";
import type { Locale } from "date-fns";
import { CalendarClock } from "lucide-react";
import * as React from "react";
import type { DateRange, Matcher } from "react-day-picker";

import { Button } from "./button";
import { Calendar } from "./calendar";
import { PickerFooter, TimeField } from "./date-time-picker-parts";
import type { TimeUnitLabels } from "./date-time-picker-parts";
import {
  defaultTimeValue,
  formatTimeValue,
  normalizeDateTime,
  resolveDateTimeRangeDraft,
  resolveHourCycle,
} from "./date-time-picker-utils";
import type {
  DateTimePrecision,
  DateTimeRangeDraft,
  HourCycle,
} from "./date-time-picker-utils";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";

// Composes Vandor's Button, Popover and Calendar with two time pickers. Values are
// local-time `Date`s; the draft is committed only by Apply (or Clear).

export interface DateTimeRangePickerProps {
  id?: string;
  label: string;
  placeholder?: string;
  clearable?: boolean;
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (range: DateRange | undefined) => void;
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
  startTimeLabel?: string;
  endTimeLabel?: string;
  rangeErrorLabel?: string;
  applyLabel?: string;
  cancelLabel?: string;
  clearLabel?: string;
  className?: string;
  motion?: boolean;
}

interface Draft {
  range: DateRange | undefined;
  startTime: string;
  endTime: string;
}

const draftFrom = (
  committed: DateRange | undefined,
  precision: DateTimePrecision
): Draft => ({
  endTime: committed?.to
    ? formatTimeValue(committed.to, precision)
    : defaultTimeValue("end", precision),
  range: committed,
  startTime: committed?.from
    ? formatTimeValue(committed.from, precision)
    : defaultTimeValue("start", precision),
});

const withPickerDefaults = ({
  placeholder = "Select date and time range",
  clearable = false,
  dateFormat = "PPP p",
  precision = "minute",
  defaultOpen = false,
  startTimeLabel = "Start time",
  endTimeLabel = "End time",
  rangeErrorLabel = "The end must not be before the start.",
  applyLabel = "Apply",
  cancelLabel = "Cancel",
  clearLabel = "Clear",
  motion = true,
  ...props
}: DateTimeRangePickerProps) => ({
  ...props,
  applyLabel,
  cancelLabel,
  clearLabel,
  clearable,
  dateFormat,
  defaultOpen,
  endTimeLabel,
  motion,
  placeholder,
  precision,
  rangeErrorLabel,
  startTimeLabel,
});

const getShownValue = (
  committed: DateRange | undefined,
  precision: DateTimePrecision,
  dateFormat: string,
  locale: Locale | undefined,
  placeholder: string
) => {
  if (!committed?.from) {
    return placeholder;
  }
  const show = (date: Date) =>
    format(normalizeDateTime(date, precision), dateFormat, { locale });
  return committed.to
    ? `${show(committed.from)} – ${show(committed.to)}`
    : show(committed.from);
};

const toCommittableRange = (
  resolved: DateTimeRangeDraft
): DateRange | undefined =>
  resolved.start && resolved.end && !resolved.orderInvalid
    ? { from: resolved.start, to: resolved.end }
    : undefined;

// The draft mirrors the committed value whenever the popup is closed, so a reopen
// (including a controlled `open`) never shows a discarded or stale edit.
const useRangeDraft = (
  committed: DateRange | undefined,
  precision: DateTimePrecision,
  isOpen: boolean
) => {
  const [draft, setDraft] = React.useState(() =>
    draftFrom(committed, precision)
  );
  const resetDraft = React.useEffectEvent(() =>
    setDraft(draftFrom(committed, precision))
  );
  const fromTime = committed?.from?.getTime();
  const toTime = committed?.to?.getTime();
  React.useEffect(() => {
    if (!isOpen) {
      resetDraft();
    }
  }, [isOpen, fromTime, toTime, precision]);
  return [draft, setDraft] as const;
};

export const DateTimeRangePicker = (props: DateTimeRangePickerProps) => {
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
    startTimeLabel,
    endTimeLabel,
    rangeErrorLabel,
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

  const [draft, setDraft] = useRangeDraft(committed, precision, isOpen);

  const setOpen = (next: boolean) => {
    if (disabled && next) {
      return;
    }
    if (open === undefined) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };
  const commit = (next?: DateRange) => {
    if (blocked) {
      return;
    }
    if (!controlled) {
      setInternal(next);
    }
    onValueChange?.(next);
    setOpen(false);
  };

  const resolved = resolveDateTimeRangeDraft(
    draft.range,
    draft.startTime,
    draft.endTime,
    precision
  );
  const next = blocked ? undefined : toCommittableRange(resolved);
  const canApply = next !== undefined;
  const apply = () => {
    if (next) {
      commit(next);
    }
  };
  const cycle = resolveHourCycle(locale, hourCycle);
  const errorId = `${triggerId}-range-error`;
  const describedBy = resolved.orderInvalid ? errorId : undefined;
  const whileTap = motion ? { scale: 0.96 } : false;
  const shown = getShownValue(
    committed,
    precision,
    dateFormat,
    locale,
    placeholder
  );

  return (
    <div data-slot="date-time-range-picker" className="grid min-w-0 gap-1.5">
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
            className={cn(
              "truncate",
              !committed?.from && "text-muted-foreground"
            )}
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
            mode="range"
            motion={motion}
            autoFocus
            excludeDisabled
            defaultMonth={draft.range?.from}
            locale={locale}
            selected={draft.range}
            disabled={blocked ? () => true : disabledDates}
            startMonth={startMonth}
            endMonth={endMonth}
            onSelect={(range) => {
              if (!blocked) {
                setDraft((current) => ({ ...current, range }));
              }
            }}
          />
          <div className="grid gap-3 border-t p-3">
            <div className="grid gap-3 sm:grid-cols-[max-content_max-content]">
              <TimeField
                id={`${triggerId}-start-time`}
                label={startTimeLabel}
                value={draft.startTime}
                precision={precision}
                hourCycle={cycle}
                locale={locale}
                unitLabels={timeUnitLabels}
                disabled={disabled}
                readOnly={readOnly}
                invalid={resolved.startTimeInvalid || resolved.orderInvalid}
                describedBy={describedBy}
                onEnter={apply}
                onValueChange={(startTime) =>
                  setDraft((current) => ({ ...current, startTime }))
                }
              />
              <TimeField
                id={`${triggerId}-end-time`}
                label={endTimeLabel}
                value={draft.endTime}
                precision={precision}
                hourCycle={cycle}
                locale={locale}
                unitLabels={timeUnitLabels}
                disabled={disabled}
                readOnly={readOnly}
                invalid={resolved.endTimeInvalid || resolved.orderInvalid}
                describedBy={describedBy}
                onEnter={apply}
                onValueChange={(endTime) =>
                  setDraft((current) => ({ ...current, endTime }))
                }
              />
            </div>
            <p
              id={errorId}
              role="status"
              aria-live="polite"
              className="text-sm text-destructive empty:hidden"
            >
              {resolved.orderInvalid ? rangeErrorLabel : null}
            </p>
            <PickerFooter
              showClear={Boolean(clearable && committed?.from && !blocked)}
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
