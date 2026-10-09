import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { InputSearch } from "./input-search";
import type { InputSearchProps } from "./input-search";

const meta = {
  argTypes: {
    "aria-invalid": { control: "boolean" },
    clearLabel: { control: "text" },
    clearable: { control: "boolean" },
    defaultValue: { control: "text" },
    disabled: { control: "boolean" },
    label: { control: "text" },
    labelStyle: { control: "select", options: ["floating", "static"] },
    onChange: { control: false },
    placeholder: { control: "text" },
    readOnly: { control: "boolean" },
    searchLabel: { control: "text" },
    value: { control: false },
  },
  args: {
    "aria-invalid": false,
    clearLabel: "Clear search",
    clearable: true,
    defaultValue: "components",
    disabled: false,
    label: "Search documentation",
    labelStyle: "floating",
    placeholder: "Search components",
    readOnly: false,
    searchLabel: "Search",
  },
  component: InputSearch,
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "padded" },
  render: (args) => <InputSearch key={String(args.defaultValue)} {...args} />,
  tags: ["autodocs"],
  title: "Vandor UI/Input Search",
} satisfies Meta<typeof InputSearch>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Empty: Story = { args: { defaultValue: "" } };
export const WithoutClear: Story = { args: { clearable: false } };
export const StaticLabel: Story = { args: { labelStyle: "static" } };
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true } };
export const Invalid: Story = { args: { "aria-invalid": true } };
const ControlledSearch = ({
  defaultValue,
  onChange,
  value: _value,
  ...args
}: InputSearchProps) => {
  const [value, setValue] = useState(String(defaultValue ?? ""));
  return (
    <div className="grid gap-2">
      <InputSearch
        {...args}
        value={value}
        onChange={(event) => {
          setValue(event.currentTarget.value);
          onChange?.(event);
        }}
      />
      <output className="text-xs text-muted-foreground">
        Query: {value || "empty"}
      </output>
    </div>
  );
};
export const Controlled: Story = {
  argTypes: { defaultValue: { control: false } },
  render: (args) => <ControlledSearch {...args} />,
};
