"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "cn";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef } from "react";
import type { ComponentProps, ReactElement, ReactNode, RefObject } from "react";

type TabsVariant = "underline" | "pill" | "segmented";

interface TabsPanelItem<Value extends string = string> {
  value: Value;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
  link?: never;
  active?: never;
}

interface TabsLinkItem {
  link: ReactElement;
  active?: boolean;
  /** Optional stable identity for dynamic or reordered link collections. */
  key?: string;
  value?: never;
  label?: never;
  content?: never;
  disabled?: never;
}

type TabsCommonProps = Omit<
  ComponentProps<"div">,
  "children" | "defaultValue" | "ref"
> & {
  variant?: TabsVariant;
  orientation?: "horizontal" | "vertical";
  animated?: boolean;
  listClassName?: string;
};

type TabsPanelProps<Value extends string = string> = TabsCommonProps & {
  items: readonly TabsPanelItem<Value>[];
  value?: Value | null;
  defaultValue?: Value | null;
  onValueChange?: (
    value: Value | null,
    details: TabsPrimitive.Root.ChangeEventDetails
  ) => void;
  activationMode?: "manual" | "automatic";
  keepMounted?: boolean;
  contentClassName?: string;
  ref?: ComponentProps<"div">["ref"];
};

type TabsNavigationProps = TabsCommonProps & {
  items: readonly TabsLinkItem[];
  ref?: ComponentProps<"nav">["ref"];
  value?: never;
  defaultValue?: never;
  onValueChange?: never;
  activationMode?: never;
  keepMounted?: never;
  contentClassName?: never;
};

type TabsProps<Value extends string = string> =
  | TabsPanelProps<Value>
  | TabsNavigationProps;

const transition = { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const };

const listClasses = (variant: TabsVariant, vertical: boolean) =>
  cn(
    "isolate flex w-fit max-w-full items-center",
    vertical ? "flex-col items-stretch" : "min-w-0",
    variant === "underline" &&
      (vertical
        ? "gap-1 border-s border-border"
        : "gap-1 border-b border-border"),
    variant === "pill" && "gap-1",
    variant === "segmented" && "gap-1 rounded-lg bg-muted p-1"
  );

const triggerClasses = (variant: TabsVariant) =>
  cn(
    "relative inline-flex min-h-9 shrink-0 items-center justify-center gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-active:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    variant === "underline" ? "rounded-sm" : "rounded-md"
  );

const Indicator = ({
  variant,
  vertical,
  animated,
}: {
  variant: TabsVariant;
  vertical: boolean;
  animated: boolean;
}) => {
  const reduceMotion = useReducedMotion();
  const enabled = animated && !reduceMotion;
  return (
    <motion.span
      aria-hidden="true"
      data-slot="tabs-indicator"
      layoutId={enabled ? "active-indicator" : undefined}
      initial={false}
      transition={enabled ? transition : { duration: 0 }}
      className={cn(
        "pointer-events-none absolute",
        variant === "underline"
          ? cn(
              "bg-foreground",
              vertical
                ? "inset-y-2 -start-px w-0.5"
                : "inset-x-0 -bottom-px h-0.5"
            )
          : "inset-0 rounded-md",
        variant === "pill" && "bg-accent",
        variant === "segmented" && "border border-border bg-background"
      )}
      style={variant === "underline" ? undefined : { borderRadius: 6 }}
    />
  );
};

const TabButton = ({
  nativeProps,
  active,
  variant,
  vertical,
  animated,
}: {
  nativeProps: ComponentProps<"button">;
  active: boolean;
  variant: TabsVariant;
  vertical: boolean;
  animated: boolean;
}) =>
  useRender({
    defaultTagName: "button",
    props: {
      ...nativeProps,
      children: (
        <>
          {active && (
            <Indicator
              variant={variant}
              vertical={vertical}
              animated={animated}
            />
          )}
          <span className="relative z-10 inline-flex items-center gap-2">
            {nativeProps.children}
          </span>
        </>
      ),
    },
    ref: nativeProps.ref,
  });

const NavigationItem = ({
  item,
  variant,
  vertical,
  animated,
}: {
  item: TabsLinkItem;
  variant: TabsVariant;
  vertical: boolean;
  animated: boolean;
}) => {
  const link = useRender({
    defaultTagName: "a",
    props: {
      "aria-current": item.active ? "page" : undefined,
      className: cn(triggerClasses(variant), "z-10 w-full"),
      "data-active": item.active ? "" : undefined,
      "data-slot": "tabs-link",
    },
    render: item.link,
  });
  return (
    <div className="relative shrink-0">
      {item.active && (
        <Indicator variant={variant} vertical={vertical} animated={animated} />
      )}
      {link}
    </div>
  );
};

const PanelBody = ({
  children,
  hidden,
  animated,
  hydrated,
}: {
  children: ReactNode;
  hidden: boolean;
  animated: boolean;
  hydrated: RefObject<boolean>;
}) => {
  const reduceMotion = useReducedMotion();
  const enabled = animated && !reduceMotion;
  return (
    <motion.div
      initial={enabled && hydrated.current ? { opacity: 0 } : false}
      animate={{ opacity: hidden ? 0 : 1 }}
      transition={
        enabled ? { duration: 0.16, ease: transition.ease } : { duration: 0 }
      }
    >
      {children}
    </motion.div>
  );
};

const isNavigation = <Value extends string>(
  props: TabsProps<Value>
): props is TabsNavigationProps =>
  props.items.length > 0 && props.items[0].link !== undefined;

const Tabs = <Value extends string = string>(props: TabsProps<Value>) => {
  const id = useId();
  const hydrated = useRef(false);
  useEffect(() => {
    hydrated.current = true;
  }, []);

  if (props.items.length === 0) {
    return null;
  }

  if (isNavigation(props)) {
    const {
      items,
      variant = "underline",
      orientation = "horizontal",
      animated = true,
      className,
      listClassName,
      ...nativeProps
    } = props;
    return (
      <LayoutGroup id={id}>
        <nav
          {...nativeProps}
          data-slot="tabs"
          data-variant={variant}
          data-orientation={orientation}
          className={cn("max-w-full", className)}
        >
          <motion.div layoutScroll className="max-w-full overflow-x-auto p-1">
            <div
              data-slot="tabs-list"
              className={cn(
                listClasses(variant, orientation === "vertical"),
                listClassName
              )}
            >
              {items.map((item, index) => (
                <NavigationItem
                  key={item.key ?? item.link.key ?? index}
                  item={item}
                  variant={variant}
                  vertical={orientation === "vertical"}
                  animated={animated}
                />
              ))}
            </div>
          </motion.div>
        </nav>
      </LayoutGroup>
    );
  }

  const {
    items,
    variant = "underline",
    orientation = "horizontal",
    animated = true,
    activationMode = "manual",
    keepMounted = false,
    className,
    listClassName,
    contentClassName,
    defaultValue,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...rootProps
  } = props as TabsPanelProps<Value>;
  return (
    <LayoutGroup id={id}>
      <TabsPrimitive.Root
        {...rootProps}
        defaultValue={
          defaultValue === undefined
            ? (items.find((item) => !item.disabled)?.value ?? null)
            : defaultValue
        }
        orientation={orientation}
        data-slot="tabs"
        data-variant={variant}
        className={cn(
          "flex min-w-0 gap-4",
          orientation === "vertical" ? "flex-row" : "flex-col",
          className
        )}
      >
        <motion.div
          layoutScroll
          className="max-w-full shrink-0 overflow-x-auto p-1"
        >
          <TabsPrimitive.List
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            activateOnFocus={activationMode === "automatic"}
            data-slot="tabs-list"
            className={cn(
              listClasses(variant, orientation === "vertical"),
              listClassName
            )}
          >
            {items.map((item) => (
              <TabsPrimitive.Tab
                key={item.value}
                value={item.value}
                id={`${id}-tab-${encodeURIComponent(item.value)}`}
                disabled={item.disabled}
                data-slot="tabs-trigger"
                className={triggerClasses(variant)}
                render={(nativeProps, state) => (
                  <TabButton
                    nativeProps={{
                      ...nativeProps,
                      "aria-controls":
                        state.active || keepMounted
                          ? `${id}-panel-${encodeURIComponent(item.value)}`
                          : undefined,
                    }}
                    active={state.active}
                    variant={variant}
                    vertical={orientation === "vertical"}
                    animated={animated}
                  />
                )}
              >
                {item.label}
              </TabsPrimitive.Tab>
            ))}
          </TabsPrimitive.List>
        </motion.div>
        {items.map((item) => (
          <TabsPrimitive.Panel
            key={item.value}
            value={item.value}
            id={`${id}-panel-${encodeURIComponent(item.value)}`}
            aria-labelledby={`${id}-tab-${encodeURIComponent(item.value)}`}
            keepMounted={keepMounted}
            data-slot="tabs-content"
            className={cn(
              "min-w-0 flex-1 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
              contentClassName
            )}
            render={(nativeProps, state) => (
              <div {...nativeProps}>
                <PanelBody
                  hidden={state.hidden}
                  animated={animated}
                  hydrated={hydrated}
                >
                  {nativeProps.children}
                </PanelBody>
              </div>
            )}
          >
            {item.content}
          </TabsPrimitive.Panel>
        ))}
      </TabsPrimitive.Root>
    </LayoutGroup>
  );
};

export { Tabs };
export type {
  TabsLinkItem,
  TabsNavigationProps,
  TabsPanelItem,
  TabsPanelProps,
  TabsProps,
  TabsVariant,
};
