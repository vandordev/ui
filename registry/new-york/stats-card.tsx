"use client";

// Adapted from Valcentra's StatsCard. Uses local supporting styles, not website UI.
import { cn } from "cn";
import type { LucideIcon } from "lucide-react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { StatsCardBadge } from "./stats-card-badge";
import type { StatsCardBadgeVariant } from "./stats-card-badge";

export type StatsCardValue =
  | {
      target: number | null;
      format?: (value: number) => string;
      display?: never;
    }
  | { display: ReactNode; target?: never; format?: never };

export interface StatsCardItem {
  key: string;
  title: string;
  value: StatsCardValue;
  icon: LucideIcon;
  caption?: ReactNode;
  badge?: {
    label: ReactNode;
    variant?: StatsCardBadgeVariant;
    className?: string;
  };
}

export interface StatsCardProps {
  ariaLabel: string;
  items: readonly StatsCardItem[];
  className?: string;
}

const defaultNumberFormat = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
}).format;

const AnimatedStatsValue = ({
  value,
}: {
  value: Extract<StatsCardValue, { target: number | null }>;
}) => {
  const target =
    value.target !== null && Number.isFinite(value.target)
      ? value.target
      : null;
  const format = value.format ?? defaultNumberFormat;
  const formatRef = useRef(format);
  formatRef.current = format;
  const motionValue = useMotionValue(0);
  const formattedValue = useTransform(motionValue, (current) =>
    formatRef.current(current)
  );
  const shouldReduceMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = useState(false);
  const hasStarted = useRef(false);
  const finalValue = target === null ? "—" : format(target);

  useEffect(() => {
    if (target === null) {
      motionValue.set(0);
      setHasMounted(true);
      return;
    }
    if (shouldReduceMotion) {
      motionValue.set(target);
      hasStarted.current = true;
      setHasMounted(true);
      return;
    }
    if (!hasStarted.current) {
      motionValue.set(0);
      hasStarted.current = true;
    }
    const controls = animate(motionValue, target, {
      duration: 1.2,
      ease: "easeOut",
    });
    setHasMounted(true);
    return () => controls.stop();
  }, [motionValue, shouldReduceMotion, target]);

  if (!hasMounted || shouldReduceMotion || target === null) {
    return <span>{finalValue}</span>;
  }
  return (
    <>
      <span className="sr-only">{finalValue}</span>
      <motion.span aria-hidden="true">{formattedValue}</motion.span>
    </>
  );
};

const StatsValue = ({ value }: { value: StatsCardValue }) =>
  "display" in value ? (
    <span>{value.display}</span>
  ) : (
    <AnimatedStatsValue value={value} />
  );

export const StatsCard = ({ ariaLabel, items, className }: StatsCardProps) => {
  const columns = Math.max(1, Math.min(items.length, 4));
  const smallColumns = columns === 3 ? 3 : Math.min(columns, 2);
  return (
    <div
      data-slot="stats-card"
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "w-full min-w-0 overflow-hidden rounded-xl border border-border bg-card text-card-foreground",
        className
      )}
    >
      <dl
        className={cn(
          "grid grid-cols-1",
          columns === 3 ? "sm:grid-cols-3" : columns > 1 && "sm:grid-cols-2",
          columns === 4 && "lg:grid-cols-4"
        )}
      >
        {items.map((item, index) => {
          const Icon = item.icon;
          const hasCaption =
            item.caption !== null && item.caption !== undefined;
          const lastRow = (size: number) =>
            index >= Math.floor((items.length - 1) / size) * size;
          return (
            <div
              key={item.key}
              data-slot="stats-card-item"
              className={cn(
                "min-w-0 border-border",
                index < items.length - 1 && "border-b",
                lastRow(smallColumns) ? "sm:border-b-0" : "sm:border-b",
                (index + 1) % smallColumns !== 0 && index < items.length - 1
                  ? "sm:border-e"
                  : "sm:border-e-0",
                lastRow(columns) ? "lg:border-b-0" : "lg:border-b",
                (index + 1) % columns !== 0 && index < items.length - 1
                  ? "lg:border-e"
                  : "lg:border-e-0"
              )}
            >
              <div className="flex h-full items-start justify-between gap-4 p-5">
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <dt className="text-sm font-medium wrap-anywhere">
                    {item.title}
                  </dt>
                  <dd className="min-w-0">
                    <div className="text-2xl font-semibold tracking-tight tabular-nums wrap-anywhere">
                      <StatsValue value={item.value} />
                    </div>
                    {(hasCaption || item.badge) && (
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {hasCaption && (
                          <div className="text-xs text-muted-foreground wrap-anywhere">
                            {item.caption}
                          </div>
                        )}
                        {item.badge && (
                          <StatsCardBadge
                            className={item.badge.className}
                            variant={item.badge.variant}
                          >
                            {item.badge.label}
                          </StatsCardBadge>
                        )}
                      </div>
                    )}
                  </dd>
                </div>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground [&_svg]:size-4">
                  <Icon aria-hidden="true" />
                </div>
              </div>
            </div>
          );
        })}
      </dl>
    </div>
  );
};
