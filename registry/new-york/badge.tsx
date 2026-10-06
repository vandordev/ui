"use client";

/**
 * Adapted from ReUI Badge (https://github.com/keenthemes/reui).
 * MIT License
 * Copyright (c) 2025 Keenthemes Inc
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

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";

const badgeVariants = cva(
  "relative inline-flex w-fit shrink-0 items-center justify-center gap-1 border border-transparent font-medium whitespace-nowrap outline-none transition-[color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-3",
  {
    defaultVariants: { radius: "default", size: "default", variant: "default" },
    variants: {
      radius: { default: "rounded-md", full: "rounded-full" },
      size: {
        default: "h-5 min-w-5 px-1.5 py-0.5 text-xs",
        lg: "h-5.5 min-w-5.5 px-1.5 py-0.5 text-xs",
        sm: "h-4.5 min-w-4.5 px-1 py-0.25 text-[0.625rem] leading-none",
        xl: "h-6 min-w-6 gap-1.5 px-2 py-0.75 text-sm",
        xs: "h-4 min-w-4 px-1 py-0.25 text-[0.6rem] leading-none",
      },
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        "destructive-light":
          "border-destructive/20 bg-destructive/10 text-destructive-text",
        "destructive-outline":
          "border-border bg-background text-destructive-text",
        focus: "bg-primary text-primary-foreground",
        "focus-light": "border-primary/20 bg-primary/10 text-primary",
        "focus-outline": "border-border bg-background text-primary",
        info: "bg-info text-info-foreground",
        "info-light": "border-info/20 bg-info/10 text-info-text",
        "info-outline": "border-border bg-background text-info-text",
        invert: "bg-foreground text-background",
        "invert-light": "border-foreground/20 bg-foreground/10 text-foreground",
        "invert-outline": "border-border bg-background text-foreground",
        outline: "border-border bg-transparent text-foreground",
        "primary-light": "border-primary/20 bg-primary/10 text-primary",
        "primary-outline": "border-border bg-background text-primary",
        secondary: "bg-secondary text-secondary-foreground",
        success: "bg-success text-success-foreground",
        "success-light": "border-success/20 bg-success/10 text-success-text",
        "success-outline": "border-border bg-background text-success-text",
        warning: "bg-warning text-warning-foreground",
        "warning-light": "border-warning/20 bg-warning/10 text-warning-text",
        "warning-outline": "border-border bg-background text-warning-text",
      },
    },
  }
);

type BadgeProps = useRender.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants>;

const Badge = ({
  className,
  radius = "default",
  ref,
  render,
  size = "default",
  variant = "default",
  ...props
}: BadgeProps) => {
  const defaultProps = {
    className: cn(badgeVariants({ radius, size, variant }), className),
    "data-radius": radius,
    "data-size": size,
    "data-slot": "badge",
    "data-variant": variant,
  };
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(defaultProps, props),
    ref,
    render,
  });
};

export { Badge, badgeVariants };
export type { BadgeProps };
