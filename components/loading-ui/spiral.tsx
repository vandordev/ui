"use client";

import { cn } from "cn";
import { motion } from "motion/react";

function Spiral({
  dots = 8,
  radius = 31.25,
  className,
  ...props
}: React.ComponentProps<"span"> & { dots?: number; radius?: number }) {
  return (
    <span
      role="status"
      className={cn("relative inline-block", className)}
      {...props}
    >
      {Array.from({ length: dots }, (_, index) => {
        const angle = (index / dots) * (2 * Math.PI);
        const x = `${50 + radius * Math.cos(angle)}%`;
        const y = `${50 + radius * Math.sin(angle)}%`;

        return (
          <motion.span
            key={index}
            aria-hidden="true"
            className="absolute inline-block rounded-full bg-current"
            style={{
              height: `${150 / dots}%`,
              left: x,
              top: y,
              translate: "-50% -50%",
              width: `${150 / dots}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              delay: (index / dots) * 1.5,
              duration: 1.5,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
        );
      })}
      <span className="sr-only">Loading</span>
    </span>
  );
}

export { Spiral };
