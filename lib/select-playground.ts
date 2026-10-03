import type { PropDefinition } from "@/lib/playground";
import { getPlaygroundDefaults } from "@/lib/playground";

export const selectItems = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Blueberry", value: "blueberry" },
  { label: "Grapes", value: "grapes" },
  { label: "Pineapple", value: "pineapple" },
];

// eslint-disable-next-line sort-keys
export const selectProps = {
  placeholder: {
    control: {
      initialValue: "Select a fruit",
      kind: "text",
      label: "Placeholder",
    },
    defaultValue: "Not set",
    description: "SelectInput: text shown before choosing a value.",
    type: "ReactNode",
  },
  size: {
    control: {
      initialValue: "default" as "default" | "sm",
      kind: "select",
      label: "Size",
      options: ["default", "sm"],
    },
    defaultValue: '"default"',
    description: "SelectInput: control height.",
    type: '"default" | "sm"',
  },
  disabled: {
    control: {
      initialValue: false as boolean,
      kind: "boolean",
      label: "Disabled",
    },
    defaultValue: "false",
    description: "Select: prevents interaction with the control.",
    type: "boolean",
  },
  animated: {
    control: {
      initialValue: true as boolean,
      kind: "boolean",
      label: "Animated",
    },
    defaultValue: "true",
    description:
      "SelectInput: enables Motion reveal and exit. Respects reduced motion.",
    type: "boolean",
  },
  alignItemWithTrigger: {
    defaultValue: "false",
    description:
      "SelectContent: overlaps the trigger to align the selected option.",
    type: "boolean",
  },
  value: {
    defaultValue: "Not set",
    description: "Select: controlled selected value.",
    type: "Value | null",
  },
  defaultValue: {
    defaultValue: "Not set",
    description: "Select: initial uncontrolled value.",
    type: "Value | null",
  },
  onValueChange: {
    defaultValue: "Not set",
    description:
      "Select: receives the selected value and Base UI event details.",
    type: "(value, details) => void",
  },
  items: {
    defaultValue: "Not set",
    description: "Select: maps values to displayed labels.",
    type: "Array<{ label, value }> | Record<string, ReactNode>",
  },
  data: {
    defaultValue: "Required",
    description:
      "SelectInput: options and one-level groups rendered automatically.",
    type: "readonly (SelectOption<Value> | SelectOptionGroup<Value>)[]",
  },
  renderItem: {
    defaultValue: "Not set",
    description:
      "SelectInput: custom option content; label remains the trigger and typeahead text.",
    type: "(item: SelectOption<Value>) => ReactNode",
  },
  triggerProps: {
    defaultValue: "Not set",
    description:
      "SelectInput: additional trigger props, including ref and event handlers.",
    type: "Omit<SelectTriggerProps, 'children' | 'className' | 'size'>",
  },
  contentProps: {
    defaultValue: "Not set",
    description: "SelectInput: popup props and positioning options.",
    type: "Omit<SelectContentProps, 'children' | 'animated'>",
  },
  name: {
    defaultValue: "Not set",
    description: "Select: name included in native form submission.",
    type: "string",
  },
} satisfies Record<string, PropDefinition>;

export const getSelectDefaults = () => getPlaygroundDefaults(selectProps);
export type SelectPlaygroundValues = ReturnType<typeof getSelectDefaults>;

export const getSelectCode = (
  values: SelectPlaygroundValues
) => `import { SelectInput } from "@/components/ui/select";

const items = ${JSON.stringify(selectItems, null, 2)};

export const SelectDemo = () => (
  <SelectInput
    data={items}
    aria-label="Fruit"
    className="w-56"
    placeholder={${JSON.stringify(values.placeholder)}}${values.size === "sm" ? '\n    size="sm"' : ""}${values.disabled ? "\n    disabled" : ""}${values.animated ? "" : "\n    animated={false}"}
  />
);`;
