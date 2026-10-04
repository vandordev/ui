import { cn } from "cn";
import type { ComponentProps } from "react";
import * as React from "react";

export function InputGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      className={cn(
        "group/input-group flex w-full min-w-0 flex-wrap items-stretch rounded-md border border-input bg-background shadow-xs outline-none focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 has-[[aria-invalid=true]]:border-destructive dark:bg-input/30",
        className
      )}
      {...props}
    />
  );
}

export function InputGroupInput({
  className,
  ...props
}: ComponentProps<"input">) {
  return (
    <input
      data-slot="input-group-control"
      className={cn(
        "h-9 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export function InputGroupTextarea({
  className,
  ...props
}: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="input-group-control"
      className={cn(
        "min-h-20 min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none",
        className
      )}
      {...props}
    />
  );
}

export function InputGroupAddon({
  align = "inline-start",
  className,
  ...props
}: ComponentProps<"div"> & {
  align?: "inline-start" | "inline-end" | "block-start" | "block-end";
}) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(
        "flex shrink-0 items-center justify-center gap-1.5 px-3 text-sm text-muted-foreground [&_svg:not([class*='size-'])]:size-4",
        align === "inline-start" && "order-first",
        align === "inline-end" && "order-last",
        align === "block-start" &&
          "order-first w-full justify-start border-b px-3 py-2",
        align === "block-end" &&
          "order-last w-full justify-start border-t px-3 py-2",
        className
      )}
      {...props}
    />
  );
}

export function InputGroupText({
  className,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      data-slot="input-group-text"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

export function InputGroupButton({
  className,
  type = "button",
  ...props
}: ComponentProps<"button">) {
  return (
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
}
