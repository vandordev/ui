"use client";

import { cn } from "cn";
import { MinusIcon, PlusIcon } from "lucide-react";
import type * as React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";
import type { AccordionTriggerProps } from "./accordion";

type ErrorStateDetailsProps = Omit<
  React.ComponentProps<"div">,
  "onToggle" | "defaultValue"
> & {
  summary?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  icon?: AccordionTriggerProps["icon"];
  expandedIcon?: AccordionTriggerProps["expandedIcon"];
};

const ErrorStateDetails = ({
  className,
  summary = "Technical details",
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  icon = <PlusIcon />,
  expandedIcon = <MinusIcon />,
  ...props
}: ErrorStateDetailsProps) => (
  <Accordion<string>
    {...props}
    data-slot="error-state-details"
    className={cn(
      "min-w-0 text-start text-xs text-muted-foreground",
      className
    )}
    value={open === undefined ? undefined : ["details"].filter(() => open)}
    defaultValue={defaultOpen ? ["details"] : []}
    onValueChange={(values) => onOpenChange?.(values.includes("details"))}
    disabled={disabled}
  >
    <AccordionItem value="details">
      <AccordionTrigger
        icon={icon}
        expandedIcon={expandedIcon}
        className="items-center py-1 text-xs font-normal text-muted-foreground hover:text-foreground"
      >
        {summary}
      </AccordionTrigger>
      <AccordionContent className="pt-2 pb-0">
        <div
          className="max-h-40 overflow-y-auto rounded-md bg-muted/40 p-3 font-mono whitespace-pre-wrap wrap-anywhere focus-visible:outline-2 focus-visible:outline-ring"
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keep overflowing support information keyboard-scrollable.
          tabIndex={0}
        >
          {children}
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);

export { ErrorStateDetails };
export type { ErrorStateDetailsProps };
