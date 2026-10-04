/* eslint-disable sort-keys */
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { DateRangePicker } from "./date-range-picker";

const meta = {
  argTypes: {
    clearable: { control: "boolean" },
    defaultValue: { control: false },
    disabled: { control: "boolean" },
    disabledDates: { control: false },
    features: { control: "check", options: ["twoMonths", "shortcuts"] },
    label: { control: "text" },
    locale: { control: false },
    motion: { control: "boolean" },
    now: { control: false },
    onOpenChange: { control: false },
    onValueChange: { control: false },
    open: { control: false },
    placeholder: { control: "text" },
    readOnly: { control: "boolean" },
    value: { control: false },
    weekStartsOn: { control: "select", options: [0, 1, 6] },
  },
  args: {
    clearable: true,
    disabled: false,
    features: [],
    label: "Reporting period",
    motion: true,
    placeholder: "Select dates",
    readOnly: false,
    weekStartsOn: 1,
  },
  component: DateRangePicker,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Vandor UI/DateRangePicker",
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Populated: Story = {
  args: {
    defaultValue: { from: new Date(2026, 9, 5), to: new Date(2026, 9, 12) },
  },
};
export const Shortcuts: Story = {
  args: { features: ["shortcuts", "twoMonths"] },
};
export const ReadOnly: Story = { args: { ...Populated.args, readOnly: true } };
export const Disabled: Story = { args: { disabled: true } };
export const WithoutMotion: Story = { args: { motion: false } };
export const Controlled: Story = {
  render: function ControlledRange(args) {
    const [range, setRange] = useState<DateRange>();
    return <DateRangePicker {...args} value={range} onValueChange={setRange} />;
  },
};
