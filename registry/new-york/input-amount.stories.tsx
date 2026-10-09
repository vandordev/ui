import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { InputAmount } from "./input-amount";
import type { InputAmountProps } from "./input-amount";

const meta = {
  argTypes: {
    allowNegative: { control: "boolean" },
    "aria-invalid": { control: "boolean" },
    "aria-label": { control: "text" },
    decimalScale: { control: { max: 6, min: 0, type: "number" } },
    decimalSeparator: { control: "select", options: [".", ","] },
    defaultValue: { control: "text" },
    disabled: { control: "boolean" },
    fixedDecimalScale: { control: "boolean" },
    onValueChange: { control: false },
    prefix: { control: "text" },
    readOnly: { control: "boolean" },
    suffix: { control: "text" },
    thousandSeparator: { control: "select", options: [false, " "] },
    value: { control: false },
  },
  args: {
    allowNegative: false,
    "aria-invalid": false,
    "aria-label": "Amount",
    decimalScale: 2,
    decimalSeparator: ".",
    defaultValue: "1250.5",
    disabled: false,
    fixedDecimalScale: true,
    prefix: "$ ",
    readOnly: false,
    suffix: "",
    thousandSeparator: " ",
  },
  component: InputAmount,
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
          "Controls use a space or no thousands separator so changing the decimal separator remains valid. Values are decimal strings, not formatted display text.",
      },
    },
    layout: "padded",
  },
  render: (args) => <InputAmount key={String(args.defaultValue)} {...args} />,
  tags: ["autodocs"],
  title: "Vandor UI/Input Amount",
} satisfies Meta<typeof InputAmount>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Empty: Story = { args: { defaultValue: "" } };
export const DecimalComma: Story = {
  args: { decimalSeparator: ",", prefix: "€ " },
};
export const Integer: Story = {
  args: { decimalScale: 0, defaultValue: "250000", prefix: "Rp " },
};
export const Negative: Story = {
  args: { allowNegative: true, defaultValue: "-42.5" },
};
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true } };
export const Invalid: Story = { args: { "aria-invalid": true } };
const ControlledAmount = ({
  defaultValue,
  onValueChange,
  value: _value,
  ...args
}: InputAmountProps) => {
  const [value, setValue] = useState(defaultValue ?? "");
  return (
    <div className="grid gap-2">
      <InputAmount
        {...args}
        value={value}
        onValueChange={(next) => {
          setValue(next);
          onValueChange?.(next);
        }}
      />
      <output className="text-xs text-muted-foreground">
        Decimal value: {value || "empty"}
      </output>
    </div>
  );
};
export const Controlled: Story = {
  argTypes: { defaultValue: { control: false } },
  render: (args) => <ControlledAmount {...args} />,
};
