import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { InputPhone } from "./input-phone";
import type { InputPhoneProps } from "./input-phone";

const meta = {
  argTypes: {
    "aria-invalid": { control: "boolean" },
    countrySelectLabel: { control: "text" },
    defaultCountry: {
      control: "select",
      options: ["ID", "US", "GB", "DE", "JP"],
    },
    defaultValue: { control: "text" },
    disabled: { control: "boolean" },
    label: { control: "text" },
    labelStyle: { control: "select", options: ["floating", "static"] },
    locale: { control: "select", options: ["en", "id", "de", "ja"] },
    onValueChange: { control: false },
    readOnly: { control: "boolean" },
    value: { control: false },
  },
  args: {
    "aria-invalid": false,
    countrySelectLabel: "Country calling code",
    defaultCountry: "ID",
    defaultValue: "",
    disabled: false,
    label: "Phone number",
    labelStyle: "floating",
    locale: "en",
    readOnly: false,
  },
  component: InputPhone,
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "padded" },
  render: (args) => (
    <InputPhone key={`${args.defaultCountry}-${args.defaultValue}`} {...args} />
  ),
  tags: ["autodocs"],
  title: "Vandor UI/Input Phone",
} satisfies Meta<typeof InputPhone>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Populated: Story = { args: { defaultValue: "6281234567890" } };
export const UnitedStates: Story = {
  args: { defaultCountry: "US", defaultValue: "12025550123" },
};
export const Localized: Story = {
  args: {
    countrySelectLabel: "Kode negara",
    label: "Nomor telepon",
    locale: "id",
  },
};
export const StaticLabel: Story = { args: { labelStyle: "static" } };
export const Disabled: Story = {
  args: { defaultValue: "6281234567890", disabled: true },
};
export const ReadOnly: Story = {
  args: { defaultValue: "6281234567890", readOnly: true },
};
export const Invalid: Story = { args: { "aria-invalid": true } };
const ControlledPhone = ({
  defaultValue,
  onValueChange,
  value: _value,
  ...args
}: InputPhoneProps) => {
  const [value, setValue] = useState<string | undefined>(defaultValue ?? "");
  return (
    <div className="grid gap-2">
      <InputPhone
        {...args}
        value={value ?? ""}
        onValueChange={(next) => {
          setValue(next);
          onValueChange?.(next);
        }}
      />
      <output className="text-xs text-muted-foreground">
        International digits: {value || "empty"}
      </output>
    </div>
  );
};
export const Controlled: Story = {
  argTypes: { defaultValue: { control: false } },
  args: { defaultValue: "6281234567890" },
  render: (args) => <ControlledPhone key={args.defaultCountry} {...args} />,
};
