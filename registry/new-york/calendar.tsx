"use client";

// Adapted from shadcn/ui's base-nova Calendar (MIT).
/*
 * Copyright (c) 2026 Shadcn Labs
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { useRender } from "@base-ui/react/use-render";
import { cn } from "cn";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  motion as motionElement,
  useAnimate,
  useReducedMotion,
} from "motion/react";
import * as React from "react";
import {
  DayPicker,
  getDefaultClassNames,
  useDayPicker,
} from "react-day-picker";
import type {
  ChevronProps,
  DayButtonProps,
  DayPickerProps,
  MonthProps,
  RootProps,
  WeekNumberProps,
} from "react-day-picker";

type NavigationVariant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link";

const navigationVariants: Record<NavigationVariant, string> = {
  default:
    "border border-primary bg-primary text-primary-foreground hover:bg-primary/90",
  destructive:
    "border border-destructive bg-destructive text-white hover:bg-destructive/90",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
  outline:
    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  secondary:
    "border border-input bg-secondary text-secondary-foreground hover:bg-secondary/80",
};
const calendarButtonClasses =
  "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md text-sm outline-none transition-colors duration-150 motion-reduce:transition-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0";

type CalendarProps = DayPickerProps & {
  buttonVariant?: NavigationVariant;
  /** Enables Vandor motion. System reduced-motion preferences always take priority. */
  motion?: boolean;
};

const CalendarMotionContext = React.createContext(true);

const CalendarRoot = ({ className, rootRef, ...props }: RootProps) => (
  <div data-slot="calendar" ref={rootRef} className={className} {...props} />
);

const CalendarMonth = ({
  calendarMonth,
  displayIndex: _displayIndex,
  ...props
}: MonthProps) => {
  const enabled = React.useContext(CalendarMotionContext);
  const reduced = useReducedMotion();
  const { dayPickerProps } = useDayPicker();
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const month =
    calendarMonth.date.getFullYear() * 12 + calendarMonth.date.getMonth();
  const previous = React.useRef(month);
  React.useEffect(() => {
    const direction =
      Math.sign(month - previous.current) *
      (dayPickerProps.dir === "rtl" ? -1 : 1);
    previous.current = month;
    if (!enabled || reduced || !direction || !scope.current) {
      return;
    }
    const node = scope.current;
    const originalOpacity = node.style.opacity;
    const originalTransform = node.style.transform;
    const animation = animate(
      node,
      { opacity: [0.65, 1], x: [direction * 8, 0] },
      {
        duration: 0.2,
        ease: [0.22, 1, 0.36, 1],
      }
    );
    return () => {
      animation.stop();
      node.style.opacity = originalOpacity;
      node.style.transform = originalTransform;
    };
  }, [animate, dayPickerProps.dir, enabled, month, reduced, scope]);
  return <div {...props} ref={scope} />;
};

const CalendarChevron = ({
  className,
  orientation,
  ...props
}: ChevronProps) => {
  const icons = {
    down: ChevronDown,
    left: ChevronLeft,
    right: ChevronRight,
    up: ChevronDown,
  };
  const Icon = icons[orientation ?? "down"];
  return (
    <Icon aria-hidden="true" className={cn("size-4", className)} {...props} />
  );
};

const NativeButtonSlot = ({
  nativeProps,
  ref,
  ...props
}: React.ComponentProps<"button"> & {
  nativeProps: React.ComponentProps<"button">;
}) => useRender({ props, ref, render: <button {...nativeProps} /> });
const MotionNativeButton = motionElement.create(NativeButtonSlot);

const CalendarNativeButton = ({
  ref: forwardedRef,
  ...props
}: React.ComponentProps<"button">) => {
  const enabled = React.useContext(CalendarMotionContext);
  const reduced = useReducedMotion();
  // Keep native DayPicker handlers on the child, separate from Motion's gesture props.
  return (
    <MotionNativeButton
      nativeProps={props}
      ref={forwardedRef}
      whileTap={
        enabled && !reduced && !props.disabled && !props["aria-disabled"]
          ? { scale: 0.96 }
          : undefined
      }
      transition={{ duration: 0.12, ease: "easeOut" }}
    />
  );
};

const CalendarNavigationButton = (props: React.ComponentProps<"button">) => (
  <CalendarNativeButton
    {...props}
    disabled={props.disabled || props["aria-disabled"] === true}
  />
);

const CalendarWeekNumber = ({
  children,
  week: _week,
  ...props
}: WeekNumberProps) => (
  <td {...props}>
    <div className="flex size-(--cell-size) items-center justify-center text-center">
      {children}
    </div>
  </td>
);

const Calendar = ({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  motion = true,
  components,
  ...props
}: CalendarProps) => {
  const defaults = getDefaultClassNames();
  return (
    <CalendarMotionContext.Provider value={motion}>
      <DayPicker
        {...props}
        showOutsideDays={showOutsideDays}
        captionLayout={captionLayout}
        className={cn(
          "group/calendar bg-background p-2 [--cell-radius:var(--radius-md)] [--cell-size:--spacing(9)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
          className
        )}
        classNames={{
          button_next: cn(
            calendarButtonClasses,
            navigationVariants[buttonVariant],
            "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
            defaults.button_next
          ),
          button_previous: cn(
            calendarButtonClasses,
            navigationVariants[buttonVariant],
            "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
            defaults.button_previous
          ),
          caption_label: cn(
            "text-sm font-medium select-none",
            captionLayout !== "label" &&
              "flex items-center gap-1 [&>svg]:size-3.5 [&>svg]:text-muted-foreground",
            defaults.caption_label
          ),
          day: cn(
            "group/day relative aspect-square h-full w-full p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-e-(--cell-radius)",
            props.showWeekNumber
              ? "[&:nth-child(2)[data-selected=true]_button]:rounded-s-(--cell-radius)"
              : "[&:first-child[data-selected=true]_button]:rounded-s-(--cell-radius)",
            defaults.day
          ),
          disabled: cn("text-muted-foreground opacity-50", defaults.disabled),
          dropdown: cn(
            "absolute inset-0 cursor-pointer bg-popover opacity-0",
            defaults.dropdown
          ),
          dropdown_root: cn(
            "relative rounded-(--cell-radius) border border-input px-1.5 py-1 has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50",
            defaults.dropdown_root
          ),
          dropdowns: cn(
            "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
            defaults.dropdowns
          ),
          hidden: cn("invisible", defaults.hidden),
          month: cn("flex w-full flex-col gap-4", defaults.month),
          month_caption: cn(
            "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
            defaults.month_caption
          ),
          month_grid: cn("w-full border-collapse", defaults.month_grid),
          months: cn(
            "relative flex flex-col gap-4 md:flex-row",
            defaults.months
          ),
          nav: cn(
            "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
            defaults.nav
          ),
          outside: cn("text-muted-foreground", defaults.outside),
          range_end: cn(
            "rounded-e-(--cell-radius) bg-muted",
            defaults.range_end
          ),
          range_middle: cn("rounded-none bg-muted", defaults.range_middle),
          range_start: cn(
            "rounded-s-(--cell-radius) bg-muted",
            defaults.range_start
          ),
          root: cn("w-fit", defaults.root),
          today: cn(
            "rounded-(--cell-radius) bg-muted text-foreground data-[selected=true]:rounded-none",
            defaults.today
          ),
          week: cn("mt-2 flex w-full", defaults.week),
          week_number: cn(
            "text-[0.8rem] text-muted-foreground select-none",
            defaults.week_number
          ),
          week_number_header: cn(
            "w-(--cell-size) select-none",
            defaults.week_number_header
          ),
          weekday: cn(
            "flex-1 text-center text-[0.8rem] font-normal text-muted-foreground select-none",
            defaults.weekday
          ),
          weekdays: cn("flex", defaults.weekdays),
          ...classNames,
        }}
        components={{
          Chevron: CalendarChevron,
          // Stable slot identity preserves focus during parent updates.
          // eslint-disable-next-line no-use-before-define
          DayButton: CalendarDayButton,
          Month: CalendarMonth,
          NextMonthButton: CalendarNavigationButton,
          PreviousMonthButton: CalendarNavigationButton,
          Root: CalendarRoot,
          WeekNumber: CalendarWeekNumber,
          ...components,
        }}
      />
    </CalendarMotionContext.Provider>
  );
};

const CalendarDayButton = ({
  className,
  day,
  modifiers,
  children,
  ref: forwardedRef,
  ...props
}: DayButtonProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const enabled = React.useContext(CalendarMotionContext);
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLButtonElement>(null);
  const selected = Boolean(modifiers.selected);
  const endpoint = Boolean(modifiers.range_start || modifiers.range_end);
  const single = selected && !endpoint && !modifiers.range_middle;
  React.useEffect(() => {
    if (modifiers.focused) {
      ref.current?.focus();
    }
  }, [modifiers.focused]);
  const mergedRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      ref.current = node;
      if (typeof forwardedRef === "function") {
        return forwardedRef(node);
      }
      if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef]
  );
  return (
    <CalendarNativeButton
      {...props}
      ref={mergedRef}
      data-day={day.isoDate}
      data-selected-single={single}
      data-range-start={Boolean(modifiers.range_start)}
      data-range-end={Boolean(modifiers.range_end)}
      data-range-middle={Boolean(modifiers.range_middle)}
      className={cn(
        calendarButtonClasses,
        navigationVariants.ghost,
        "relative isolate flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground data-[range-start=true]:text-primary-foreground data-[range-end=true]:text-primary-foreground data-[selected-single=true]:text-primary-foreground [&>span]:text-xs [&>span]:opacity-70",
        getDefaultClassNames().day_button,
        className
      )}
    >
      <motionElement.span
        aria-hidden="true"
        data-slot="calendar-selection"
        initial={false}
        animate={{
          opacity: single || endpoint ? 1 : 0,
          scale: single || endpoint || !enabled || reduced ? 1 : 0.92,
        }}
        transition={{
          duration: enabled && !reduced ? 0.16 : 0,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-primary"
      />
      {children}
    </CalendarNativeButton>
  );
};

export { Calendar, CalendarDayButton };
export type { CalendarProps };
