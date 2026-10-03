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
    description: "SelectValue: text shown before choosing a value.",
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
    description: "SelectTrigger: control height.",
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
      "SelectContent: enables Motion reveal and exit. Respects reduced motion.",
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
  name: {
    defaultValue: "Not set",
    description: "Select: name included in native form submission.",
    type: "string",
  },
} satisfies Record<string, PropDefinition>;

export const getSelectDefaults = () => getPlaygroundDefaults(selectProps);
export type SelectPlaygroundValues = ReturnType<typeof getSelectDefaults>;

export const getSelectCode = (values: SelectPlaygroundValues) => `import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const items = ${JSON.stringify(selectItems, null, 2)};

export const SelectDemo = () => (
  <Select items={items}${values.disabled ? " disabled" : ""}>
    <SelectTrigger aria-label="Fruit" className="w-56"${values.size === "sm" ? ' size="sm"' : ""}>
      <SelectValue placeholder={${JSON.stringify(values.placeholder)}} />
    </SelectTrigger>
    <SelectContent${values.animated ? "" : " animated={false}"}>
      <SelectGroup>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectGroup>
    </SelectContent>
  </Select>
);`;
