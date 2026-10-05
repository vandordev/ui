import { cn } from "cn";
import type * as React from "react";

type ErrorStateProps = React.ComponentProps<"div"> & {
  border?: "none" | "solid" | "dashed";
  variant?: "centered" | "inline";
};

const ErrorState = ({
  className,
  border = "none",
  variant = "centered",
  ...props
}: ErrorStateProps) => (
  <div
    data-slot="error-state"
    data-variant={variant}
    data-border={border}
    className={cn(
      "group/error-state flex w-full min-w-0 gap-4 rounded-xl text-foreground",
      border === "solid" && "border border-solid",
      border === "dashed" && "border border-dashed",
      variant === "inline"
        ? "items-start p-4 text-start"
        : "flex-col items-center justify-center p-6 text-center",
      className
    )}
    {...props}
  />
);

const ErrorStateMedia = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    data-slot="error-state-media"
    className={cn(
      "flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive [&_svg]:size-5 [&_svg]:shrink-0",
      className
    )}
    {...props}
  />
);

const ErrorStateContent = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    data-slot="error-state-content"
    className={cn(
      "flex w-full min-w-0 max-w-sm flex-col gap-4 group-data-[variant=inline]/error-state:max-w-none",
      className
    )}
    {...props}
  />
);

const ErrorStateHeader = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    data-slot="error-state-header"
    className={cn("flex min-w-0 flex-col gap-2", className)}
    {...props}
  />
);

const ErrorStateTitle = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    data-slot="error-state-title"
    className={cn(
      "text-sm font-medium tracking-tight wrap-anywhere text-balance",
      className
    )}
    {...props}
  />
);

const ErrorStateDescription = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    data-slot="error-state-description"
    className={cn(
      "text-sm/relaxed text-muted-foreground wrap-anywhere",
      className
    )}
    {...props}
  />
);

const ErrorStateActions = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    data-slot="error-state-actions"
    className={cn(
      "flex min-w-0 flex-wrap items-center justify-center gap-2 group-data-[variant=inline]/error-state:justify-start",
      className
    )}
    {...props}
  />
);

export {
  ErrorState,
  ErrorStateActions,
  ErrorStateContent,
  ErrorStateDescription,
  ErrorStateHeader,
  ErrorStateMedia,
  ErrorStateTitle,
};
export { ErrorStateDetails } from "./error-state-details";
export type { ErrorStateDetailsProps } from "./error-state-details";
export type { ErrorStateProps };
