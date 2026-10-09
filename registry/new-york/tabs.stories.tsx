import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { Tabs } from "./tabs";

const items = [
  {
    content: "Your project at a glance.",
    label: "Overview",
    value: "overview",
  },
  {
    content: "Recent updates and conversations.",
    label: "Activity",
    value: "activity",
  },
  {
    content: "Manage project preferences.",
    label: "Settings",
    value: "settings",
  },
];
const meta = {
  argTypes: {
    activationMode: { control: "select", options: ["manual", "automatic"] },
    animated: { control: "boolean" },
    "aria-label": { control: "text" },
    defaultValue: { control: false },
    items: { control: false },
    keepMounted: { control: "boolean" },
    onValueChange: { control: false },
    orientation: { control: "select", options: ["horizontal", "vertical"] },
    value: { control: false },
    variant: { control: "select", options: ["underline", "pill", "segmented"] },
  },
  args: {
    activationMode: "manual",
    animated: true,
    "aria-label": "Project sections",
    items,
    keepMounted: false,
    orientation: "horizontal",
    variant: "underline",
  },
  component: Tabs,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Vandor UI/Tabs",
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Pill: Story = { args: { variant: "pill" } };
export const Segmented: Story = { args: { variant: "segmented" } };
export const Vertical: Story = { args: { orientation: "vertical" } };
export const RTL: Story = { args: { dir: "rtl" } };
export const WithoutMotion: Story = { args: { animated: false } };
export const Disabled: Story = {
  args: {
    items: items.map((item) => ({
      ...item,
      disabled: item.value === "activity",
    })),
  },
};
export const Automatic: Story = { args: { activationMode: "automatic" } };
export const KeepMounted: Story = {
  args: {
    items: [
      {
        content: (
          <label>
            Display name{" "}
            <input
              aria-label="Display name"
              defaultValue="Alex"
              className="rounded-md border bg-background px-3 py-2"
            />
          </label>
        ),
        label: "Draft",
        value: "draft",
      },
      {
        content: "Return to Draft to find your changes preserved.",
        label: "Preview",
        value: "preview",
      },
    ],
    keepMounted: true,
  },
};
export const Links: Story = {
  argTypes: {
    activationMode: { control: false },
    keepMounted: { control: false },
  },
  render: ({ variant, orientation, animated, "aria-label": label }) => (
    <Tabs
      aria-label={label}
      variant={variant}
      orientation={orientation}
      animated={animated}
      items={[
        { active: true, link: <a href="#overview">Overview</a> },
        { link: <a href="#activity">Activity</a> },
        {
          link: (
            <a href="https://example.com" target="_blank" rel="noreferrer">
              External
            </a>
          ),
        },
      ]}
    />
  ),
};
const ControlledExample = ({
  variant,
  orientation,
  animated,
}: {
  variant?: "underline" | "pill" | "segmented";
  orientation?: "horizontal" | "vertical";
  animated?: boolean;
}) => {
  const [value, setValue] = useState<string | null>("overview");
  return (
    <Tabs
      aria-label="Controlled project sections"
      items={items}
      value={value}
      onValueChange={setValue}
      variant={variant}
      orientation={orientation}
      animated={animated}
    />
  );
};
export const Controlled: Story = {
  argTypes: {
    activationMode: { control: false },
    "aria-label": { control: false },
    keepMounted: { control: false },
  },
  render: (args) => <ControlledExample {...args} />,
};
