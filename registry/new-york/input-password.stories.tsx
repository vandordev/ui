import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { InputPassword } from "./input-password";
import type { InputPasswordProps } from "./input-password";

const meta = {
  argTypes: {
    "aria-invalid": { control: "boolean" },
    defaultValue: { control: "text" },
    disabled: { control: "boolean" },
    label: { control: "text" },
    labelStyle: { control: "select", options: ["floating", "static"] },
    onChange: { control: false },
    placeholder: { control: "text" },
    readOnly: { control: "boolean" },
    value: { control: false },
  },
  args: {
    "aria-invalid": false,
    autoComplete: "new-password",
    defaultValue: "demo-password-only",
    disabled: false,
    label: "Password",
    labelStyle: "floating",
    placeholder: "Enter a password",
    readOnly: false,
  },
  component: InputPassword,
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "Demo credentials only. Use the visibility button to reveal or hide the field; do not enter real passwords in Storybook.",
      },
    },
    layout: "padded",
  },
  render: (args) => <InputPassword key={String(args.defaultValue)} {...args} />,
  tags: ["autodocs"],
  title: "Vandor UI/Input Password",
} satisfies Meta<typeof InputPassword>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Empty: Story = { args: { defaultValue: "" } };
export const StaticLabel: Story = { args: { labelStyle: "static" } };
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true } };
export const Invalid: Story = {
  args: { "aria-describedby": "password-error", "aria-invalid": true },
  render: (args) => (
    <div className="grid gap-2">
      <InputPassword {...args} />
      <p id="password-error" className="text-sm text-destructive">
        Use at least 12 characters.
      </p>
    </div>
  ),
};
const ControlledPassword = ({
  defaultValue,
  onChange,
  value: _value,
  ...args
}: InputPasswordProps) => {
  const [value, setValue] = useState(String(defaultValue ?? ""));
  return (
    <div className="grid gap-2">
      <InputPassword
        {...args}
        value={value}
        onChange={(event) => {
          setValue(event.currentTarget.value);
          onChange?.(event);
        }}
      />
      <output className="text-xs text-muted-foreground">
        {value.length} characters
      </output>
    </div>
  );
};
export const Controlled: Story = {
  argTypes: { defaultValue: { control: false } },
  render: (args) => <ControlledPassword {...args} />,
};
