import { Activity } from "lucide-react";

import { getPlaygroundDefaults } from "@/lib/playground";
import type { PropDefinition } from "@/lib/playground";
import type {
  StatsCardProps,
  StatsCardValue,
} from "@/registry/new-york/stats-card";
import type { StatsCardBadgeVariant } from "@/registry/new-york/stats-card-badge";

export const statsCardProps = {
  ariaLabel: {
    control: {
      initialValue: "Webhook overview" as string,
      kind: "text",
      label: "Group label",
    },
    defaultValue: "Required",
    description: "Accessible name of the statistics group.",
    type: "string",
  },
  className: {
    defaultValue: "Not set",
    description: "Classes merged onto the outer group.",
    type: "string",
  },
  "item.badge": {
    defaultValue: "Not set (variant: secondary)",
    description:
      "Optional non-interactive badge beneath the value. Classes affect only this badge.",
    type: "{ label: ReactNode; variant?: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }",
  },
  "item.caption": {
    defaultValue: "Not set",
    description: "Optional supporting content beneath the value.",
    type: "ReactNode",
  },
  "item.icon": {
    defaultValue: "Required",
    description: "Decorative icon component, hidden from assistive technology.",
    type: "LucideIcon",
  },
  "item.key": {
    defaultValue: "Required",
    description:
      "Stable unique identifier. Preserve it across updates to animate from the current value.",
    type: "string",
  },
  "item.title": {
    defaultValue: "Required",
    description: "Visible metric label in a definition list.",
    type: "string",
  },
  "item.value": {
    defaultValue: "Required",
    description:
      "Either { target: number | null, format?: (value: number) => string } or { display: ReactNode }, not both.",
    type: "StatsCardValue",
  },
  "item.value.format": {
    defaultValue:
      'Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format',
    description:
      "Formats numeric animation frames and the accessible final value. Must accept fractional values. Use display for exact financial strings.",
    type: "(value: number) => string",
  },
  items: {
    defaultValue: "Required",
    description:
      "Ordered metrics. Each item requires a unique key, title, value, and Lucide icon. Empty arrays render an empty group.",
    type: "readonly StatsCardItem[]",
  },
} satisfies Record<string, PropDefinition>;

export const statsCardPlaygroundDefinitions = {
  ariaLabel: statsCardProps.ariaLabel,
  badgeVariant: {
    control: {
      initialValue: "secondary" as StatsCardBadgeVariant,
      kind: "select",
      label: "Badge variant",
      options: ["default", "secondary", "destructive", "outline"],
    },
    defaultValue: "secondary",
    description: "Demo badge variant.",
    type: "StatsCardBadgeVariant",
  },
  caption: {
    control: {
      initialValue: "Last 30 days" as string,
      kind: "text",
      label: "Caption",
    },
    defaultValue: "Last 30 days",
    description: "Demo caption.",
    type: "string",
  },
  count: {
    control: {
      initialValue: 4 as number,
      kind: "range",
      label: "Metrics",
      max: 6,
      min: 1,
      step: 1,
    },
    defaultValue: "4",
    description: "Demo item count, not a component prop.",
    type: "number",
  },
  showBadge: {
    control: {
      initialValue: true as boolean,
      kind: "boolean",
      label: "Show badges",
    },
    defaultValue: "true",
    description: "Demo badge visibility.",
    type: "boolean",
  },
  showCaption: {
    control: {
      initialValue: true as boolean,
      kind: "boolean",
      label: "Show captions",
    },
    defaultValue: "true",
    description: "Demo caption visibility.",
    type: "boolean",
  },
  target: {
    control: {
      initialValue: 1248 as number,
      kind: "range",
      label: "First value",
      max: 5000,
      min: -2000,
      step: 1,
    },
    defaultValue: "1248",
    description: "Numeric target for the first metric.",
    type: "number",
  },
  title: {
    control: {
      initialValue: "Active webhooks" as string,
      kind: "text",
      label: "First title",
    },
    defaultValue: "Active webhooks",
    description: "First metric title.",
    type: "string",
  },
  valueMode: {
    control: {
      initialValue: "target" as "target" | "display" | "missing",
      kind: "select",
      label: "Value mode",
      options: ["target", "display", "missing"],
    },
    defaultValue: "target",
    description: "Demo value mode.",
    type: "string",
  },
} satisfies Record<string, PropDefinition>;

export const getStatsCardDefaults = () =>
  getPlaygroundDefaults(statsCardPlaygroundDefinitions);
export type StatsCardPlaygroundValues = ReturnType<typeof getStatsCardDefaults>;
const titles = [
  "Active webhooks",
  "Delivered",
  "Paused",
  "Needs attention",
  "Queued",
  "Retried",
];

const getDemoValue = (
  values: StatsCardPlaygroundValues,
  index: number
): StatsCardValue => {
  if (values.valueMode === "display") {
    return { display: index === 0 ? "Rp9.007.199.254.740.993" : "Ready" };
  }
  if (values.valueMode === "missing") {
    return { target: null };
  }
  return { target: index === 0 ? values.target : [0, 438, 2, 3, 12, 7][index] };
};

export const getStatsCardPreviewProps = (
  values: StatsCardPlaygroundValues
): StatsCardProps => ({
  ariaLabel: values.ariaLabel.trim() || "Statistics overview",
  items: Array.from({ length: values.count }, (_, index) => ({
    icon: Activity,
    key: `metric-${index}`,
    title: index === 0 ? values.title : titles[index],
    value: getDemoValue(values, index),
    ...(values.showCaption && { caption: values.caption }),
    ...(values.showBadge && {
      badge: { label: "Status", variant: values.badgeVariant },
    }),
  })),
});

export const getStatsCardCode = (values: StatsCardPlaygroundValues) => {
  const props = getStatsCardPreviewProps(values);
  const items = props.items
    .map(({ icon: _icon, ...item }) => {
      const fields = Object.entries(item)
        .map(([name, value]) => `      ${name}: ${JSON.stringify(value)}`)
        .join(",\n");
      return `    {\n${fields},\n      icon: Activity\n    }`;
    })
    .join(",\n");
  return `"use client";\n\nimport { Activity } from "lucide-react";\nimport { StatsCard } from "@/components/ui/stats-card";\n\nexport function StatsCardDemo() {\n  return <StatsCard ariaLabel={${JSON.stringify(props.ariaLabel)}} items={[\n${items}\n  ]} />;\n}`;
};
