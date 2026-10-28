import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { DateTime } from "./date-time";

const meta = {
  argTypes: {
    fallback: { control: "text" },
    locale: { control: "text" },
    timeZone: { control: "text" },
    value: { control: "text" },
  },
  args: {
    fallback: "—",
    locale: "en-US",
    timeZone: "UTC",
    value: "2026-10-24T08:00:00Z",
  },
  component: DateTime,
  title: "Vandor UI/DateTime",
} satisfies Meta<typeof DateTime>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Localized: Story = {
  args: { locale: "id-ID", timeZone: "Asia/Jakarta" },
};
export const DateOnly: Story = { args: { format: { dateStyle: "long" } } };
export const TimeOnly: Story = {
  args: { format: { hour: "numeric", minute: "2-digit" } },
};
export const Invalid: Story = {
  args: { fallback: "Invalid timestamp", value: "2026-02-30T08:00:00Z" },
};
export const NativeProps: Story = {
  args: { id: "created-at", title: "Created at" },
};
export const ChangingValue: Story = {
  render: function Changing() {
    const [value, setValue] = useState("2026-10-24T08:00:00Z");
    return (
      <div className="grid gap-2">
        <DateTime value={value} />
        <button type="button" onClick={() => setValue("2026-10-25T08:00:00Z")}>
          Next day
        </button>
      </div>
    );
  },
};
