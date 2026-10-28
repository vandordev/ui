import { cn } from "cn";
import type { ComponentProps } from "react";

const spacingClasses = {
  default: "[--frame-space:1rem] [--frame-inset:0.25rem]",
  lg: "[--frame-space:1.5rem] [--frame-inset:0.5rem]",
  sm: "[--frame-space:0.75rem] [--frame-inset:0.125rem]",
} as const;

export type FrameProps = ComponentProps<"div"> & {
  variant?: "default" | "ghost";
  spacing?: keyof typeof spacingClasses;
  stacked?: boolean;
  dense?: boolean;
};

/** Layout only. Adjacent direct panels share a seam when stacked. */
export const Frame = ({
  className,
  variant = "default",
  spacing = "default",
  stacked = false,
  dense = false,
  ...props
}: FrameProps) => (
  <div
    data-slot="frame"
    data-variant={variant}
    data-spacing={spacing}
    data-stacked={stacked}
    data-dense={dense}
    className={cn(
      "flex min-w-0 flex-col rounded-(--frame-radius) bg-muted/50 text-foreground [--frame-radius:var(--radius-xl)] [--frame-panel-radius:max(0px,calc(var(--frame-radius)-var(--frame-inset)-1px))] gap-(--frame-inset) p-(--frame-inset)",
      spacingClasses[spacing],
      variant === "default" && "border border-border",
      variant === "ghost" &&
        "[--frame-panel-radius:max(0px,calc(var(--frame-radius)-var(--frame-inset)))]",
      stacked &&
        "gap-0 [&>[data-slot=frame-panel]:has(+[data-slot=frame-panel])]:rounded-b-none [&>[data-slot=frame-panel]+[data-slot=frame-panel]]:rounded-t-none [&>[data-slot=frame-panel]+[data-slot=frame-panel]]:border-t-0",
      dense &&
        "p-0 [--frame-inset:0rem] [--frame-panel-radius:var(--frame-radius)]",
      dense &&
        variant === "default" &&
        "[&>[data-slot=frame-panel]]:border-x-0 [&>[data-slot=frame-panel]:first-child]:border-t-0 [&>[data-slot=frame-panel]:last-child]:border-b-0",
      className
    )}
    {...props}
  />
);

export type FramePanelProps = ComponentProps<"div"> & { fit?: boolean };

export const FramePanel = ({
  className,
  fit = false,
  ...props
}: FramePanelProps) => (
  <div
    data-slot="frame-panel"
    data-fit={fit}
    className={cn(
      "min-w-0 rounded-(--frame-panel-radius) border border-border bg-card p-(--frame-space) text-card-foreground [overflow-wrap:anywhere]",
      !fit && "grow",
      className
    )}
    {...props}
  />
);

export const FrameHeader = ({
  className,
  ...props
}: ComponentProps<"header">) => (
  <header
    data-slot="frame-header"
    className={cn(
      "flex min-w-0 flex-col gap-1 px-(--frame-space) py-3 [overflow-wrap:anywhere]",
      className
    )}
    {...props}
  />
);

export const FrameTitle = ({
  children,
  className,
  ...props
}: ComponentProps<"h3">) => (
  <h3
    data-slot="frame-title"
    className={cn("text-sm font-semibold", className)}
    {...props}
  >
    {children}
  </h3>
);

export const FrameDescription = ({
  className,
  ...props
}: ComponentProps<"p">) => (
  <p
    data-slot="frame-description"
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
);

export const FrameFooter = ({
  className,
  ...props
}: ComponentProps<"footer">) => (
  <footer
    data-slot="frame-footer"
    className={cn(
      "flex min-w-0 flex-wrap items-center gap-2 px-(--frame-space) py-3 text-sm text-muted-foreground [overflow-wrap:anywhere]",
      className
    )}
    {...props}
  />
);
