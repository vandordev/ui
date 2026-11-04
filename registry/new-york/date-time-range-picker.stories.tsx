/* eslint-disable sort-keys */
import type { Meta, StoryObj } from "@storybook/react";
import { id } from "date-fns/locale";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { DateTimeRangePicker } from "./date-time-range-picker";

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
    precision: { control: "inline-radio", options: ["minute", "second"] },
    readOnly: { control: "boolean" },
    value: { control: false },
  },
  args: {
    clearable: true,
    dateFormat: "PPP p",
    disabled: false,
    label: "Maintenance window",
    motion: true,
    placeholder: "Select date and time range",
    precision: "minute",
    readOnly: false,
  },
  component: DateTimeRangePicker,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Vandor UI/DateTimeRangePicker",
} satisfies Meta<typeof DateTimeRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Populated: Story = {
  args: {
    defaultValue: {
      from: new Date(2026, 9, 5, 22, 0),
      to: new Date(2026, 9, 6, 6, 30),
    },
  },
};
export const SameDayWindow: Story = {
  args: {
    defaultValue: {
      from: new Date(2026, 9, 5, 9, 0),
      to: new Date(2026, 9, 5, 17, 30),
    },
    dateFormat: "PPP HH:mm",
  },
};
export const WithSeconds: Story = {
  args: { ...Populated.args, dateFormat: "PPP pp", precision: "second" },
};
export const ReadOnly: Story = { args: { ...Populated.args, readOnly: true } };
export const Disabled: Story = { args: { disabled: true } };
export const Indonesian: Story = {
  args: { ...Populated.args, dateFormat: "PPP HH:mm", locale: id },
};
export const WithoutMotion: Story = { args: { motion: false } };
export const Controlled: Story = {
  render: function ControlledPicker(args) {
    const [range, setRange] = useState<DateRange>();
    return (
      <DateTimeRangePicker {...args} value={range} onValueChange={setRange} />
    );
  },
};
