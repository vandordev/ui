import type { PropDefinition } from "@/lib/playground";
import { getPlaygroundDefaults } from "@/lib/playground";
import type { SwitchProps } from "@/registry/new-york/switch";

export const switchProps = {
  animated: {
    control: {
      initialValue: true as boolean,
      kind: "boolean",
      label: "Animated",
    },
    defaultValue: "true",
    description:
      "Slides the thumb over 200 ms. Reduced motion makes this immediate.",
    type: "boolean",
  },
  "aria-invalid": {
    defaultValue: "Not set",
    description:
      "Invalid semantics and styling; connect error text using aria-describedby.",
    type: "boolean | 'true' | 'false'",
  },
  checked: {
    defaultValue: "Not set",
    description: "Controlled checked state. Pair with onCheckedChange.",
    type: "boolean",
  },
  className: {
    defaultValue: "Not set",
    description:
      "Classes merged with defaults, optionally derived from Base UI state.",
    type: "string | ((state: Switch.Root.State) => string)",
  },
  defaultChecked: {
    control: {
      initialValue: false as boolean,
      kind: "boolean",
      label: "Initially checked",
    },
    defaultValue: "false",
    description:
      "Initial uncontrolled state; changing it does not update a mounted switch.",
    type: "boolean",
  },
  dir: {
    defaultValue: "DirectionProvider (ltr by default)",
    description:
      "Thumb direction. Use dir or Base UI DirectionProvider for RTL.",
    type: '"ltr" | "rtl"',
  },
  disabled: {
    control: {
      initialValue: false as boolean,
      kind: "boolean",
      label: "Disabled",
    },
    defaultValue: "false",
    description: "Prevents interaction and excludes the input from submission.",
    type: "boolean",
  },
  inputRef: {
    defaultValue: "Not set",
    description:
      "Ref to the native input. Ordinary ref targets the visible root.",
    type: "Ref<HTMLInputElement>",
  },
  name: {
    defaultValue: "Not set",
    description: "Name of the native form input.",
    type: "string",
  },
  nativeButton: {
    defaultValue: "false",
    description: "Set true when render supplies a native button.",
    type: "boolean",
  },
  onCheckedChange: {
    defaultValue: "Not set",
    description:
      "Called immediately with the next boolean and Base UI event details. Call details.cancel() to reject the change.",
    type: "(checked: boolean, details: Switch.Root.ChangeEventDetails) => void",
  },
  readOnly: {
    control: {
      initialValue: false as boolean,
      kind: "boolean",
      label: "Read only",
    },
    defaultValue: "false",
    description: "Prevents changes while preserving focus and submitted value.",
    type: "boolean",
  },
  render: {
    defaultValue: "Not set (span)",
    description:
      "Base UI composition. For a sibling label use render={<button />} and nativeButton.",
    type: "ReactElement | ComponentRenderFn",
  },
  required: {
    defaultValue: "false",
    description: "Requires an active switch for native form validation.",
    type: "boolean",
  },
  size: {
    control: {
      initialValue: "default" as "default" | "sm",
      kind: "select",
      label: "Size",
      options: ["default", "sm"],
    },
    defaultValue: '"default"',
    description: "Track and thumb size.",
    type: '"default" | "sm"',
  },
  uncheckedValue: {
    defaultValue: "Not set",
    description: "Optional submitted value when off; otherwise omitted.",
    type: "string",
  },
  value: {
    defaultValue: '"on" (form submission)',
    description: "Submitted value when checked.",
    type: "string",
  },
} satisfies Record<string, PropDefinition>;

export const switchPlaygroundDefinitions = {
  label: {
    control: {
      initialValue: "Enable notifications",
      kind: "text",
      label: "Label",
    },
    defaultValue: "Not set",
    description: "Demo label, not a Switch prop.",
    type: "string",
  },
  ...switchProps,
  invalid: {
    control: {
      initialValue: false as boolean,
      kind: "boolean",
      label: "Invalid",
    },
    defaultValue: "false",
    description: "Demo control for aria-invalid.",
    type: "boolean",
  },
} satisfies Record<string, PropDefinition>;

export const getSwitchDefaults = () =>
  getPlaygroundDefaults(switchPlaygroundDefinitions);
export type SwitchPlaygroundValues = ReturnType<typeof getSwitchDefaults>;

export const getSwitchPreviewProps = (values: SwitchPlaygroundValues) =>
  ({
    animated: values.animated,
    "aria-invalid": values.invalid,
    "aria-label": values.label.trim() || "Enable notifications",
    defaultChecked: values.defaultChecked,
    disabled: values.disabled,
    readOnly: values.readOnly,
    size: values.size,
  }) satisfies SwitchProps;

export const getSwitchCode = (values: SwitchPlaygroundValues) => {
  const attributes = Object.entries(getSwitchPreviewProps(values))
    .map(([key, value]) => ` ${key}={${JSON.stringify(value)}}`)
    .join("");
  return `"use client";\n\nimport { Switch } from "@/components/ui/switch";\n\nexport function SwitchDemo() {\n  return (\n    <label className="flex items-center gap-3 text-sm">\n      <Switch${attributes} />\n      <span>{${JSON.stringify(values.label)}}</span>\n    </label>\n  );\n}`;
};
