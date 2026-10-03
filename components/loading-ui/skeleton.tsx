import { cn } from "cn";

function Skeleton({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <>
      <style>{`
        @keyframes loading-ui-skeleton-pulse {
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
      <div
        data-slot="skeleton"
        className={cn("bg-muted rounded-md", className)}
        style={{
          animationDuration: "var(--duration, 2s)",
          animationIterationCount: "infinite",
          animationName: "loading-ui-skeleton-pulse",
          animationTimingFunction: "cubic-bezier(0.4, 0, 0.6, 1)",
          ...style,
        }}
        {...props}
      />
    </>
  );
}

export { Skeleton };
