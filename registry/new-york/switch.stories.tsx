import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import type { SwitchProps } from "./switch";
import { Switch } from "./switch";

const meta = {
  argTypes: {
    animated: { control: "boolean" },
    "aria-invalid": { control: "boolean" },
    "aria-label": { control: "text" },
    checked: { control: false },
    defaultChecked: { control: "boolean" },
    dir: { control: "select", options: ["ltr", "rtl"] },
    disabled: { control: "boolean" },
    inputRef: { control: false },
    onCheckedChange: { control: false },
    readOnly: { control: "boolean" },
    render: { control: false },
    size: { control: "select", options: ["default", "sm"] },
  },
  args: {
    animated: true,
    "aria-label": "Enable notifications",
    defaultChecked: false,
    disabled: false,
    readOnly: false,
    size: "default",
  },
  component: Switch,
  parameters: { layout: "centered" },
  render: (args) => (
    <label className="flex items-center gap-3 text-sm">
      <Switch key={String(args.defaultChecked)} {...args} />
      <span>{args["aria-label"]}</span>
    </label>
  ),
  tags: ["autodocs"],
  title: "Vandor UI/Switch",
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const Small: Story = { args: { defaultChecked: true, size: "sm" } };
export const Disabled: Story = {
  args: { defaultChecked: true, disabled: true },
};
export const ReadOnly: Story = {
  args: { defaultChecked: true, readOnly: true },
};
export const Invalid: Story = { args: { "aria-invalid": true } };
export const WithoutMotion: Story = { args: { animated: false } };
export const RTL: Story = { args: { defaultChecked: true, dir: "rtl" } };

const ControlledExample = (args: SwitchProps) => {
  const [checked, setChecked] = useState(false);
  return (
    <label className="flex items-center gap-3 text-sm">
      <Switch {...args} checked={checked} onCheckedChange={setChecked} />
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
