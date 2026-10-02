import type { ComponentProps } from "react";

import type { PropDefinition } from "@/lib/playground";
import { getPlaygroundDefaults } from "@/lib/playground";
import type { Button } from "@/registry/new-york/button";

type ButtonVariant = NonNullable<ComponentProps<typeof Button>["variant"]>;
type ButtonSize = NonNullable<ComponentProps<typeof Button>["size"]>;

// Keep the primary controls first, in the order shown in the playground.
// eslint-disable-next-line sort-keys
export const buttonProps = {
  children: {
    control: { initialValue: "Button", kind: "text", label: "Label" },
    defaultValue: "Not set",
    description:
      "Content inside the Button. The playground uses a text label, or an icon for icon-only sizes.",
    type: "ReactNode",
  },
  variant: {
    control: {
      initialValue: "default" as ButtonVariant,
      kind: "select",
      label: "Variant",
      options: [
        "default",
        "secondary",
        "outline",
        "ghost",
        "destructive",
        "link",
      ] satisfies ButtonVariant[],
    },
    defaultValue: '"default"',
    description:
      "Visual style. The link variant still renders a button unless asChild is used.",
    type: '"default" | "secondary" | "outline" | "ghost" | "destructive" | "link"',
  },
  size: {
    control: {
      initialValue: "default" as ButtonSize,
      kind: "select",
      label: "Size",
      options: [
        "xs",
        "sm",
        "default",
        "lg",
        "icon-xs",
        "icon-sm",
        "icon",
        "icon-lg",
      ] satisfies ButtonSize[],
    },
    defaultValue: '"default"',
    description:
      "Button dimensions. Give icon-only buttons an accessible name using aria-label.",
    type: '"xs" | "sm" | "default" | "lg" | "icon-xs" | "icon-sm" | "icon" | "icon-lg"',
  },
  disabled: {
    control: {
      initialValue: false as boolean,
      kind: "boolean",
      label: "Disabled",
    },
    defaultValue: "false",
    description:
      "Prevents interaction and applies disabled styling to the native button.",
    type: "boolean",
  },
  asChild: {
    defaultValue: "false",
    description:
      "Uses the child element instead of a button, preserving the child's semantics. See the As Child example below.",
    type: "boolean",
  },
  className: {
    defaultValue: "Not set",
    description:
      "Additional classes merged with the selected variant and size.",
    type: "string",
  },
  type: {
    defaultValue: '"submit" (native button)',
    description:
      'Native button type: "button", "submit", or "reset". Set type="button" for non-submit actions inside a form.',
    type: '"button" | "submit" | "reset"',
  },
  onClick: {
    defaultValue: "Not set",
    description:
      "Native React click handler. Add it in your application to handle actions.",
    type: "MouseEventHandler<HTMLButtonElement>",
  },
  "aria-label": {
    defaultValue: "Not set",
    description:
      "Accessible name for icon-only buttons or buttons without visible text.",
    type: "string",
  },
  whileTap: {
    defaultValue: "{ scale: 0.96 }",
    description:
      "Motion target while pressed. Set false to disable press feedback. Ignored when disabled or reduced motion is preferred.",
    type: 'MotionProps["whileTap"]',
  },
  transition: {
    defaultValue: '{ duration: 0.12, ease: "easeOut" }',
    description: "Motion transition for the press and release animation.",
    type: "Transition",
  },
} satisfies Record<string, PropDefinition>;

export const getButtonDefaults = () => getPlaygroundDefaults(buttonProps);

export type ButtonPlaygroundValues = ReturnType<typeof getButtonDefaults>;

export const isIconSize = (size: ButtonSize) => size.startsWith("icon");

export const getButtonAccessibleLabel = (values: ButtonPlaygroundValues) =>
  isIconSize(values.size) || !values.children.trim()
    ? values.children.trim() || "Button"
    : undefined;

export const getButtonCode = (values: ButtonPlaygroundValues) => {
  const icon = isIconSize(values.size);
  const defaults = getButtonDefaults();
  const attributes: string[] = [];

  if (values.variant !== defaults.variant) {
    attributes.push(`variant="${values.variant}"`);
  }
  if (values.size !== defaults.size) {
    attributes.push(`size="${values.size}"`);
  }
  if (values.disabled) {
    attributes.push("disabled");
  }
  const label = getButtonAccessibleLabel(values);
  if (label) {
    attributes.push(
      /^[\w -]+$/.test(label)
        ? `aria-label="${label}"`
        : `aria-label={${JSON.stringify(label)}}`
    );
  }

  const imports = [
    ...(icon ? ['import { PlusIcon } from "lucide-react";', ""] : []),
    'import { Button } from "@/components/ui/button";',
  ];
  const props = attributes.length ? ` ${attributes.join(" ")}` : "";
  const content = icon
    ? "<PlusIcon />"
    : `{${JSON.stringify(values.children)}}`;

  return `${imports.join("\n")}\n\nexport const ButtonDemo = () => (\n  <Button${props}>\n    ${content}\n  </Button>\n);`;
};
