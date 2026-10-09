import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { Input } from "./input";
import type { InputProps } from "./input";

const meta = {
  argTypes: {
    "aria-invalid": { control: "boolean" },
    defaultValue: { control: "text" },
    disabled: { control: "boolean" },
    icon: { control: false },
    label: { control: "text" },
    labelStyle: { control: "select", options: ["floating", "static"] },
    onChange: { control: false },
    placeholder: { control: "text" },
    readOnly: { control: "boolean" },
    type: { control: "select", options: ["text", "email", "url", "tel"] },
    value: { control: false },
  },
  args: {
    "aria-invalid": false,
    defaultValue: "",
    disabled: false,
    label: "Full name",
    labelStyle: "floating",
    placeholder: "Alex Morgan",
    readOnly: false,
    type: "text",
  },
  component: Input,
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "padded" },
  render: (args) => <Input key={String(args.defaultValue)} {...args} />,
  tags: ["autodocs"],
  title: "Vandor UI/Input",
} satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const StaticLabel: Story = { args: { labelStyle: "static" } };
export const WithIcon: Story = {
  args: {
    icon: (
      <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 6 9 7 9-7" />
      </svg>
    ),
    label: "Email",
    placeholder: "alex@example.com",
    type: "email",
  },
};
export const Populated: Story = { args: { defaultValue: "Alex Morgan" } };
export const Disabled: Story = {
  args: { defaultValue: "Alex Morgan", disabled: true },
};
export const ReadOnly: Story = {
  args: { defaultValue: "Alex Morgan", readOnly: true },
};
export const Invalid: Story = {
  args: { "aria-describedby": "name-error", "aria-invalid": true },
  render: (args) => (
    <div className="grid gap-2">
      <Input {...args} />
      <p id="name-error" className="text-sm text-destructive">
        Enter your full name.
      </p>
    </div>
  ),
};
const ControlledField = ({
  defaultValue,
  onChange,
  value: _value,
  ...args
}: InputProps) => {
  const [value, setValue] = useState(String(defaultValue ?? ""));
  return (
    <div className="grid gap-2">
      <Input
        {...args}
        value={value}
        onChange={(event) => {
          setValue(event.currentTarget.value);
          onChange?.(event);
        }}
      />
      <output className="text-xs text-muted-foreground">
        Value: {value || "empty"}
      </output>
    </div>
  );
};
export const Controlled: Story = {
  argTypes: { defaultValue: { control: false } },
  render: (args) => <ControlledField {...args} />,
};
