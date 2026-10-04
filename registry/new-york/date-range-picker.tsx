"use client";

import { cn } from "cn";
import { format } from "date-fns";
import type { Locale } from "date-fns";
import { CalendarDays } from "lucide-react";
import * as React from "react";
import type { DateRange, Matcher } from "react-day-picker";

import { Button } from "./button";
import { Calendar } from "./calendar";
import {
  isSelectableDateRange,
  resolveDateShortcut,
} from "./date-picker-utils";
import type { DateShortcut } from "./date-picker-utils";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";

// shadcn Date Picker composition, extended with transactional range selection.

export type DateRangeFeature = "twoMonths" | "shortcuts";

const allShortcuts: readonly DateShortcut[] = [
  "last7Days",
  "last14Days",
  "last30Days",
  "thisWeek",
  "lastWeek",
  "thisMonth",
  "lastMonth",
];

const shortcutLabels: Record<DateShortcut, string> = {
  last14Days: "Last 14 days",
  last30Days: "Last 30 days",
  last7Days: "Last 7 days",
  lastMonth: "Last month",
  lastWeek: "Last week",
  thisMonth: "This month",
  thisWeek: "This week",
};

export interface DateRangePickerProps {
  id?: string;
  label: string;
  placeholder?: string;
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (range: DateRange | undefined) => void;
  locale?: Locale;
  dateFormat?: string;
  disabled?: boolean;
  readOnly?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  startMonth?: Date;
  endMonth?: Date;
  disabledDates?: readonly Date[];
  features?: readonly DateRangeFeature[];
  shortcuts?: readonly DateShortcut[];
  now?: () => Date;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  clearable?: boolean;
  applyLabel?: string;
  cancelLabel?: string;
  clearLabel?: string;
  className?: string;
  motion?: boolean;
}

const getShownValue = (
  committed: DateRange | undefined,
  dateFormat: string,
  locale: Locale | undefined,
  placeholder: string
) =>
  committed?.from
    ? `${format(committed.from, dateFormat, { locale })}${committed.to ? ` – ${format(committed.to, dateFormat, { locale })}` : ""}`
    : placeholder;

const getCurrentDate = () => new Date();

const withRangePickerDefaults = ({
  placeholder = "Select dates",
  dateFormat = "PPP",
  defaultOpen = false,
  disabledDates = [],
  features = [],
  shortcuts = allShortcuts,
  now = getCurrentDate,
  weekStartsOn = 1,
  clearable = false,
  applyLabel = "Apply",
  cancelLabel = "Cancel",
  clearLabel = "Clear",
  motion = true,
  ...props
}: DateRangePickerProps) => ({
  ...props,
  applyLabel,
  cancelLabel,
  clearLabel,
  clearable,
  dateFormat,
  defaultOpen,
  disabledDates,
  features,
  motion,
  now,
  placeholder,
  shortcuts,
  weekStartsOn,
});

export const DateRangePicker = (props: DateRangePickerProps) => {
  const {
    id,
    label,
    placeholder,
    value,
    defaultValue,
    onValueChange,
    locale,
    dateFormat,
    disabled,
    readOnly,
    open,
    defaultOpen,
    onOpenChange,
    startMonth,
    endMonth,
    disabledDates,
    features,
    shortcuts,
    now,
    weekStartsOn,
    clearable,
    applyLabel,
    cancelLabel,
    clearLabel,
    className,
    motion,
  } = withRangePickerDefaults(props);
  const controlled = Object.hasOwn(props, "value");
  const generatedId = React.useId();
  const triggerId = id ?? generatedId;
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const committed = controlled ? value : internalValue;
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isOpen = open === undefined ? internalOpen : open;
  const [draft, setDraft] = React.useState<DateRange | undefined>(committed);
  const [clearedDraft, setClearedDraft] = React.useState(false);
  const [wideViewport, setWideViewport] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setWideViewport(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const syncControlledDraft = React.useEffectEvent(() => {
    if (controlled) {
      setDraft(committed);
      setClearedDraft(false);
    }
  });
  const fromTime = committed?.from?.getTime();
  const toTime = committed?.to?.getTime();
  React.useEffect(() => {
    syncControlledDraft();
  }, [controlled, fromTime, toTime]);

  const setOpen = (next: boolean) => {
    setDraft(committed);
    setClearedDraft(false);
    if (open === undefined) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  const dateDisabled = (date: Date) =>
    disabledDates.some(
      (item) =>
        item.getFullYear() === date.getFullYear() &&
        item.getMonth() === date.getMonth() &&
        item.getDate() === date.getDate()
    );
  const matcher: Matcher[] = [dateDisabled];
  if (readOnly) {
    matcher.push(() => true);
  }
  const canApply =
    !readOnly && (clearedDraft || isSelectableDateRange(draft, disabledDates));
  const shownValue = getShownValue(committed, dateFormat, locale, placeholder);
  const whileTap = motion ? { scale: 0.96 } : false;

  return (
    <div data-slot="date-range-picker" className="grid min-w-0 gap-1.5">
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
          <CalendarDays aria-hidden="true" className="size-4 shrink-0" />
          <span
            id={`${triggerId}-value`}
            className={cn(
              "truncate",
              !committed?.from && "text-muted-foreground"
            )}
          >
            {shownValue}
          </span>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          animated={motion}
          className="w-auto gap-0 p-2"
        >
          <PopoverTitle className="sr-only">{label}</PopoverTitle>
          <div className="flex flex-col gap-3 sm:flex-row">
            {features.includes("shortcuts") ? (
              <div className="flex flex-wrap gap-1 sm:w-32 sm:flex-col sm:flex-nowrap">
                {shortcuts.map((shortcut) => (
                  <Button
                    key={shortcut}
                    type="button"
                    variant="ghost"
                    size="sm"
                    whileTap={whileTap}
                    className="justify-start whitespace-nowrap"
                    disabled={readOnly}
                    onClick={() => {
                      setDraft(
                        resolveDateShortcut(shortcut, now(), weekStartsOn)
                      );
                      setClearedDraft(false);
                    }}
                  >
                    {shortcutLabels[shortcut]}
                  </Button>
                ))}
              </div>
            ) : null}
            <Calendar
              mode="range"
              motion={motion}
              autoFocus
              defaultMonth={draft?.from}
              locale={locale}
              selected={draft}
              numberOfMonths={
                features.includes("twoMonths") && wideViewport ? 2 : 1
              }
              disabled={matcher}
              startMonth={startMonth}
              endMonth={endMonth}
              weekStartsOn={weekStartsOn}
              onSelect={(range) => {
                setDraft(range);
                setClearedDraft(false);
              }}
            />
          </div>
          <div className="mt-2 flex justify-end gap-2 border-t pt-2">
            {clearable ? (
              <Button
                type="button"
                variant="ghost"
                whileTap={whileTap}
                disabled={readOnly}
                onClick={() => {
                  setDraft(undefined);
                  setClearedDraft(true);
                }}
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
              onClick={() => {
                const next = clearedDraft ? undefined : draft;
                if (!controlled) {
                  setInternalValue(next);
                }
                onValueChange?.(next);
                setOpen(false);
              }}
            >
              {applyLabel}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
