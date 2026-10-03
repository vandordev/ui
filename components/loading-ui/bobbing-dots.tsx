"use client";

import { cn } from "cn";
import { motion } from "motion/react";

function BobbingDots({
  className,
  dots = 3,
  duration = 1,
  ...props
}: React.ComponentProps<"span"> & { dots?: number; duration?: number }) {
  const transition = (index: number) => ({
    delay: index * 0.2,
    duration,
    ease: "easeInOut" as const,
    repeat: Infinity,
    repeatType: "loop" as const,
  });

  return (
    <span
      role="status"
      className={cn("inline-flex items-center gap-[12%]", className)}
      {...props}
    >
      {Array.from({ length: dots }, (_, index) => (
        <motion.span
          key={index}
          aria-hidden="true"
          initial={{ y: 0 }}
          animate={{ y: [0, "0.625em", 0] }}
          transition={transition(index)}
          className="inline-block aspect-square grow rounded-full bg-current shadow-sm"
        />
      ))}
      <span className="sr-only">Loading</span>
    </span>
  );
}

export { BobbingDots };
