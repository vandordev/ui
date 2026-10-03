import { cn } from "cn";

function DualArc({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <>
      <style>{`
        @keyframes loading-ui-dual-arc-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <div
        className={cn(
          "rounded-full border-[5px] border-transparent border-y-current",
          className
        )}
        style={{
          animationDuration: "var(--duration, 1s)",
          animationIterationCount: "infinite",
          animationName: "loading-ui-dual-arc-spin",
          animationTimingFunction: "linear",
          ...style,
        }}
        {...props}
      />
    </>
  );
}

export { DualArc };
