"use client";

// Adapted from shadcn/ui's Base Nova Switch (MIT).
// https://ui.shadcn.com/docs/components/base/switch
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
import { useDirection } from "@base-ui/react/direction-provider";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "cn";
import { motion, useReducedMotion } from "motion/react";
import type { ComponentProps } from "react";

export type SwitchProps = Omit<
  ComponentProps<typeof SwitchPrimitive.Root>,
  "children"
> & {
  size?: "sm" | "default";
  /** Animate thumb changes. Reduced-motion preferences take precedence. */
  animated?: boolean;
};

export const Switch = ({
  className,
  size = "default",
  animated = true,
  dir,
  ...props
}: SwitchProps) => {
  const reducedMotion = useReducedMotion();
  const inheritedDirection = useDirection();
  const direction = dir ?? inheritedDirection;
  const checkedOffset =
    direction === "rtl" ? "calc(-100% + 2px)" : "calc(100% - 2px)";

  return (
    <SwitchPrimitive.Root
      {...props}
      dir={direction}
      data-slot="switch"
      data-size={size}
      className={(state) =>
        cn(
          "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent bg-input outline-none transition-colors duration-150 motion-reduce:transition-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-[18.4px] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-checked:bg-primary data-disabled:cursor-not-allowed data-disabled:opacity-50 dark:data-unchecked:bg-input/80",
          typeof className === "function" ? className(state) : className
        )
      }
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block shrink-0 group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3"
        render={(thumbProps, state) => (
          <span {...thumbProps} aria-hidden="true">
            <motion.span
              className="block size-full rounded-full bg-background ring-0 dark:group-data-checked/switch:bg-primary-foreground dark:group-data-unchecked/switch:bg-foreground"
              initial={false}
              animate={{
                // Keep matching percentage/pixel terms so Motion can interpolate.
                x: state.checked ? checkedOffset : "calc(0% - 0px)",
              }}
              transition={{
                duration: animated && !reducedMotion ? 0.2 : 0,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </span>
        )}
      />
    </SwitchPrimitive.Root>
  );
};
