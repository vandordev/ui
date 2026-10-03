import { cn } from "cn";

function Arc({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <>
      <style>{`
        @keyframes loading-ui-arc-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <div
        className={cn(
          "rounded-full border-[5px] border-current/10 border-t-current",
          className
        )}
        style={{
          animationDuration: "var(--duration, 1s)",
          animationIterationCount: "infinite",
          animationName: "loading-ui-arc-spin",
          animationTimingFunction: "linear",
          ...style,
        }}
        {...props}
      />
    </>
  );
}

export { Arc };
