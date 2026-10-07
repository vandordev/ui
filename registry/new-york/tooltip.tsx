"use client";

// Adapted from shadcn/ui's Base Nova Tooltip (MIT).
// https://ui.shadcn.com/docs/components/base/tooltip
/*
MIT License
Copyright (c) 2023 shadcn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
import { mergeProps } from "@base-ui/react/merge-props";
import { Tooltip as Primitive } from "@base-ui/react/tooltip";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "cn";
import { motion, useReducedMotion } from "motion/react";
import { createContext, useContext, useEffect, useRef } from "react";
import type { ComponentProps, Ref } from "react";

const ActionsContext = createContext<(() => void) | null>(null);

export const TooltipProvider = ({
  delay = 0,
  ...props
}: Primitive.Provider.Props) => <Primitive.Provider delay={delay} {...props} />;

export const Tooltip = <Payload,>({
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

export const TooltipTrigger = <Payload,>(
  props: Primitive.Trigger.Props<Payload> & { ref?: Ref<HTMLElement> }
) => <Primitive.Trigger data-slot="tooltip-trigger" {...props} />;

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
const tooltipOffsets: Partial<
  Record<Primitive.Popup.State["side"], { x: number; y: number }>
> = {
  bottom: { x: 0, y: -4 },
  left: { x: 4, y: 0 },
  right: { x: -4, y: 0 },
  top: { x: 0, y: 4 },
};
const visiblePose = { opacity: 1, scale: 1, x: 0, y: 0 };

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
  const animate = animated && !reduceMotion && !state.instant;
  // Follow the collision-resolved side, not just the requested placement.
  const offset = tooltipOffsets[state.side] ?? { x: 0, y: 0 };
  const hiddenPose = {
    opacity: 0,
    scale: animate ? 0.98 : 1,
    x: animate ? offset.x : 0,
    y: animate ? offset.y : 0,
  };
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
      initial={animate ? hiddenPose : visiblePose}
      animate={state.open ? visiblePose : hiddenPose}
      transition={{
        duration: Number(animate) * (state.open ? 0.22 : 0.16),
        ease: state.open ? [0.22, 1, 0.36, 1] : [0.4, 0, 1, 1],
        opacity: { duration: Number(animate) * (state.open ? 0.18 : 0.14) },
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

export type TooltipContentProps = Primitive.Popup.Props &
  Pick<
    Primitive.Positioner.Props,
    | "align"
    | "alignOffset"
    | "side"
    | "sideOffset"
    | "collisionPadding"
    | "collisionAvoidance"
    | "anchor"
  > & { animated?: boolean; showArrow?: boolean };

export const TooltipContent = ({
  align = "center",
  alignOffset = 0,
  side = "top",
  sideOffset = 4,
  collisionPadding = 8,
  collisionAvoidance,
  anchor,
  animated = true,
  showArrow = true,
  className,
  children,
  render,
  ...props
}: TooltipContentProps) => (
  <Primitive.Portal style={{ left: 0, position: "absolute", top: 0 }}>
    <Primitive.Positioner
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      collisionAvoidance={collisionAvoidance}
      anchor={anchor}
      className="isolate z-50"
    >
      <Primitive.Popup
        data-slot="tooltip-content"
        className={cn(
          "relative w-max max-w-[min(20rem,var(--available-width),calc(100vw-1rem))] origin-(--transform-origin) rounded-md bg-foreground px-3 py-1.5 text-xs leading-relaxed text-background wrap-break-word outline-none",
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
      >
        {children}
        {showArrow && (
          <Primitive.Arrow
            data-slot="tooltip-arrow"
            className="size-2 rotate-45 rounded-[2px] bg-foreground data-[side=top]:-bottom-1 data-[side=bottom]:-top-1 data-[side=left]:-right-1 data-[side=right]:-left-1"
          />
        )}
      </Primitive.Popup>
    </Primitive.Positioner>
  </Primitive.Portal>
);
