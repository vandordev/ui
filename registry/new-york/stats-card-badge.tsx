import { cn } from "cn";
import type { ComponentProps } from "react";

const variants = {
  default: "border-transparent bg-primary text-primary-foreground",
  destructive: "border-transparent bg-destructive text-destructive-foreground",
  outline: "border-border text-foreground",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
};

export type StatsCardBadgeVariant = keyof typeof variants;

export const StatsCardBadge = ({
  className,
  variant = "secondary",
  ...props
}: ComponentProps<"span"> & { variant?: StatsCardBadgeVariant }) => (
  <span
    data-slot="stats-card-badge"
    className={cn(
      "inline-flex w-fit max-w-full items-center rounded-md border px-2 py-0.5 text-xs font-medium wrap-anywhere",
      variants[variant],
      className
    )}
    {...props}
  />
);
