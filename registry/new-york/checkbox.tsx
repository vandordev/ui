"use client";

// Adapted from shadcn/ui's Base Nova Checkbox (MIT).
// https://ui.shadcn.com/docs/components/base/checkbox
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
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { cn } from "cn";
import { motion, useReducedMotion } from "motion/react";
import type { ComponentProps } from "react";

export type CheckboxProps = Omit<
  ComponentProps<typeof CheckboxPrimitive.Root>,
  "children"
> & {
  /** Animate indicator changes. Reduced-motion preferences take precedence. */
  animated?: boolean;
};

export const Checkbox = ({
  className,
  animated = true,
  ...props
}: CheckboxProps) => {
  const reducedMotion = useReducedMotion();
  const duration = animated && !reducedMotion ? 0.18 : 0;

  return (
    <CheckboxPrimitive.Root
      {...props}
      data-slot="checkbox"
      className={(state) =>
        cn(
          "peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input outline-none transition-colors duration-150 motion-reduce:transition-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-disabled:cursor-not-allowed data-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground dark:bg-input/30 dark:data-checked:bg-primary dark:data-indeterminate:bg-primary",
          typeof className === "function" ? className(state) : className
        )
      }
    >
      <CheckboxPrimitive.Indicator
        keepMounted
        data-slot="checkbox-indicator"
        render={(indicatorProps, state) => {
          const visible = state.checked || state.indeterminate;
          return (
            <span
              {...indicatorProps}
              aria-hidden="true"
              className="grid place-content-center text-current"
            >
              <motion.span
                className="grid place-content-center"
                initial={false}
                animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.8 }}
                transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
              >
                <svg
                  aria-hidden="true"
                  className="size-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.path
                    initial={false}
                    animate={{
                      d: state.indeterminate
                        ? "M5 12 L12 12 L19 12"
                        : "M5 12 L10 17 L19 7",
                      pathLength: visible ? 1 : 0,
                    }}
                    transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
                  />
                </svg>
              </motion.span>
            </span>
          );
        }}
      />
    </CheckboxPrimitive.Root>
  );
};
