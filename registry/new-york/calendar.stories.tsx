/* eslint-disable sort-keys */
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { id } from "react-day-picker/locale";

import { Calendar } from "./calendar";
import type { CalendarProps } from "./calendar";

const Selection = (args: CalendarProps) => {
  const [date, setDate] = useState<Date>();
  const [dates, setDates] = useState<Date[]>([]);
  const [range, setRange] = useState<DateRange>();
  if (args.mode === "range") {
    return (
      <Calendar
        {...args}
        mode="range"
        required={false}
        selected={range}
        onSelect={setRange}
      />
    );
  }
  if (args.mode === "multiple") {
    return (
      <Calendar
        {...args}
        mode="multiple"
        required={false}
        selected={dates}
        onSelect={(next) => setDates(next ?? [])}
      />
    );
  }
  return (
    <Calendar
      {...args}
      mode="single"
      required={false}
      selected={date}
      onSelect={setDate}
    />
  );
};

const meta = {
  argTypes: {
    buttonVariant: { control: "select", options: ["ghost", "outline"] },
    captionLayout: {
      control: "select",
      options: ["label", "dropdown", "dropdown-months", "dropdown-years"],
    },
    components: { control: false },
    defaultMonth: { control: false },
    disabled: { control: false },
    locale: { control: false },
    mode: { control: "select", options: ["single", "multiple", "range"] },
    month: { control: false },
    motion: { control: "boolean" },
    numberOfMonths: { control: "select", options: [1, 2] },
    onSelect: { control: false },
    selected: { control: false },
    showOutsideDays: { control: "boolean" },
    showWeekNumber: { control: "boolean" },
    weekStartsOn: { control: "select", options: [0, 1, 6] },
  },
  args: {
    buttonVariant: "ghost",
    captionLayout: "label",
    defaultMonth: new Date(2026, 9, 1),
    mode: "single",
    motion: true,
    numberOfMonths: 1,
    showOutsideDays: true,
    showWeekNumber: false,
    weekStartsOn: 0,
  },
  component: Calendar,
  parameters: { layout: "centered" },
  render: Selection,
  tags: ["autodocs"],
  title: "Vandor UI/Calendar",
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Multiple: Story = { args: { mode: "multiple" } };
export const Range: Story = { args: { mode: "range", numberOfMonths: 2 } };
export const Dropdowns: Story = {
  args: {
    captionLayout: "dropdown",
    endMonth: new Date(2027, 11),
    startMonth: new Date(2025, 0),
  },
};
export const DisabledDates: Story = {
  args: { disabled: { dayOfWeek: [0, 6] } },
};
export const Indonesian: Story = { args: { locale: id, weekStartsOn: 1 } };
export const WithoutMotion: Story = { args: { motion: false } };
export const SelectedRange: Story = {
  argTypes: { mode: { control: false } },
  args: {
    mode: "range",
    selected: { from: new Date(2026, 9, 5), to: new Date(2026, 9, 12) },
  },
  render: (args) => <Calendar {...args} />,
};
