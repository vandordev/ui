"use client";

import { Check, LoaderCircle } from "lucide-react";

import { ComponentPlayground } from "@/components/component-playground";
import {
  badgePlaygroundDefinitions,
  getBadgeCode,
  getBadgeDefaults,
} from "@/lib/badge-playground";
import type { BadgePlaygroundValues } from "@/lib/badge-playground";
import { Badge } from "@/registry/new-york/badge";

export const BadgePlaygroundPreview = ({
  values,
}: {
  values: BadgePlaygroundValues;
}) => (
  <Badge variant={values.variant} size={values.size} radius={values.radius}>
    {values.indicator === "dot" && (
      <span
        aria-hidden="true"
        className="size-1.5 shrink-0 rounded-full bg-current"
      />
    )}
    {values.indicator === "icon" && <Check aria-hidden="true" />}
    {values.indicator === "spinner" && (
      <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />
    )}
    {values.children}
  </Badge>
);

export const BadgePlayground = () => (
  <ComponentPlayground
    title="Badge"
    definitions={badgePlaygroundDefinitions}
    initialValues={getBadgeDefaults()}
    getCode={getBadgeCode}
    renderPreview={(values) => <BadgePlaygroundPreview values={values} />}
    hint="Indicator composes a decorative child; it is not a Badge prop. Reset restores all controls. Badge does not fetch data or manage asynchronous state."
  />
);
