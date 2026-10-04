/* eslint-disable sort-keys */
import type { Meta, StoryObj } from "@storybook/react";
import { id } from "date-fns/locale";
import { useState } from "react";

import { DatePicker } from "./date-picker";

const meta = {
  argTypes: {
    clearable: { control: "boolean" },
    dateFormat: { control: "text" },
    defaultValue: { control: false },
    disabled: { control: "boolean" },
    disabledDates: { control: false },
    label: { control: "text" },
    locale: { control: false },
    motion: { control: "boolean" },
    onOpenChange: { control: false },
    onValueChange: { control: false },
    open: { control: false },
    placeholder: { control: "text" },
    readOnly: { control: "boolean" },
    value: { control: false },
  },
  args: {
    clearable: true,
    dateFormat: "PPP",
    disabled: false,
    label: "Appointment date",
    motion: true,
    placeholder: "Select a date",
    readOnly: false,
  },
  component: DatePicker,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Vandor UI/DatePicker",
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Populated: Story = {
  args: { defaultValue: new Date(2026, 9, 5) },
};
export const ReadOnly: Story = { args: { ...Populated.args, readOnly: true } };
export const Disabled: Story = { args: { disabled: true } };
export const Indonesian: Story = { args: { ...Populated.args, locale: id } };
export const WithoutMotion: Story = { args: { motion: false } };
export const Controlled: Story = {
  render: function ControlledPicker(args) {
    const [date, setDate] = useState<Date>();
    return <DatePicker {...args} value={date} onValueChange={setDate} />;
  },
};
