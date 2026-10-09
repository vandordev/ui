import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { InputSecret } from "./input-secret";
import type { InputSecretProps } from "./input-secret";

const meta = {
  argTypes: {
    "aria-invalid": { control: "boolean" },
    copiedLabel: { control: "text" },
    copyLabel: { control: "text" },
    defaultValue: { control: "text" },
    disabled: { control: "boolean" },
    emptyLabel: { control: "text" },
    errorLabel: { control: "text" },
    label: { control: "text" },
    labelStyle: { control: "select", options: ["floating", "static"] },
    onChange: { control: false },
    readOnly: { control: "boolean" },
    unavailableLabel: { control: "text" },
    value: { control: false },
  },
  args: {
    "aria-invalid": false,
    copiedLabel: "Demo secret copied.",
    copyLabel: "Copy demo secret",
    defaultValue: "demo_key_not_a_real_credential",
    disabled: false,
    emptyLabel: "Secret is empty.",
    errorLabel: "Unable to copy secret.",
    label: "API key",
    labelStyle: "floating",
    readOnly: false,
    unavailableLabel: "Clipboard is unavailable.",
  },
  component: InputSecret,
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
          "Fake credentials only. Copy uses the browser clipboard on a secure origin; permission denial is announced by the component. Never enter real secrets in Storybook.",
      },
    },
    layout: "padded",
  },
  render: (args) => <InputSecret key={String(args.defaultValue)} {...args} />,
  tags: ["autodocs"],
  title: "Vandor UI/Input Secret",
} satisfies Meta<typeof InputSecret>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Empty: Story = { args: { defaultValue: "" } };
export const StaticLabel: Story = { args: { labelStyle: "static" } };
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true } };
export const Invalid: Story = { args: { "aria-invalid": true } };
const ControlledSecret = ({
  defaultValue,
  onChange,
  value: _value,
  ...args
}: InputSecretProps) => {
  const [value, setValue] = useState(String(defaultValue ?? ""));
  return (
    <div className="grid gap-2">
      <InputSecret
        {...args}
        value={value}
        onChange={(event) => {
          setValue(event.currentTarget.value);
          onChange?.(event);
        }}
      />
      <output className="text-xs text-muted-foreground">
        {value.length} characters. Secret value is not echoed.
      </output>
    </div>
  );
};
export const Controlled: Story = {
  argTypes: { defaultValue: { control: false } },
  render: (args) => <ControlledSecret {...args} />,
};
