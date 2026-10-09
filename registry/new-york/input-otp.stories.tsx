import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { InputOTP } from "./input-otp";
import type { InputOTPProps } from "./input-otp";

const meta = {
  argTypes: {
    "aria-invalid": { control: "boolean" },
    "aria-label": { control: "text" },
    defaultValue: { control: "text" },
    disabled: { control: "boolean" },
    length: { control: { max: 8, min: 1, step: 1, type: "number" } },
    onComplete: { control: false },
    onValueChange: { control: false },
    readOnly: { control: "boolean" },
    type: { control: "select", options: ["numeric", "alphanumeric"] },
    value: { control: false },
  },
  args: {
    "aria-invalid": false,
    "aria-label": "Verification code",
    defaultValue: "",
    disabled: false,
    length: 6,
    readOnly: false,
    type: "numeric",
  },
  component: InputOTP,
  decorators: [
    (Story) => (
      <div className="max-w-full overflow-x-auto p-1">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "padded" },
  render: (args) => (
    <InputOTP
      key={`${args.length}-${args.type}-${args.defaultValue}`}
      {...args}
    />
  ),
  tags: ["autodocs"],
  title: "Vandor UI/Input OTP",
} satisfies Meta<typeof InputOTP>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const FourDigits: Story = { args: { length: 4 } };
export const Partial: Story = { args: { defaultValue: "123" } };
export const Complete: Story = { args: { defaultValue: "123456" } };
export const Alphanumeric: Story = {
  args: { defaultValue: "AB12", type: "alphanumeric" },
};
export const Disabled: Story = {
  args: { defaultValue: "123", disabled: true },
};
export const ReadOnly: Story = {
  args: { defaultValue: "123456", readOnly: true },
};
export const Invalid: Story = {
  args: { "aria-describedby": "otp-error", "aria-invalid": true },
  render: (args) => (
    <div className="grid gap-2">
      <InputOTP {...args} />
      <p id="otp-error" className="text-sm text-destructive">
        This code has expired.
      </p>
    </div>
  ),
};
const CompletionExample = ({
  defaultValue,
  onComplete,
  onValueChange,
  value: _value,
  ...args
}: InputOTPProps) => {
  const [value, setValue] = useState(defaultValue ?? "");
  const [completed, setCompleted] = useState("");
  return (
    <div className="grid gap-2">
      <InputOTP
        {...args}
        value={value}
        onValueChange={(next) => {
          setValue(next);
          setCompleted("");
          onValueChange?.(next);
        }}
        onComplete={(next) => {
          setCompleted(next);
          onComplete?.(next);
        }}
      />
      <output className="text-xs text-muted-foreground">
        Value: {value || "empty"}
      </output>
      <p role="status" className="text-xs text-muted-foreground">
        {completed ? "Code complete (demo only)." : "Enter a complete code."}
      </p>
    </div>
  );
};
export const ControlledCompletion: Story = {
  argTypes: { defaultValue: { control: false } },
  render: (args) => (
    <CompletionExample key={`${args.length}-${args.type}`} {...args} />
  ),
};
