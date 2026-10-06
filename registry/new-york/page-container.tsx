import { cn } from "cn";
import type { ComponentProps } from "react";

const widths = {
  full: "max-w-none",
  lg: "max-w-6xl",
  md: "max-w-4xl",
  sm: "max-w-2xl",
  xl: "max-w-7xl",
} as const;

export type PageContainerProps = ComponentProps<"div"> & {
  size?: keyof typeof widths;
};

export const PageContainer = ({
  className,
  size = "lg",
  ...props
}: PageContainerProps) => (
  <div
    data-slot="page-container"
    data-size={size}
    className={cn(
      "mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8",
      widths[size],
      className
    )}
    {...props}
  />
);
