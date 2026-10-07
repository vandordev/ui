"use client";

// Mode-aware assembly and keyboard dispatch share the same four-way adapter.
/* eslint-disable complexity, no-nested-ternary */

import { Autocomplete as BaseAutocomplete } from "@base-ui/react/autocomplete";
import { Combobox } from "@base-ui/react/combobox";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "cn";
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { createContext, useCallback, useContext, useId, useState } from "react";
import type { ComponentProps, Ref, ReactNode } from "react";

import { AutocompleteRoot, useAutocomplete } from "./autocomplete-root";
import { AutocompleteFeedback } from "./autocomplete-feedback";
import { AutocompletePagination } from "./autocomplete-pagination";
import type {
  AutocompleteContentProps,
  AutocompleteInputProps,
  AutocompleteProps,
} from "./autocomplete-types";
import { groupAutocompleteItems } from "./autocomplete-utils";

const surface =
  "bg-background bg-linear-to-b from-white/10 to-black/10 dark:bg-input/30";
const control =
  "min-h-9 w-full min-w-0 rounded-md border border-input px-3 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-invalid:border-destructive data-invalid:ring-[3px] data-invalid:ring-destructive/20 dark:data-invalid:ring-destructive/40 motion-reduce:transition-none";
const action =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4";

const useMergedRefs = <Element,>(
  first: Ref<Element> | undefined,
  second: Ref<Element> | undefined,
  third?: Ref<Element>,
  fourth?: Ref<Element>
) =>
  useCallback(
    (node: Element | null) => {
      const refs = [first, second, third, fourth];
      const cleanups = refs.map((ref) => {
        if (typeof ref === "function") {
          const cleanup = ref(node);
          return typeof cleanup === "function" ? cleanup : () => ref(null);
        }
        if (ref) {
          ref.current = node;
          return () => {
            ref.current = null;
          };
        }
        return null;
      });
      return () => {
        for (const cleanup of cleanups) {
          cleanup?.();
        }
      };
    },
    [first, second, third, fourth]
  );

export const AutocompleteInput = (props: AutocompleteInputProps) => {
  const a = useAutocomplete();
  const combined = mergeProps(a.config.inputProps, props);
  const ref = useMergedRefs(
    a.inputRef,
    a.config.ref,
    a.config.inputProps?.ref,
    props.ref
  );
  return (
    <Combobox.Input
      {...combined}
      ref={ref}
      data-slot="autocomplete-input"
      form={a.config.form}
      aria-label={combined["aria-label"] ?? a.config.label}
      aria-invalid={a.config.invalid || combined["aria-invalid"]}
      aria-required={a.config.required || undefined}
      placeholder={combined.placeholder ?? a.config.placeholder}
      className={cn(
        control,
        surface,
        "h-9 placeholder:text-muted-foreground disabled:pointer-events-none",
        a.config.size === "sm" && "h-8 min-h-8",
        combined.className
      )}
      onCompositionStart={(event) => {
        combined.onCompositionStart?.(event);
        a.composing.current = true;
      }}
      onCompositionEnd={(event) => {
        combined.onCompositionEnd?.(event);
        a.composing.current = false;
        a.endingComposition.current = true;
      }}
      onBlur={(event) => {
        combined.onBlur?.(event);
        if (!event.defaultPrevented && !event.baseUIHandlerPrevented) {
          a.restore();
        }
      }}
      onChange={(event) => {
        combined.onChange?.(event);
        if (event.defaultPrevented) {
          event.preventBaseUIHandler();
        }
      }}
      onKeyDown={(event) => {
        combined.onKeyDown?.(event);
        if (event.defaultPrevented || event.baseUIHandlerPrevented) {
          event.preventBaseUIHandler();
          return;
        }
        const cancel = () => {
          event.preventDefault();
          event.preventBaseUIHandler();
        };
        if (
          event.key === "Enter" &&
          (a.composing.current ||
            event.nativeEvent.isComposing ||
            event.nativeEvent.keyCode === 229 ||
            a.endingComposition.current)
        ) {
          cancel();
          a.endingComposition.current = false;
          return;
        }
        if (event.key !== "Enter") {
          a.endingComposition.current = false;
        }
        if (a.config.disabled || a.config.readOnly) {
          return;
        }
        if (event.key === "Escape") {
          cancel();
          a.restore();
          a.setOpen(false);
        } else if (a.multiple && event.key === "Backspace" && !a.text) {
          const chips = a.chipsRef.current?.querySelectorAll<HTMLElement>(
            '[data-slot="autocomplete-chip"]'
          );
          if (chips?.length) {
            cancel();
            chips.item(chips.length - 1)?.focus();
          }
        } else if (a.multiple && !a.selection && event.key === "Enter") {
          const activeId = event.currentTarget.getAttribute(
            "aria-activedescendant"
          );
          if (!activeId) {
            cancel();
            a.createTag();
          } else if (
            // IDs may contain selector metacharacters (including React's colons).
            // eslint-disable-next-line unicorn/prefer-query-selector
            document.getElementById(activeId)?.getAttribute("aria-disabled") ===
            "true"
          ) {
            cancel();
          }
        }
      }}
    />
  );
};

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
const MotionPopup = motion.create(PopupElement);

export const AutocompleteContent = ({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  collisionBoundary,
  collisionPadding,
  ...props
}: AutocompleteContentProps & { children?: ReactNode }) => {
  const a = useAutocomplete();
  const reduced = useReducedMotion();
  const animated = a.config.animated !== false && !reduced;
  return (
    <Combobox.Portal style={{ left: 0, position: "absolute", top: 0 }}>
      <Combobox.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        className="isolate"
      >
        <Combobox.Popup
          {...props}
          data-slot="autocomplete-content"
          className={cn(
            "relative max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md outline-none",
            className
          )}
          render={(nativeProps, state) => (
            <MotionPopup
              nativeProps={nativeProps}
              initial={{
                opacity: animated ? 0 : 1,
                scale: animated ? 0.96 : 1,
              }}
              animate={{
                opacity: state.open ? 1 : 0,
                scale: animated && !state.open ? 0.96 : 1,
              }}
              transition={{
                duration: animated ? (state.open ? 0.18 : 0.12) : 0,
                ease: [0.22, 1, 0.36, 1],
              }}
              onAnimationComplete={() => {
                if (!state.open) {
                  a.actionsRef.current?.unmount();
                }
              }}
            >
              {nativeProps.children}
            </MotionPopup>
          )}
        >
          {children}
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  );
};
export const AutocompleteList = ({
  className,
  ...props
}: Combobox.List.Props) => {
  const a = useAutocomplete();
  return (
  <Combobox.List
    {...props}
    data-slot="autocomplete-list"
    onScroll={(event) => {
      props.onScroll?.(event);
      const page = a.config.pagination;
      const list = event.currentTarget;
      if (!event.defaultPrevented && page?.automatic !== false && list.scrollTop > 0 && list.scrollHeight > list.clientHeight && list.scrollHeight - list.clientHeight - list.scrollTop <= 48) {
        void a.loadPage().catch(() => undefined);
      }
    }}
    className={cn(
      "max-h-[min(20rem,var(--available-height))] overflow-y-auto overscroll-contain p-1",
      className
    )}
  />
  );
};
export const AutocompleteItem = <Item,>({
  value,
  className,
  children,
  disabled,
  ...props
}: Omit<Combobox.Item.Props, "value" | "render" | "className" | "style"> & {
  value: Item;
  className?: string;
  style?: ComponentProps<"div">["style"];
}) => {
  const a = useAutocomplete();
  const option = a.resolveOption(value);
  if (!option || a.config.loading || a.config.error || a.config.hintMessage) {
    return null;
  }
  const { id } = option;
  const locked = Boolean(
    disabled ||
    option?.disabled ||
    a.config.disabled ||
    a.config.readOnly ||
    a.config.loading ||
    a.config.error
  );
  const Primitive = a.textSingle ? BaseAutocomplete.Item : Combobox.Item;
  return (
    <Primitive
      {...props}
      value={id}
      disabled={locked}
      data-slot="autocomplete-item"
      className={cn(
        "relative flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
    >
      <span className="min-w-0 flex-1 break-words">
        {children ?? option?.label ?? String(value)}
      </span>
      {!a.textSingle && (
        <Combobox.ItemIndicator className="absolute right-2 [&_svg]:size-4">
          <CheckIcon aria-hidden="true" />
        </Combobox.ItemIndicator>
      )}
    </Primitive>
  );
};
export const AutocompleteGroup = ({
  className,
  ...props
}: Combobox.Group.Props) => (
  <Combobox.Group
    {...props}
    data-slot="autocomplete-group"
    className={cn("scroll-my-1", className)}
  />
);
export const AutocompleteGroupLabel = ({
  className,
  ...props
}: Combobox.GroupLabel.Props) => (
  <Combobox.GroupLabel
    {...props}
    data-slot="autocomplete-group-label"
    className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)}
  />
);
export const AutocompleteEmpty = ({
  children,
  className,
  ...props
}: ComponentProps<"div">) => {
  const a = useAutocomplete();
  if (a.options.length || a.config.loading || a.config.error || a.config.hintMessage) {
    return null;
  }
  return (
    <div
      {...props}
      role="status"
      data-slot="autocomplete-empty"
      className={cn("px-3 py-3 text-sm text-muted-foreground", className)}
    >
      {children ?? a.config.emptyMessage ?? "No results found."}
    </div>
  );
};
export const AutocompleteStatus = ({
  children,
  className,
  ...props
}: ComponentProps<"div">) => {
  const a = useAutocomplete();
  const message =
    a.config.error ||
    (a.config.loading
      ? (a.config.loadingMessage ?? "Loading suggestions…")
      : children);
  if (!message) {
    return null;
  }
  return (
    <div
      {...props}
      role="status"
      aria-live="polite"
      data-slot="autocomplete-status"
      className={cn("px-3 py-3 text-sm text-muted-foreground", className)}
    >
      {message}
    </div>
  );
};
export const AutocompleteClear = ({
  className,
  children,
  onClick,
  ...props
}: ComponentProps<"button">) => {
  const a = useAutocomplete();
  return (
    <button
      {...props}
      type="button"
      data-slot="autocomplete-clear"
      aria-label={props["aria-label"] ?? a.config.clearLabel ?? "Clear value"}
      disabled={props.disabled || a.config.disabled || a.config.readOnly}
      className={cn(action, className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          a.clear();
        }
      }}
    >
      {children ?? <XIcon aria-hidden="true" />}
    </button>
  );
};
export const AutocompleteTrigger = ({
  className,
  children,
  ...props
}: Combobox.Trigger.Props) => {
  const a = useAutocomplete();
  return (
    <Combobox.Trigger
      {...props}
      data-slot="autocomplete-trigger"
      disabled={props.disabled || a.config.disabled || a.config.readOnly}
      aria-label={props["aria-label"] ?? "Show suggestions"}
      className={cn(action, className)}
    >
      {children ?? <ChevronDownIcon aria-hidden="true" />}
    </Combobox.Trigger>
  );
};
export const AutocompleteChips = ({
  className,
  ...props
}: Combobox.Chips.Props) => {
  const a = useAutocomplete();
  const ref = useMergedRefs(a.chipsRef, props.ref);
  if (!a.multiple) {
    throw new Error("AutocompleteChips requires multiple.");
  }
  return (
    <Combobox.Chips
      {...props}
      ref={ref}
      data-slot="autocomplete-chips"
      className={cn(
        "flex min-w-0 flex-1 flex-wrap items-center gap-1 py-1",
        className
      )}
    />
  );
};
const ChipLabelContext = createContext("");
export const AutocompleteChip = ({
  className,
  label,
  children,
  ...props
}: Combobox.Chip.Props & { label: string }) => (
  <ChipLabelContext.Provider value={label}>
    <Combobox.Chip
      {...props}
      data-slot="autocomplete-chip"
      aria-label={props["aria-label"] ?? label}
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-sm bg-accent py-0.5 pr-0.5 pl-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      {children ?? <span className="min-w-0 truncate">{label}</span>}
    </Combobox.Chip>
  </ChipLabelContext.Provider>
);
export const AutocompleteChipRemove = ({
  className,
  children,
  ...props
}: Combobox.ChipRemove.Props) => {
  const a = useAutocomplete();
  const label = useContext(ChipLabelContext);
  return (
    <Combobox.ChipRemove
      {...props}
      data-slot="autocomplete-chip-remove"
      aria-label={
        props["aria-label"] ??
        a.config.removeLabel?.(label) ??
        `Remove ${label}`
      }
      disabled={props.disabled || a.config.disabled || a.config.readOnly}
      className={cn(action, "size-5 [&_svg]:size-3", className)}
    >
      {children ?? <XIcon aria-hidden="true" />}
    </Combobox.ChipRemove>
  );
};

const Assembly = <Item,>({ props }: { props: AutocompleteProps<Item> }) => {
  const a = useAutocomplete();
  const generatedId = useId();
  const id = props.inputProps?.id ?? generatedId;
  const [focused, setFocused] = useState(false);
  const floating = props.label && props.labelStyle === "floating";
  const raised = focused || a.text.length > 0 || a.selected.length > 0;
  const label = props.label ? (
    <label
      htmlFor={id}
      data-floating={raised}
      className={cn(
        "text-sm font-medium",
        floating &&
          "pointer-events-none absolute left-3 z-10 max-w-[calc(100%-1.5rem)] truncate bg-background px-1 font-normal text-muted-foreground transition-[top,transform] duration-150 motion-reduce:transition-none",
        floating &&
          (raised
            ? "top-0 -translate-y-1/2 text-xs"
            : "top-1/2 -translate-y-1/2")
      )}
    >
      {props.label}
    </label>
  ) : null;
  const editable = (
    <AutocompleteInput
      id={id}
      className={cn(
        "h-7 min-h-7 min-w-16 flex-1 rounded-none border-0 bg-transparent bg-none px-0 shadow-none focus-within:ring-0 dark:bg-transparent",
        floating && !raised && "placeholder:text-transparent"
      )}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
  const groups = groupAutocompleteItems(
    a.options,
    props.groupBy
      ? (option) => props.groupBy?.(option.item as Item) ?? ""
      : undefined
  );
  return (
    <div
      data-slot="autocomplete-field"
      className={cn("relative grid min-w-0 gap-1.5", props.className)}
    >
      {!floating && label}
      <div className="relative min-w-0">
        <Combobox.InputGroup
          data-slot="autocomplete-control"
          data-disabled={props.disabled || undefined}
          data-invalid={props.invalid || undefined}
          className={cn(
            control,
            surface,
            "flex items-center gap-1",
            props.size === "sm" && "min-h-8"
          )}
        >
          {a.multiple ? (
            <AutocompleteChips>
              {a.selected.map((entry) => (
                <AutocompleteChip key={entry.id} label={entry.label}>
                  <span className="min-w-0 truncate">{entry.label}</span>
                  <AutocompleteChipRemove />
                </AutocompleteChip>
              ))}
              {editable}
            </AutocompleteChips>
          ) : (
            editable
          )}
          {props.clearable && <AutocompleteClear />}
          {(props.showTrigger ?? a.selection) && <AutocompleteTrigger />}
        </Combobox.InputGroup>
        {floating && label}
      </div>
      <AutocompleteContent {...props.contentProps}>
        <AutocompleteFeedback />
        <AutocompleteList>
          {!props.loading &&
            !props.error &&
            !props.hintMessage &&
            groups.map((group, index) => (
              <AutocompleteGroup key={group.label ?? index}>
                {group.label !== undefined && (
                  <AutocompleteGroupLabel>{group.label}</AutocompleteGroupLabel>
                )}
                {group.items.map((option) => (
                  <AutocompleteItem key={option.id} value={option.item as Item}>
                    {props.renderItem?.(option.item as Item) ?? option.label}
                  </AutocompleteItem>
                ))}
              </AutocompleteGroup>
            ))}
        </AutocompleteList>
        <AutocompletePagination />
      </AutocompleteContent>
    </div>
  );
};
export const Autocomplete = <Item,>(props: AutocompleteProps<Item>) => (
  <AutocompleteRoot<Item> key="root" {...props}>
    <Assembly props={props} />
  </AutocompleteRoot>
);
export { AutocompleteRoot };
export { AutocompleteFeedback, AutocompletePagination };
export type {
  AutocompleteProps,
  AutocompleteRootProps,
  AutocompleteValue,
  AutocompleteMode,
  AutocompleteInputProps,
  AutocompleteContentProps,
} from "./autocomplete-types";
