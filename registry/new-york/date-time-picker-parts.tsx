"use client";

import { cn } from "cn";
import { format } from "date-fns";
import type { Locale } from "date-fns";
import * as React from "react";

import { Button } from "./button";
import {
  from12Hour,
  parseTimeValue,
  to12Hour,
  withTimePart,
} from "./date-time-picker-utils";
import type {
  DateTimePrecision,
  HourCycle,
  TimePart,
} from "./date-time-picker-utils";

// Pieces shared by DateTimePicker and DateTimeRangePicker: a time of day picked from
// scrollable columns styled like Calendar (the value is the canonical 24-hour
// "HH:mm[:ss]" string whatever the display cycle) and the Cancel/Apply/Clear footer.

export interface TimeUnitLabels {
  hours: string;
  minutes: string;
  seconds: string;
  period: string;
}

export const defaultTimeUnitLabels: TimeUnitLabels = {
  hours: "Hours",
  minutes: "Minutes",
  period: "AM/PM",
  seconds: "Seconds",
};

interface ColumnOption {
  value: number;
  label: string;
}

const pad = (value: number) => String(value).padStart(2, "0");
const range = (start: number, end: number): ColumnOption[] =>
  Array.from({ length: end - start + 1 }, (_, index) => ({
    label: pad(start + index),
    value: start + index,
  }));
const hours24 = range(0, 23);
const hours12 = [{ label: "12", value: 12 }, ...range(1, 11)];
const sixty = range(0, 59);

interface TimeColumnProps {
  id: string;
  label: string;
  options: readonly ColumnOption[];
  selected: number;
  onSelect: (value: number) => void;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  describedBy?: string;
  onEnter?: () => void;
}

const keyDelta = (key: string): number | "first" | "last" | undefined => {
  const deltas: Record<string, number | "first" | "last"> = {
    ArrowDown: 1,
    ArrowUp: -1,
    End: "last",
    Home: "first",
    PageDown: 5,
    PageUp: -5,
  };
  return deltas[key];
};

const TimeColumn = ({
  id,
  label,
  options,
  selected,
  onSelect,
  disabled,
  readOnly,
  invalid,
  describedBy,
  onEnter,
}: TimeColumnProps) => {
  const listRef = React.useRef<HTMLDivElement>(null);
  const blocked = Boolean(disabled || readOnly);
  // Centre the selection without animation, so reduced-motion needs no special case.
  React.useEffect(() => {
    const list = listRef.current;
    const item = list?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (list && item) {
      list.scrollTop =
        item.offsetTop - (list.clientHeight - item.offsetHeight) / 2;
    }
  }, [selected]);

  const move = (delta: number | "first" | "last") => {
    const index = options.findIndex((option) => option.value === selected);
    let target = index + (typeof delta === "number" ? delta : 0);
    if (delta === "first") {
      target = 0;
    } else if (delta === "last") {
      target = options.length - 1;
    }
    const next = options[Math.min(Math.max(target, 0), options.length - 1)];
    if (next && next.value !== selected) {
      onSelect(next.value);
    }
  };

  return (
    <div
      ref={listRef}
      id={id}
      role="listbox"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-orientation="vertical"
      aria-disabled={disabled ? true : undefined}
      aria-readonly={readOnly ? true : undefined}
      aria-invalid={invalid ? true : undefined}
      aria-describedby={describedBy}
      aria-activedescendant={`${id}-${selected}`}
      data-slot="time-column"
      onKeyDown={(event) => {
        if (event.key === "Enter" && onEnter) {
          event.preventDefault();
          onEnter();
          return;
        }
        const delta = keyDelta(event.key);
        if (delta !== undefined) {
          event.preventDefault();
          if (!blocked) {
            move(delta);
          }
        }
      }}
      className={cn(
        "relative h-52 w-14 shrink-0 overflow-y-auto rounded-md border border-input bg-background p-1 shadow-xs outline-none [scrollbar-width:thin] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          id={`${id}-${option.value}`}
          type="button"
          role="option"
          tabIndex={-1}
          aria-selected={option.value === selected}
          disabled={disabled}
          onClick={() => {
            if (!blocked) {
              onSelect(option.value);
            }
          }}
          className="flex h-8 w-full items-center justify-center rounded-md text-sm tabular-nums outline-none hover:bg-accent hover:text-accent-foreground aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:hover:bg-primary/90"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export interface TimeFieldProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  precision: DateTimePrecision;
  hourCycle: HourCycle;
  locale?: Locale;
  unitLabels?: TimeUnitLabels;
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
  hourCycle,
  locale,
  unitLabels = defaultTimeUnitLabels,
  disabled,
  readOnly,
  invalid,
  describedBy,
  onEnter,
}: TimeFieldProps) => {
  const parts = { hours: 0, minutes: 0, seconds: 0, ...parseTimeValue(value) };
  const { hour, pm } = to12Hour(parts.hours);
  const set = (part: TimePart, next: number) =>
    onValueChange(withTimePart(value, part, next, precision));
  const shared = { describedBy, disabled, invalid, onEnter, readOnly };
  const periods: ColumnOption[] = [
    { label: format(new Date(2000, 0, 1, 0), "a", { locale }), value: 0 },
    { label: format(new Date(2000, 0, 1, 12), "a", { locale }), value: 1 },
  ];

  return (
    <div
      data-slot="time-field"
      role="group"
      aria-labelledby={`${id}-label`}
      className="grid min-w-0 gap-1.5"
    >
      <span id={`${id}-label`} className="text-sm font-medium">
        {label}
      </span>
      <div className="flex gap-1.5">
        {hourCycle === 12 ? (
          <TimeColumn
            {...shared}
            id={`${id}-hours`}
            label={unitLabels.hours}
            options={hours12}
            selected={hour}
            onSelect={(next) => set("hours", from12Hour(next, pm))}
          />
        ) : (
          <TimeColumn
            {...shared}
            id={`${id}-hours`}
            label={unitLabels.hours}
            options={hours24}
            selected={parts.hours}
            onSelect={(next) => set("hours", next)}
          />
        )}
        <TimeColumn
          {...shared}
          id={`${id}-minutes`}
          label={unitLabels.minutes}
          options={sixty}
          selected={parts.minutes}
          onSelect={(next) => set("minutes", next)}
        />
        {precision === "second" ? (
          <TimeColumn
            {...shared}
            id={`${id}-seconds`}
            label={unitLabels.seconds}
            options={sixty}
            selected={parts.seconds}
            onSelect={(next) => set("seconds", next)}
          />
        ) : null}
        {hourCycle === 12 ? (
          <TimeColumn
            {...shared}
            id={`${id}-period`}
            label={unitLabels.period}
            options={periods}
            selected={pm ? 1 : 0}
            onSelect={(next) => set("hours", from12Hour(hour, next === 1))}
          />
        ) : null}
      </div>
    </div>
  );
};

export interface PickerFooterProps {
  showClear: boolean;
  canApply: boolean;
  whileTap: { scale: number } | false;
  labels: { apply: string; cancel: string; clear: string };
  onClear: () => void;
  onCancel: () => void;
  onApply: () => void;
}

/**
 * Shared with DateTimeRangePicker; its API may change.
 * @internal
 */
export const PickerFooter = ({
  showClear,
  canApply,
  whileTap,
  labels,
  onClear,
  onCancel,
  onApply,
}: PickerFooterProps) => (
  <div className="flex justify-end gap-2">
    {showClear ? (
      <Button
        type="button"
        variant="ghost"
        whileTap={whileTap}
        onClick={onClear}
      >
        {labels.clear}
      </Button>
    ) : null}
    <Button
      type="button"
      variant="outline"
      whileTap={whileTap}
      onClick={onCancel}
    >
      {labels.cancel}
    </Button>
    <Button
      type="button"
      disabled={!canApply}
      whileTap={whileTap}
      onClick={onApply}
    >
      {labels.apply}
    </Button>
  </div>
);
