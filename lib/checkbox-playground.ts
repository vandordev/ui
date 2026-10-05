import type { PropDefinition } from "@/lib/playground";
import { getPlaygroundDefaults } from "@/lib/playground";
import type { CheckboxProps } from "@/registry/new-york/checkbox";

export const checkboxProps = {
  animated: {
    control: {
      initialValue: true as boolean,
      kind: "boolean",
      label: "Animated",
    },
    defaultValue: "true",
    description:
      "Draws and withdraws the check stroke, with mixed-state morphing. Reduced motion makes these immediate.",
    type: "boolean",
  },
  "aria-invalid": {
    defaultValue: "Not set",
    description:
      "Invalid styling and semantics. Associate error text using aria-describedby.",
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
      "Classes merged with defaults, optionally derived from Base UI checkbox state.",
    type: "string | ((state: Checkbox.Root.State) => string)",
  },
  defaultChecked: {
    control: {
      initialValue: false as boolean,
      kind: "boolean",
      label: "Initially checked",
    },
    defaultValue: "false",
    description:
      "Initial uncontrolled checked state. Use checked for controlled state.",
    type: "boolean",
  },
  disabled: {
    control: {
      initialValue: false as boolean,
      kind: "boolean",
      label: "Disabled",
    },
    defaultValue: "false",
    description:
      "Prevents interaction and excludes the input from form submission.",
    type: "boolean",
  },
  indeterminate: {
    control: {
      initialValue: false as boolean,
      kind: "boolean",
      label: "Indeterminate",
    },
    defaultValue: "false",
    description:
      "Displays a mixed state independently of checked. Manage this prop when selecting a group.",
    type: "boolean",
  },
  inputRef: {
    defaultValue: "Not set",
    description:
      "Ref to the native input. The ordinary ref targets the visible root.",
    type: "Ref<HTMLInputElement>",
  },
  name: {
    defaultValue: "Not set",
    description: "Name of the hidden native form input.",
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
      "Called immediately with the next boolean and Base UI event details. Call details.cancel() to reject a change.",
    type: "(checked: boolean, details: Checkbox.Root.ChangeEventDetails) => void",
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
      "Base UI root composition. For sibling labels, use render={<button />} and nativeButton.",
    type: "ReactElement | ComponentRenderFn",
  },
  required: {
    defaultValue: "false",
    description: "Requires a checked input for native form validation.",
    type: "boolean",
  },
  uncheckedValue: {
    defaultValue: "Not set",
    description:
      "Optional submitted value when unchecked. Otherwise unchecked inputs are omitted.",
    type: "string",
  },
  value: {
    defaultValue: '"on" (form submission)',
    description: "Submitted value when checked.",
    type: "string",
  },
} satisfies Record<string, PropDefinition>;

export const checkboxPlaygroundDefinitions = {
  label: {
    control: {
      initialValue: "Enable notifications",
      kind: "text",
      label: "Label",
    },
    defaultValue: "Not set",
    description: "Demo label, not a Checkbox prop.",
    type: "string",
  },
  ...checkboxProps,
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

export const getCheckboxDefaults = () =>
  getPlaygroundDefaults(checkboxPlaygroundDefinitions);
export type CheckboxPlaygroundValues = ReturnType<typeof getCheckboxDefaults>;

export const getCheckboxPreviewProps = (values: CheckboxPlaygroundValues) =>
  ({
    animated: values.animated,
    "aria-invalid": values.invalid,
    "aria-label": values.label.trim() || "Enable notifications",
    defaultChecked: values.defaultChecked,
    disabled: values.disabled,
    indeterminate: values.indeterminate,
    readOnly: values.readOnly,
  }) satisfies CheckboxProps;

export const getCheckboxCode = (values: CheckboxPlaygroundValues) => {
  const attributes = Object.entries(getCheckboxPreviewProps(values))
    .map(([key, value]) => ` ${key}={${JSON.stringify(value)}}`)
    .join("");
  return `"use client";\n\nimport { Checkbox } from "@/components/ui/checkbox";\n\nexport function CheckboxDemo() {\n  return (\n    <label className="flex items-center gap-3 text-sm">\n      <Checkbox${attributes} />\n      <span>{${JSON.stringify(values.label)}}</span>\n    </label>\n  );\n}`;
};
