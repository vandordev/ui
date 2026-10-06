"use client";

// Default Arc visual adapted from loading-ui. Kept separate from its variant catalog.
/*
MIT License
Copyright (c) 2026 Bartosz Zagrodzki

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to
do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
import { cn } from "cn";
import { useReducedMotion } from "motion/react";
import type { ComponentProps, CSSProperties } from "react";

/** Supporting primitive for Button, not the public multi-variant Loading API. */
export function LoadingArc({
  size = 24,
  className,
  style,
  "aria-label": ariaLabel = "Loading",
  ...props
}: ComponentProps<"div"> & { size?: number | string }) {
  const reducedMotion = useReducedMotion();
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      data-slot="loading"
      data-variant="arc"
      className={cn(
        "inline-flex shrink-0 items-center justify-center align-middle",
        className
      )}
      style={
        {
          "--loading-size": typeof size === "number" ? `${size}px` : size,
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      <div
        aria-hidden="true"
        data-slot="loading-visual"
        className="inline-flex items-center justify-center"
      >
        {reducedMotion ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="size-(--loading-size)"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.3"
            />
            <path
              d="M12 3a9 9 0 0 1 9 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <>
            <style>{`@keyframes loading-ui-arc-spin { to { transform: rotate(360deg); } }`}</style>
            <div
              className="rounded-full border-[5px] border-current/10 border-t-current size-(--loading-size)"
              style={{
                animationDuration: "var(--duration, 1s)",
                animationIterationCount: "infinite",
                animationName: "loading-ui-arc-spin",
                animationTimingFunction: "linear",
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
