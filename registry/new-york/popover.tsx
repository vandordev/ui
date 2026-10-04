"use client";

import { Popover as Primitive } from "@base-ui/react/popover";
import { cn } from "cn";
import type { ComponentProps } from "react";

export function Popover(props: ComponentProps<typeof Primitive.Root>) {
  return <Primitive.Root {...props} />;
}

export function PopoverTrigger(
  props: ComponentProps<typeof Primitive.Trigger>
) {
  return <Primitive.Trigger {...props} />;
}

export function PopoverClose(props: ComponentProps<typeof Primitive.Close>) {
  return <Primitive.Close {...props} />;
}

export function PopoverContent({
  align = "start",
  className,
  side = "bottom",
  sideOffset = 6,
  ...props
}: ComponentProps<typeof Primitive.Popup> & {
  align?: ComponentProps<typeof Primitive.Positioner>["align"];
  side?: ComponentProps<typeof Primitive.Positioner>["side"];
  sideOffset?: number;
}) {
  return (
    <Primitive.Portal>
      <Primitive.Positioner
        align={align}
        side={side}
        sideOffset={sideOffset}
        className="z-50"
      >
        <Primitive.Popup
          data-slot="popover-content"
          className={cn(
            "z-50 max-w-[calc(100vw-1rem)] origin-[var(--transform-origin)] rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95 motion-reduce:animate-none",
            className
          )}
          {...props}
        />
      </Primitive.Positioner>
    </Primitive.Portal>
  );
}
