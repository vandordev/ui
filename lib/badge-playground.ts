import { getPlaygroundDefaults } from "@/lib/playground";
import type { PropDefinition } from "@/lib/playground";
import type { BadgeProps } from "@/registry/new-york/badge";

type BadgeVariant = NonNullable<BadgeProps["variant"]>;
type BadgeSize = NonNullable<BadgeProps["size"]>;
type BadgeRadius = NonNullable<BadgeProps["radius"]>;

export const badgeProps = {
  children: {
    control: { initialValue: "Ready", kind: "text", label: "Label" },
    defaultValue: "Not set",
    description:
      "Badge content. Keep visible text alongside status icons or dots.",
    type: "ReactNode",
  },
  className: {
    defaultValue: "Not set",
    description: "Classes merged with variant, size and radius defaults.",
    type: "string",
  },
  radius: {
    control: {
      initialValue: "default" as BadgeRadius,
      kind: "select",
      label: "Radius",
      options: ["default", "full"] satisfies BadgeRadius[],
    },
    defaultValue: '"default"',
    description: "Token-based rounded-md or a fully rounded pill.",
    type: '"default" | "full"',
  },
  ref: {
    defaultValue: "Not set",
    description:
      "React 19 ref to the rendered element, composed with a render element's ref.",
    type: "Ref<HTMLSpanElement>",
  },
  render: {
    defaultValue: "Not set",
    description:
      "Base UI element or render function replacing the span. Preserves the replacement element's attributes, handlers and ref. No asChild prop.",
    type: "ReactElement | ComponentRenderFn",
  },
  size: {
    control: {
      initialValue: "default" as BadgeSize,
      kind: "select",
      label: "Size",
      options: ["xs", "sm", "default", "lg", "xl"] satisfies BadgeSize[],
    },
    defaultValue: '"default"',
    description:
      "Compact label dimensions. Prefer default or xl for status text; xs/sm are dense metadata sizes.",
    type: '"xs" | "sm" | "default" | "lg" | "xl"',
  },
  variant: {
    control: {
      initialValue: "default" as BadgeVariant,
      kind: "select",
      label: "Variant",
      options: [
        "default",
        "secondary",
        "outline",
        "success",
        "info",
        "warning",
        "destructive",
        "focus",
        "invert",
        "primary-light",
        "success-light",
        "info-light",
        "warning-light",
        "destructive-light",
        "focus-light",
        "invert-light",
        "primary-outline",
        "success-outline",
        "info-outline",
        "warning-outline",
        "destructive-outline",
        "focus-outline",
        "invert-outline",
      ] satisfies BadgeVariant[],
    },
    defaultValue: '"default"',
    description:
      "Semantic solid, light or outline appearance. Focus uses Vandor's primary tokens; invert uses foreground/background. Appearance does not imply live data or interactive behavior.",
    type: '"default" | "secondary" | "outline" | "success" | "info" | "warning" | "destructive" | "focus" | "invert" | "primary-light" | "success-light" | "info-light" | "warning-light" | "destructive-light" | "focus-light" | "invert-light" | "primary-outline" | "success-outline" | "info-outline" | "warning-outline" | "destructive-outline" | "focus-outline" | "invert-outline"',
  },
} satisfies Record<string, PropDefinition>;

export const badgePlaygroundDefinitions = {
  ...badgeProps,
  indicator: {
    control: {
      initialValue: "none" as "none" | "dot" | "icon" | "spinner",
      kind: "select",
      label: "Indicator",
      options: ["none", "dot", "icon", "spinner"],
    },
    defaultValue: '"none"',
    description:
      "Playground composition, not a Badge prop. Decorative indicators do not replace visible status text.",
    type: '"none" | "dot" | "icon" | "spinner"',
  },
} satisfies Record<string, PropDefinition>;

export const getBadgeDefaults = () =>
  getPlaygroundDefaults(badgePlaygroundDefinitions);
export type BadgePlaygroundValues = ReturnType<typeof getBadgeDefaults>;

export const getBadgeCode = (values: BadgePlaygroundValues) => {
  const imports = [
    '"use client";',
    "",
    'import { Badge } from "@/components/ui/badge";',
  ];
  if (values.indicator === "icon") {
    imports.push('import { Check } from "lucide-react";');
  }
  if (values.indicator === "spinner") {
    imports.push('import { LoaderCircle } from "lucide-react";');
  }
  const indicators = {
    dot: '<span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />',
    icon: '<Check aria-hidden="true" />',
    none: "",
    spinner:
      '<LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />',
  };
  const indicator = indicators[values.indicator];
  return `${imports.join("\n")}\n\nexport const BadgeDemo = () => (\n  <Badge variant="${values.variant}" size="${values.size}" radius="${values.radius}">\n${indicator ? `    ${indicator}\n` : ""}    {${JSON.stringify(values.children)}}\n  </Badge>\n);`;
};
