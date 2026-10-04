"use client";

import { cn } from "cn";
import type { ComponentProps } from "react";
import * as React from "react";

import { fieldSurfaceClassName, Input } from "./input";
import type { InputProps } from "./input";

export const InputGroup = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="input-group"
    className={cn(
      "group/input-group flex w-full min-w-0 flex-wrap items-stretch rounded-md border border-input shadow-xs outline-none focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 has-[[aria-invalid=true]]:border-destructive",
      "has-[[data-slot=floating-input]]:not-has-[[data-align=block-start]]:border-t-transparent",
      "has-[[data-slot=floating-input]]:focus-within:ring-0",
      fieldSurfaceClassName,
      className
    )}
    {...props}
  />
);

export const InputGroupInput = ({ className, ...props }: InputProps) => (
  <Input
    data-slot="input-group-control"
    containerClassName="min-w-px flex-1 basis-0 [&>[data-slot=input-outline]]:-top-[7px] [&>[data-slot=input-outline]]:rounded-none [&>[data-slot=input-outline]]:border-x-0 [&>[data-slot=input-outline]]:border-b-0 group-not-has-[[data-align=inline-start]]/input-group:group-not-has-[[data-align=block-start]]/input-group:[&>[data-slot=input-outline]]:rounded-tl-md group-not-has-[[data-align=inline-end]]/input-group:group-not-has-[[data-align=block-start]]/input-group:[&>[data-slot=input-outline]]:rounded-tr-md group-focus-within/input-group:[&>[data-slot=input-outline]]:border-ring group-has-[[aria-invalid=true]]/input-group:[&>[data-slot=input-outline]]:border-destructive"
    className={cn(
      "min-w-0 flex-1 basis-0 rounded-none border-0 bg-transparent bg-none shadow-none focus-visible:ring-0 disabled:opacity-100 dark:bg-transparent",
      props.label && props.labelStyle !== "static" && "h-[38px]",
      className
    )}
    {...props}
  />
);

export const InputGroupTextarea = ({
  className,
  ...props
}: ComponentProps<"textarea">) => (
  <textarea
    data-slot="input-group-control"
    className={cn(
      "min-h-20 min-w-px flex-1 bg-transparent px-3 py-2 text-sm outline-none",
      className
    )}
    {...props}
  />
);

export const InputGroupAddon = ({
  align = "inline-start",
  className,
  ...props
}: ComponentProps<"div"> & {
  align?: "inline-start" | "inline-end" | "block-start" | "block-end";
}) => (
  <div
    data-slot="input-group-addon"
    data-align={align}
    className={cn(
      "flex shrink-0 items-center justify-center gap-1.5 px-3 text-sm text-muted-foreground [&_svg:not([class*='size-'])]:size-4",
      "relative before:pointer-events-none before:absolute before:inset-x-0 before:-top-px before:hidden before:h-2 before:border-input before:content-[''] group-focus-within/input-group:before:border-ring group-has-[[aria-invalid=true]]/input-group:before:border-destructive",
      (align === "inline-start" || align === "inline-end") &&
        "group-has-[[data-slot=floating-input]]/input-group:before:block before:border-t",
      align === "inline-start" &&
        "before:-left-px before:rounded-tl-md before:border-l group-has-[[data-align=block-start]]/input-group:before:rounded-none group-has-[[data-align=block-start]]/input-group:before:border-l-0",
      align === "inline-end" &&
        "before:-right-px before:rounded-tr-md before:border-r group-has-[[data-align=block-start]]/input-group:before:rounded-none group-has-[[data-align=block-start]]/input-group:before:border-r-0",
      align === "inline-start" && "order-first",
      align === "inline-end" && "order-last",
      align === "block-start" &&
        "order-first w-full justify-start border-b px-3 py-2 group-has-[[data-slot=floating-input]]/input-group:border-b-transparent",
      align === "block-end" &&
        "order-last w-full justify-start border-t px-3 py-2",
      className
    )}
    {...props}
  />
);

export const InputGroupText = ({
  className,
  ...props
}: ComponentProps<"span">) => (
  <span
    data-slot="input-group-text"
    className={cn("text-muted-foreground", className)}
    {...props}
  />
);

export const InputGroupButton = ({
  className,
  type = "button",
  ...props
}: ComponentProps<"button">) => (
  <button
    data-slot="input-group-button"
    type={type}
    className={cn(
      "inline-flex shrink-0 items-center justify-center gap-2 rounded-sm px-2 text-sm font-medium outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
);
