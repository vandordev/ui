"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "cn";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { createContext, useContext, useRef } from "react";
import type { ComponentProps } from "react";

const PopupElement = ({
  nativeProps,
  ref,
  ...props
}: ComponentProps<"div"> & { nativeProps: ComponentProps<"div"> }) =>
  useRender({
    props: { ...nativeProps },
    ref: [nativeProps.ref ?? null, ref ?? null],
    render: <div {...props} />,
  });
const MotionPopupElement = motion.create(PopupElement);

const SelectActionsContext = createContext<(() => void) | null>(null);

const Select = <Value, Multiple extends boolean | undefined = false>({
  actionsRef,
  children,
  ...props
}: SelectPrimitive.Root.Props<Value, Multiple>) => {
  const internalActions = useRef<SelectPrimitive.Root.Actions | null>(null);
  const actions = actionsRef ?? internalActions;
  return (
    <SelectActionsContext.Provider value={() => actions.current?.unmount()}>
      <SelectPrimitive.Root {...props} actionsRef={actions}>
        {children}
      </SelectPrimitive.Root>
    </SelectActionsContext.Provider>
  );
};

const SelectGroup = ({ className, ...props }: SelectPrimitive.Group.Props) => (
  <SelectPrimitive.Group
    data-slot="select-group"
    className={cn("scroll-my-1 p-1", className)}
    {...props}
  />
);

const SelectValue = ({ className, ...props }: SelectPrimitive.Value.Props) => (
  <SelectPrimitive.Value
    data-slot="select-value"
    className={cn(
      "flex min-w-0 flex-1 items-center gap-2 text-left data-placeholder:text-muted-foreground",
      className
    )}
    {...props}
  />
);

const SelectTrigger = ({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & { size?: "sm" | "default" }) => (
  <SelectPrimitive.Trigger
    data-slot="select-trigger"
    data-size={size}
    className={cn(
      "flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm whitespace-nowrap outline-none transition-[background-color,border-color,box-shadow] duration-200 ease-out select-none hover:not-disabled:bg-accent/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[size=default]:h-9 data-[size=sm]:h-8 motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon className="text-muted-foreground transition-transform duration-200 ease-out data-popup-open:rotate-180 motion-reduce:transition-none">
      <ChevronDownIcon aria-hidden="true" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
);

type SelectContentProps = Omit<SelectPrimitive.Popup.Props, "render"> &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  > & { animated?: boolean };

const SelectContent = ({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  alignItemWithTrigger = false,
  animated = true,
  ...props
}: SelectContentProps) => {
  const reduceMotion = useReducedMotion();
  const unmount = useContext(SelectActionsContext);
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "relative max-h-(--available-height) min-w-[max(8rem,var(--anchor-width))] origin-(--transform-origin) overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md outline-none",
            className
          )}
          {...props}
          render={(popupProps, state) => (
            <MotionPopupElement
              nativeProps={popupProps}
              initial={{
                opacity: animated ? 0 : 1,
                scale: animated && !reduceMotion ? 0.96 : 1,
              }}
              animate={{
                opacity: state.open ? 1 : 0,
                scale: animated && !reduceMotion && !state.open ? 0.96 : 1,
              }}
              transition={{
                duration:
                  (!animated || reduceMotion ? 0 : 1) *
                  (state.open ? 0.18 : 0.12),
                ease: [0.22, 1, 0.36, 1],
              }}
              onAnimationComplete={() => {
                if (!state.open) {
                  unmount?.();
                }
              }}
            >
              {popupProps.children}
            </MotionPopupElement>
          )}
        >
          <SelectPrimitive.ScrollUpArrow className="top-0 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg]:size-4">
            <ChevronUpIcon aria-hidden="true" />
          </SelectPrimitive.ScrollUpArrow>
          <SelectPrimitive.List className="max-h-[min(20rem,var(--available-height))] overflow-y-auto overscroll-contain">
            {children}
          </SelectPrimitive.List>
          <SelectPrimitive.ScrollDownArrow className="bottom-0 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg]:size-4">
            <ChevronDownIcon aria-hidden="true" />
          </SelectPrimitive.ScrollDownArrow>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
};

const SelectLabel = ({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) => (
  <SelectPrimitive.GroupLabel
    data-slot="select-label"
    className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)}
    {...props}
  />
);

const SelectItem = ({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) => (
  <SelectPrimitive.Item
    data-slot="select-item"
    className={cn(
      "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText className="flex min-w-0 flex-1 items-center gap-2">
      {children}
    </SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className="pointer-events-none absolute right-2 flex items-center justify-center">
      <CheckIcon aria-hidden="true" />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
);

const SelectSeparator = ({
  className,
  ...props
}: SelectPrimitive.Separator.Props) => (
  <SelectPrimitive.Separator
    data-slot="select-separator"
    className={cn("pointer-events-none my-1 h-px bg-border", className)}
    {...props}
  />
);

const SelectScrollUpButton = ({
  className,
  ...props
}: SelectPrimitive.ScrollUpArrow.Props) => (
  <SelectPrimitive.ScrollUpArrow
    data-slot="select-scroll-up-button"
    className={cn(
      "top-0 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg]:size-4",
      className
    )}
    {...props}
  >
    <ChevronUpIcon aria-hidden="true" />
  </SelectPrimitive.ScrollUpArrow>
);

const SelectScrollDownButton = ({
  className,
  ...props
}: SelectPrimitive.ScrollDownArrow.Props) => (
  <SelectPrimitive.ScrollDownArrow
    data-slot="select-scroll-down-button"
    className={cn(
      "bottom-0 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg]:size-4",
      className
    )}
    {...props}
  >
    <ChevronDownIcon aria-hidden="true" />
  </SelectPrimitive.ScrollDownArrow>
);

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
