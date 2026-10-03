"use client";

import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { motion, useReducedMotion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import { Slot } from "radix-ui";
import type * as React from "react";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-[background-color,color,border-color,box-shadow] duration-200 ease-out motion-reduce:transition-none outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        icon: "size-9",
        "icon-lg": "size-10",
        "icon-sm": "size-8",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
      },
      variant: {
        default:
          "border border-primary border-t-primary/70 bg-primary bg-linear-to-b from-white/10 to-black/10 text-primary-foreground hover:bg-primary/90",
        destructive:
          "border border-destructive border-t-destructive/70 bg-destructive bg-linear-to-b from-white/10 to-black/10 text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        outline:
          "border bg-background hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "border border-input bg-secondary bg-linear-to-b from-white/10 to-black/10 text-secondary-foreground hover:bg-secondary/80",
      },
    },
  }
);

const MotionSlot = motion.create(Slot.Root);

type ButtonProps = Omit<HTMLMotionProps<"button">, "children" | "whileTap"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    children?: React.ReactNode;
    whileTap?: HTMLMotionProps<"button">["whileTap"] | false;
  };

const Button = ({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  disabled,
  whileTap = { scale: 0.96 },
  transition = { duration: 0.12, ease: "easeOut" },
  ...props
}: ButtonProps) => {
  const shouldReduceMotion = useReducedMotion();
  const Comp = asChild ? MotionSlot : motion.button;

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ className, size, variant }))}
      disabled={disabled}
      {...props}
      transition={transition}
      whileTap={
        disabled || shouldReduceMotion || whileTap === false
          ? undefined
          : whileTap
      }
    />
  );
};

export { Button, buttonVariants };
