import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { Checkbox } from "./checkbox";

const meta = {
  argTypes: {
    animated: { control: "boolean" },
    "aria-invalid": { control: "boolean" },
    "aria-label": { control: "text" },
    checked: { control: false },
    defaultChecked: { control: "boolean" },
    disabled: { control: "boolean" },
    indeterminate: { control: "boolean" },
    inputRef: { control: false },
    onCheckedChange: { control: false },
    readOnly: { control: "boolean" },
    render: { control: false },
  },
  args: {
    animated: true,
    "aria-label": "Enable notifications",
    defaultChecked: false,
    disabled: false,
    indeterminate: false,
    readOnly: false,
  },
  component: Checkbox,
  parameters: { layout: "centered" },
  render: (args) => (
    <label className="flex items-center gap-3 text-sm">
      <Checkbox key={String(args.defaultChecked)} {...args} />
      <span>{args["aria-label"]}</span>
    </label>
  ),
  tags: ["autodocs"],
  title: "Vandor UI/Checkbox",
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const Indeterminate: Story = { args: { indeterminate: true } };
export const Disabled: Story = {
  args: { defaultChecked: true, disabled: true },
};
export const ReadOnly: Story = {
  args: { defaultChecked: true, readOnly: true },
};
export const Invalid: Story = { args: { "aria-invalid": true } };
export const WithoutMotion: Story = { args: { animated: false } };

const ControlledExample = (args: React.ComponentProps<typeof Checkbox>) => {
  const [checked, setChecked] = useState(false);
  return (
    <label className="flex items-center gap-3 text-sm">
      <Checkbox {...args} checked={checked} onCheckedChange={setChecked} />
      <span>{checked ? "Notifications enabled" : "Enable notifications"}</span>
    </label>
  );
};
export const Controlled: Story = {
  argTypes: {
    "aria-label": { control: false },
    defaultChecked: { control: false },
  },
  render: (args) => <ControlledExample {...args} aria-label={undefined} />,
};
