"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "cn";
import { ChevronDownIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ComponentProps, ReactNode } from "react";

const panelContext = createContext({
  hiddenUntilFound: false,
  keepMounted: false,
});
const transition = { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const };

const PanelElement = ({
  nativeProps,
  render,
  state,
  ref,
  ...props
}: ComponentProps<"div"> & {
  nativeProps: ComponentProps<"div">;
  render?: AccordionPrimitive.Panel.Props["render"];
  state: AccordionPrimitive.Panel.State;
}) =>
  useRender({
    props: mergeProps(nativeProps, props),
    ref: [nativeProps.ref ?? null, ref ?? null],
    render,
    state: { ...state },
  });
const MotionPanelElement = motion.create(PanelElement);

const TriggerElement = ({
  nativeProps,
  state,
  render,
  children,
}: {
  nativeProps: ComponentProps<"button">;
  state: AccordionPrimitive.Trigger.State;
  render?: AccordionPrimitive.Trigger.Props["render"];
  children: ComponentProps<"button">["children"];
}) =>
  useRender({
    defaultTagName: "button",
    props: { ...nativeProps, children },
    ref: nativeProps.ref ?? null,
    render,
    state: { ...state },
  });

const AnimatedPanel = ({
  nativeProps,
  render,
  state,
  keepMounted,
  hiddenUntilFound,
}: {
  nativeProps: ComponentProps<"div">;
  render?: AccordionPrimitive.Panel.Props["render"];
  state: AccordionPrimitive.Panel.State;
  keepMounted: boolean;
  hiddenUntilFound: boolean;
}) => {
  const reduceMotion = useReducedMotion();
  const [retained, setRetained] = useState(state.open);
  const openRef = useRef(state.open);
  useEffect(() => {
    openRef.current = state.open;
    if (state.open) {
      setRetained(true);
    }
  }, [state.open]);
  const visible = state.open || retained;
  return (
    <MotionPanelElement
      nativeProps={{
        ...nativeProps,
        hidden: visible ? false : nativeProps.hidden,
      }}
      render={render}
      state={state}
      initial={false}
      animate={{ height: state.open ? "auto" : 0, opacity: state.open ? 1 : 0 }}
      transition={{
        ...transition,
        duration: reduceMotion ? 0 : transition.duration,
      }}
      inert={!state.open}
      aria-hidden={state.open ? undefined : true}
      onAnimationComplete={() => {
        if (!openRef.current) {
          setRetained(false);
        }
      }}
    >
      {visible || keepMounted || hiddenUntilFound ? nativeProps.children : null}
    </MotionPanelElement>
  );
};

const Accordion = <Value,>({
  className,
  keepMounted = false,
  hiddenUntilFound = false,
  ...props
}: AccordionPrimitive.Root.Props<Value>) => (
  <panelContext.Provider value={{ hiddenUntilFound, keepMounted }}>
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col", className)}
      {...props}
      keepMounted={keepMounted}
      hiddenUntilFound={hiddenUntilFound}
    />
  </panelContext.Provider>
);

const AccordionItem = ({
  className,
  ...props
}: AccordionPrimitive.Item.Props) => (
  <AccordionPrimitive.Item
    data-slot="accordion-item"
    className={cn("not-last:border-b", className)}
    {...props}
  />
);

type AccordionTriggerProps = AccordionPrimitive.Trigger.Props & {
  icon?: ReactNode;
  expandedIcon?: ReactNode;
  iconRotation?: number;
};

const AccordionTrigger = ({
  className,
  children,
  render,
  icon = <ChevronDownIcon />,
  expandedIcon,
  iconRotation = 180,
  ...props
}: AccordionTriggerProps) => {
  const reduceMotion = useReducedMotion();
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger flex flex-1 cursor-pointer items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium outline-none hover:not-data-disabled:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 data-disabled:cursor-not-allowed data-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
          className
        )}
        {...props}
        render={(nativeProps, state) => (
          <TriggerElement
            nativeProps={nativeProps}
            state={state}
            render={render}
          >
            {children}
            {icon !== null && icon !== false && (
              <motion.span
                aria-hidden="true"
                data-slot="accordion-trigger-icon"
                className="pointer-events-none relative mt-0.5 inline-grid size-4 shrink-0 place-items-center text-muted-foreground"
                initial={false}
                animate={{
                  rotate:
                    state.open && expandedIcon === undefined ? iconRotation : 0,
                }}
                transition={{
                  ...transition,
                  duration: reduceMotion ? 0 : transition.duration,
                }}
              >
                {expandedIcon === undefined ? (
                  icon
                ) : (
                  <>
                    <motion.span
                      className="col-start-1 row-start-1 inline-flex"
                      initial={false}
                      animate={{
                        opacity: state.open ? 0 : 1,
                        scale: state.open ? 0.85 : 1,
                      }}
                      transition={{
                        ...transition,
                        duration: reduceMotion ? 0 : transition.duration,
                      }}
                    >
                      {icon}
                    </motion.span>
                    <motion.span
                      className="col-start-1 row-start-1 inline-flex"
                      initial={false}
                      animate={{
                        opacity: state.open ? 1 : 0,
                        scale: state.open ? 1 : 0.85,
                      }}
                      transition={{
                        ...transition,
                        duration: reduceMotion ? 0 : transition.duration,
                      }}
                    >
                      {expandedIcon}
                    </motion.span>
                  </>
                )}
              </motion.span>
            )}
          </TriggerElement>
        )}
      />
    </AccordionPrimitive.Header>
  );
};

const AccordionContent = ({
  className,
  children,
  render,
  keepMounted,
  hiddenUntilFound,
  ...props
}: AccordionPrimitive.Panel.Props) => {
  const defaults = useContext(panelContext);
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="overflow-hidden text-sm"
      {...props}
      keepMounted
      hiddenUntilFound={hiddenUntilFound ?? defaults.hiddenUntilFound}
      render={(nativeProps, state) => (
        <AnimatedPanel
          nativeProps={nativeProps}
          state={state}
          render={render}
          keepMounted={keepMounted ?? defaults.keepMounted}
          hiddenUntilFound={hiddenUntilFound ?? defaults.hiddenUntilFound}
        />
      )}
    >
      <div
        className={cn(
          "pt-0 pb-4 [&_a]:underline [&_a]:underline-offset-4 [&_p:not(:last-child)]:mb-4",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
};

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
export type { AccordionTriggerProps };
