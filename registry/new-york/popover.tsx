"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { Popover as Primitive } from "@base-ui/react/popover";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "cn";
import { motion, useReducedMotion } from "motion/react";
import { createContext, useContext, useEffect, useRef } from "react";
import type { ComponentProps } from "react";

const ActionsContext = createContext<(() => void) | null>(null);

export const Popover = <Payload,>({
  actionsRef,
  onOpenChange,
  ...props
}: Primitive.Root.Props<Payload>) => {
  const internalActions = useRef<Primitive.Root.Actions | null>(null);
  const actions = actionsRef ?? internalActions;
  return (
    <ActionsContext.Provider value={() => actions.current?.unmount()}>
      <Primitive.Root
        {...props}
        actionsRef={actions}
        onOpenChange={(open, details) => {
          onOpenChange?.(open, details);
          if (!open && !details.isCanceled) {
            details.preventUnmountOnClose();
          }
        }}
      />
    </ActionsContext.Provider>
  );
};

export const PopoverTrigger = (
  props: ComponentProps<typeof Primitive.Trigger>
) => <Primitive.Trigger data-slot="popover-trigger" {...props} />;

export const PopoverClose = (props: ComponentProps<typeof Primitive.Close>) => (
  <Primitive.Close data-slot="popover-close" {...props} />
);

const PopupElement = ({
  nativeProps,
  render,
  state,
  ref,
  ...props
}: ComponentProps<"div"> & {
  nativeProps: ComponentProps<"div">;
  render?: Primitive.Popup.Props["render"];
  state: Primitive.Popup.State;
}) =>
  useRender({
    props: mergeProps(nativeProps, props),
    ref: [nativeProps.ref ?? null, ref ?? null],
    render,
    state: { ...state },
  });
const MotionPopupElement = motion.create(PopupElement);

const AnimatedPopup = ({
  nativeProps,
  render,
  state,
  animated,
}: {
  nativeProps: ComponentProps<"div">;
  render?: Primitive.Popup.Props["render"];
  state: Primitive.Popup.State;
  animated: boolean;
}) => {
  const reduceMotion = useReducedMotion();
  const unmount = useContext(ActionsContext);
  const openRef = useRef(state.open);
  openRef.current = state.open;
  const animate = animated && !reduceMotion;
  useEffect(() => {
    if (!state.open && !animate) {
      unmount?.();
    }
  }, [state.open, animate, unmount]);
  return (
    <MotionPopupElement
      nativeProps={nativeProps}
      render={render}
      state={state}
      initial={{ opacity: animate ? 0 : 1, scale: animate ? 0.97 : 1 }}
      animate={{
        opacity: state.open ? 1 : 0,
        scale: animate && !state.open ? 0.97 : 1,
      }}
      transition={{
        duration: Number(animate) * (state.open ? 0.18 : 0.12),
        ease: [0.22, 1, 0.36, 1],
      }}
      onAnimationComplete={() => {
        if (!openRef.current) {
          unmount?.();
        }
      }}
    >
      {nativeProps.children}
    </MotionPopupElement>
  );
};

export type PopoverContentProps = Primitive.Popup.Props &
  Pick<
    Primitive.Positioner.Props,
    | "align"
    | "alignOffset"
    | "side"
    | "sideOffset"
    | "collisionPadding"
    | "collisionAvoidance"
    | "anchor"
  > & { animated?: boolean };

export const PopoverContent = ({
  align = "start",
  className,
  side = "bottom",
  sideOffset = 6,
  alignOffset = 0,
  collisionPadding = 8,
  collisionAvoidance,
  anchor,
  animated = true,
  render,
  ...props
}: PopoverContentProps) => (
  <Primitive.Portal>
    <Primitive.Positioner
      align={align}
      side={side}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      collisionPadding={collisionPadding}
      collisionAvoidance={collisionAvoidance}
      anchor={anchor}
      className="isolate z-50"
    >
      <Primitive.Popup
        data-slot="popover-content"
        className={cn(
          "flex w-72 max-w-[min(var(--available-width),calc(100vw-1rem))] max-h-(--available-height) origin-(--transform-origin) flex-col gap-3 overflow-y-auto overscroll-contain rounded-md border bg-popover p-4 text-sm text-popover-foreground shadow-md outline-none",
          className
        )}
        {...props}
        render={(nativeProps, state) => (
          <AnimatedPopup
            nativeProps={nativeProps}
            render={render}
            state={state}
            animated={animated}
          />
        )}
      />
    </Primitive.Positioner>
  </Primitive.Portal>
);

export const PopoverHeader = ({
  className,
  ...props
}: ComponentProps<"div">) => (
  <div
    data-slot="popover-header"
    className={cn("flex flex-col gap-1", className)}
    {...props}
  />
);
export const PopoverTitle = ({
  className,
  ...props
}: Primitive.Title.Props) => (
  <Primitive.Title
    data-slot="popover-title"
    className={cn("font-medium leading-snug", className)}
    {...props}
  />
);
export const PopoverDescription = ({
  className,
  ...props
}: Primitive.Description.Props) => (
  <Primitive.Description
    data-slot="popover-description"
    className={cn("text-sm leading-relaxed text-muted-foreground", className)}
    {...props}
  />
);
