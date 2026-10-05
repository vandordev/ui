"use client";

/*
 * Adapted from shadcn/ui Base Nova dropdown-menu.
 * MIT License — Copyright (c) 2026 Shadcn Labs
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { Menu as Primitive } from "@base-ui/react/menu";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "cn";
import { CheckIcon, ChevronRightIcon, LoaderCircleIcon } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useAnimate as useAnimateMini } from "motion/react-mini";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type {
  ComponentProps,
  ComponentType,
  ReactElement,
  ReactNode,
  RefObject,
  SVGProps,
} from "react";

export const DropdownRoot = Primitive.Root;
export const DropdownSub = Primitive.SubmenuRoot;
export const DropdownGroup = Primitive.Group;
export const DropdownRadioGroup = Primitive.RadioGroup;

export const DropdownTrigger = (
  props: ComponentProps<typeof Primitive.Trigger>
) => <Primitive.Trigger data-slot="dropdown-trigger" {...props} />;

// Motion's native animations are visible to Base UI's animation lifecycle.
// Base UI owns unmounting, completion callbacks, focus return and interrupted exits.
const AnimatedPopup = ({
  nativeProps,
  state,
  render,
  animated,
}: {
  nativeProps: ComponentProps<"div">;
  state: Primitive.Popup.State;
  render?: Primitive.Popup.Props["render"];
  animated: boolean;
}) => {
  const [scope, animate] = useAnimateMini<HTMLDivElement>();
  const reduceMotion = useReducedMotion();
  useLayoutEffect(() => {
    const element = scope.current;
    if (!element) {
      return;
    }
    const opacity = state.open ? 1 : 0;
    const scale = state.open ? 1 : 0.97;
    if (!animated || reduceMotion || typeof element.animate !== "function") {
      element.style.opacity = String(opacity);
      element.style.scale = "1";
      return;
    }
    const animation = animate(
      [element],
      { opacity, scale },
      {
        duration: state.open ? 0.18 : 0.12,
        ease: [0.22, 1, 0.36, 1],
      }
    );
    for (const nativeAnimation of element.getAnimations()) {
      // Interrupted animations reject finished; rapid reopen is expected.
      // eslint-disable-next-line promise/prefer-await-to-then
      nativeAnimation.finished.catch(() => {
        // Cancellation is expected when a transition is interrupted.
      });
    }
    return () => animation.stop();
  }, [animate, animated, reduceMotion, scope, state.open]);
  return useRender({
    props: { ...nativeProps },
    ref: [nativeProps.ref ?? null, scope],
    render,
    state: { ...state },
  });
};

export type DropdownContentProps = Primitive.Popup.Props &
  Pick<
    Primitive.Positioner.Props,
    | "side"
    | "sideOffset"
    | "align"
    | "alignOffset"
    | "collisionPadding"
    | "collisionAvoidance"
    | "anchor"
  > & {
    animated?: boolean;
    keepMounted?: boolean;
  };

export const DropdownContent = ({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  collisionPadding = 8,
  collisionAvoidance,
  anchor,
  animated = true,
  keepMounted = false,
  className,
  render,
  ...props
}: DropdownContentProps) => (
  <Primitive.Portal
    keepMounted={keepMounted}
    style={{ left: 0, position: "absolute", top: 0 }}
  >
    <Primitive.Positioner
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      collisionAvoidance={collisionAvoidance}
      anchor={anchor}
      className="isolate z-50 outline-none"
    >
      <Primitive.Popup
        data-slot="dropdown-content"
        className={cn(
          "max-h-(--available-height) max-w-[min(var(--available-width),calc(100vw-1rem))] min-w-40 origin-(--transform-origin) scale-[0.97] overflow-x-hidden overflow-y-auto overscroll-contain rounded-lg bg-popover p-1 text-popover-foreground opacity-0 shadow-md ring-1 ring-foreground/10 outline-none",
          className
        )}
        {...props}
        render={(nativeProps, state) => (
          <AnimatedPopup
            nativeProps={nativeProps}
            state={state}
            render={render}
            animated={animated}
          />
        )}
      />
    </Primitive.Positioner>
  </Primitive.Portal>
);

export const DropdownSubContent = ({
  side = "inline-end",
  alignOffset = -3,
  sideOffset = 0,
  ...props
}: DropdownContentProps) => (
  <DropdownContent
    side={side}
    alignOffset={alignOffset}
    sideOffset={sideOffset}
    {...props}
  />
);

const itemClass =
  "relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:ps-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";
const destructiveClass =
  "data-[variant=destructive]:text-destructive data-[variant=destructive]:data-highlighted:bg-destructive/10 data-[variant=destructive]:data-highlighted:text-destructive";

export type DropdownItemProps = Primitive.Item.Props & {
  inset?: boolean;
  variant?: "default" | "destructive";
};
export const DropdownItem = ({
  className,
  inset,
  variant = "default",
  ...props
}: DropdownItemProps) => (
  <Primitive.Item
    data-slot="dropdown-item"
    data-inset={inset || undefined}
    data-variant={variant}
    className={cn(itemClass, destructiveClass, className)}
    {...props}
  />
);

export const DropdownLinkItem = ({
  className,
  ...props
}: Primitive.LinkItem.Props) => (
  <Primitive.LinkItem
    data-slot="dropdown-link-item"
    className={cn(itemClass, className)}
    {...props}
  />
);

export const DropdownSubTrigger = ({
  className,
  inset,
  children,
  ...props
}: Primitive.SubmenuTrigger.Props & { inset?: boolean }) => (
  <Primitive.SubmenuTrigger
    data-slot="dropdown-sub-trigger"
    data-inset={inset || undefined}
    className={cn(
      itemClass,
      "data-popup-open:bg-accent data-popup-open:text-accent-foreground",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRightIcon aria-hidden="true" className="ms-auto rtl:rotate-180" />
  </Primitive.SubmenuTrigger>
);

export const DropdownLabel = ({
  className,
  inset,
  ...props
}: Primitive.GroupLabel.Props & { inset?: boolean }) => (
  <Primitive.GroupLabel
    data-slot="dropdown-label"
    data-inset={inset || undefined}
    className={cn(
      "px-1.5 py-1 text-xs font-medium text-muted-foreground data-inset:ps-7",
      className
    )}
    {...props}
  />
);
export const DropdownSeparator = ({
  className,
  ...props
}: Primitive.Separator.Props) => (
  <Primitive.Separator
    data-slot="dropdown-separator"
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
);
export const DropdownShortcut = ({
  className,
  ...props
}: ComponentProps<"span">) => (
  <span
    data-slot="dropdown-shortcut"
    className={cn(
      "ms-auto text-xs tracking-widest text-muted-foreground",
      className
    )}
    {...props}
  />
);

export const DropdownCheckboxItem = ({
  className,
  children,
  inset,
  ...props
}: Primitive.CheckboxItem.Props & { inset?: boolean }) => (
  <Primitive.CheckboxItem
    data-slot="dropdown-checkbox-item"
    data-inset={inset || undefined}
    className={cn(itemClass, "pe-8", className)}
    {...props}
  >
    {children}
    <Primitive.CheckboxItemIndicator className="pointer-events-none absolute end-2 flex items-center justify-center">
      <CheckIcon aria-hidden="true" />
    </Primitive.CheckboxItemIndicator>
  </Primitive.CheckboxItem>
);
export const DropdownRadioItem = ({
  className,
  children,
  inset,
  ...props
}: Primitive.RadioItem.Props & { inset?: boolean }) => (
  <Primitive.RadioItem
    data-slot="dropdown-radio-item"
    data-inset={inset || undefined}
    className={cn(itemClass, "pe-8", className)}
    {...props}
  >
    {children}
    <Primitive.RadioItemIndicator className="pointer-events-none absolute end-2 flex items-center justify-center">
      <CheckIcon aria-hidden="true" />
    </Primitive.RadioItemIndicator>
  </Primitive.RadioItem>
);

interface DropdownEntryBase {
  id: string;
  label: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  disabled?: boolean;
}
export interface DropdownAction extends DropdownEntryBase {
  type?: "item";
  shortcut?: string;
  variant?: "default" | "destructive";
  closeOnSelect?: boolean | "success";
  onSelect?: (
    event: Parameters<NonNullable<Primitive.Item.Props["onClick"]>>[0]
  ) => unknown;
  onSelectError?: (error: unknown) => void;
  link?: never;
  renderOverlay?: never;
}
export interface DropdownLink extends Omit<DropdownEntryBase, "disabled"> {
  type?: "item";
  shortcut?: string;
  link: ReactElement;
  closeOnSelect?: boolean;
  disabled?: never;
  variant?: never;
  onSelect?: never;
  onSelectError?: never;
  renderOverlay?: never;
}
export interface DropdownOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  finalFocus: RefObject<HTMLElement | null>;
}
export interface DropdownOverlay extends DropdownEntryBase {
  type?: "item";
  shortcut?: string;
  variant?: "default" | "destructive";
  renderOverlay: (props: DropdownOverlayProps) => ReactNode;
  link?: never;
  onSelect?: never;
  onSelectError?: never;
  closeOnSelect?: never;
}
export interface DropdownItemGroup {
  id: string;
  type: "group";
  label?: string;
  items: readonly DropdownEntry[];
}
export interface DropdownSubmenu extends DropdownEntryBase {
  type: "submenu";
  items: readonly DropdownEntry[];
}
export interface DropdownDivider {
  id: string;
  type: "separator";
}
export type DropdownEntry =
  | DropdownAction
  | DropdownLink
  | DropdownOverlay
  | DropdownItemGroup
  | DropdownSubmenu
  | DropdownDivider;

const DropdownItems = ({
  items,
  animated,
  path = [],
  pending,
  select,
  openOverlay,
}: {
  items: readonly DropdownEntry[];
  animated: boolean;
  path?: readonly string[];
  pending: string | null;
  select: (
    item: DropdownAction,
    key: string,
    event: Parameters<NonNullable<Primitive.Item.Props["onClick"]>>[0]
  ) => void;
  openOverlay: (key: string) => void;
}) => (
  <DropdownGroup>
    {items.map((item) => {
      const itemPath = [...path, item.id];
      const key = JSON.stringify(itemPath);
      if (item.type === "separator") {
        return <DropdownSeparator key={item.id} />;
      }
      if (item.type === "group") {
        return (
          <DropdownGroup key={item.id}>
            {item.label !== undefined && (
              <DropdownLabel>{item.label}</DropdownLabel>
            )}
            <DropdownItems
              items={item.items}
              animated={animated}
              path={itemPath}
              pending={pending}
              select={select}
              openOverlay={openOverlay}
            />
          </DropdownGroup>
        );
      }
      const Icon = item.icon;
      const label = (
        <>
          {pending === key ? (
            <LoaderCircleIcon
              aria-hidden="true"
              className="animate-spin motion-reduce:animate-none"
            />
          ) : (
            Icon && <Icon aria-hidden="true" />
          )}
          <span className="min-w-0 flex-1 break-words">{item.label}</span>
        </>
      );
      if (item.type === "submenu") {
        return (
          <DropdownSub
            key={item.id}
            disabled={item.disabled || pending !== null}
          >
            <DropdownSubTrigger
              disabled={item.disabled || pending !== null}
              label={item.label}
            >
              {label}
            </DropdownSubTrigger>
            <DropdownSubContent animated={animated}>
              <DropdownItems
                items={item.items}
                animated={animated}
                path={itemPath}
                pending={pending}
                select={select}
                openOverlay={openOverlay}
              />
            </DropdownSubContent>
          </DropdownSub>
        );
      }
      if (item.link) {
        // LinkItem has no disabled contract. A pending link becomes a disabled
        // action row so native/router navigation cannot bypass the action lock.
        if (pending !== null) {
          return (
            <DropdownItem key={item.id} disabled label={item.label}>
              {label}
            </DropdownItem>
          );
        }
        return (
          <DropdownLinkItem
            key={item.id}
            label={item.label}
            render={item.link}
            closeOnClick={item.closeOnSelect ?? true}
          >
            {label}
            {item.shortcut && (
              <DropdownShortcut>{item.shortcut}</DropdownShortcut>
            )}
          </DropdownLinkItem>
        );
      }
      return (
        <DropdownItem
          key={item.id}
          disabled={item.disabled || pending !== null}
          aria-busy={pending === key || undefined}
          label={item.label}
          variant={item.variant}
          closeOnClick={false}
          onClick={(event) => {
            if (item.renderOverlay) {
              openOverlay(key);
            } else {
              select(item, key, event);
            }
          }}
        >
          {label}
          {item.shortcut && (
            <DropdownShortcut>{item.shortcut}</DropdownShortcut>
          )}
        </DropdownItem>
      );
    })}
  </DropdownGroup>
);

export type DropdownProps = Omit<Primitive.Root.Props, "children"> & {
  trigger: ReactElement;
  items: readonly DropdownEntry[];
  animated?: boolean;
  triggerProps?: Omit<
    ComponentProps<typeof DropdownTrigger>,
    "children" | "render"
  >;
  contentProps?: Omit<DropdownContentProps, "children" | "animated">;
};

export const Dropdown = ({
  trigger,
  items,
  animated = true,
  triggerProps,
  contentProps,
  actionsRef,
  onOpenChange,
  onOpenChangeComplete,
  ...props
}: DropdownProps) => {
  const localActions = useRef<Primitive.Root.Actions | null>(null);
  const actions = actionsRef ?? localActions;
  const triggerRef = useRef<HTMLElement | null>(null);
  const { ref: consumerRef, ...nativeTriggerProps } = triggerProps ?? {};
  const renderedTrigger = useRender({
    defaultTagName: "button",
    render: trigger,
    ref: [triggerRef, consumerRef ?? null],
  });
  const [pending, setPending] = useState<string | null>(null);
  const pendingRef = useRef<string | null>(null);
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
  const queuedOverlay = useRef<string | null>(null);
  const session = useRef(0);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  // Controlled changes can happen without an onOpenChange request.
  useLayoutEffect(() => {
    session.current += 1;
    if (props.open) {
      queuedOverlay.current = null;
    }
  }, [props.open]);
  const close = () => actions.current?.close();
  const reportError = (item: DropdownAction, error: unknown) => {
    if (!mounted.current) {
      return;
    }
    if (item.onSelectError) {
      try {
        item.onSelectError(error);
      } catch (handlerError) {
        console.error("Dropdown onSelectError failed.", handlerError);
      }
    } else {
      console.error(
        "Dropdown action failed. Provide onSelectError to handle the error.",
        error
      );
    }
  };
  const select = (
    item: DropdownAction,
    key: string,
    event: Parameters<NonNullable<Primitive.Item.Props["onClick"]>>[0]
  ) => {
    if (pendingRef.current !== null || item.disabled) {
      return;
    }
    const startedIn = session.current;
    let result: unknown;
    try {
      result = item.onSelect?.(event);
    } catch (error) {
      reportError(item, error);
      return;
    }
    const shouldClose =
      !event.defaultPrevented && !event.baseUIHandlerPrevented;
    if (
      result &&
      (typeof result === "object" || typeof result === "function") &&
      "then" in result &&
      typeof result.then === "function"
    ) {
      pendingRef.current = key;
      setPending(key);
      if (
        item.closeOnSelect !== false &&
        item.closeOnSelect !== "success" &&
        shouldClose
      ) {
        close();
      }
      const settle = async () => {
        try {
          await result;
          if (
            mounted.current &&
            item.closeOnSelect === "success" &&
            shouldClose &&
            session.current === startedIn
          ) {
            close();
          }
        } catch (error) {
          reportError(item, error);
        } finally {
          if (mounted.current) {
            pendingRef.current = null;
            setPending(null);
          }
        }
      };
      // The DOM callback stays synchronous; all rejections are handled above.
      void settle();
    } else if (item.closeOnSelect !== false && shouldClose) {
      close();
    }
  };
  const overlays: { key: string; item: DropdownOverlay }[] = [];
  const collect = (
    entries: readonly DropdownEntry[],
    path: readonly string[] = []
  ) => {
    for (const item of entries) {
      const itemPath = [...path, item.id];
      if (item.type === "group" || item.type === "submenu") {
        collect(item.items, itemPath);
      } else if ("renderOverlay" in item && item.renderOverlay) {
        overlays.push({ key: JSON.stringify(itemPath), item });
      }
    }
  };
  collect(items);
  return (
    <>
      <DropdownRoot
        {...props}
        actionsRef={actions}
        onOpenChange={(open, details) => {
          onOpenChange?.(open, details);
          if (details.isCanceled) {
            queuedOverlay.current = null;
            return;
          }
          session.current += 1;
          if (open) {
            queuedOverlay.current = null;
          }
        }}
        onOpenChangeComplete={(open) => {
          if (!open && queuedOverlay.current) {
            setActiveOverlay(queuedOverlay.current);
            queuedOverlay.current = null;
          }
          onOpenChangeComplete?.(open);
        }}
      >
        <DropdownTrigger {...nativeTriggerProps} render={renderedTrigger} />
        <DropdownContent
          {...contentProps}
          animated={animated}
          aria-busy={pending !== null || undefined}
        >
          <DropdownItems
            items={items}
            animated={animated}
            pending={pending}
            select={select}
            openOverlay={(key) => {
              if (pendingRef.current !== null) {
                return;
              }
              queuedOverlay.current = key;
              close();
            }}
          />
        </DropdownContent>
      </DropdownRoot>
      {overlays.map(({ key, item }) => (
        <OverlayRenderer
          key={key}
          item={item}
          open={activeOverlay === key}
          finalFocus={triggerRef}
          onOpenChange={(open) => {
            setActiveOverlay((current) =>
              open ? key : current === key ? null : current
            );
          }}
        />
      ))}
    </>
  );
};

const OverlayRenderer = ({
  item,
  ...props
}: DropdownOverlayProps & { item: DropdownOverlay }) => (
  <>{item.renderOverlay(props)}</>
);
