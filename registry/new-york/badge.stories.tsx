import type { Meta, StoryObj } from "@storybook/react";
import { Check, LoaderCircle } from "lucide-react";

import { Badge } from "./badge";
import type { BadgeProps } from "./badge";

const variants = [
  "default",
  "secondary",
  "outline",
  "success",
  "info",
  "warning",
  "destructive",
  "focus",
  "invert",
  "primary-light",
  "success-light",
  "info-light",
  "warning-light",
  "destructive-light",
  "focus-light",
  "invert-light",
  "primary-outline",
  "success-outline",
  "info-outline",
  "warning-outline",
  "destructive-outline",
  "focus-outline",
  "invert-outline",
] as const satisfies readonly NonNullable<BadgeProps["variant"]>[];

const meta = {
  argTypes: {
    children: { control: "text" },
    className: { control: "text" },
    radius: { control: "select", options: ["default", "full"] },
    render: { control: false },
    size: { control: "select", options: ["xs", "sm", "default", "lg", "xl"] },
    variant: { control: "select", options: variants },
  },
  args: {
    children: "Ready",
    radius: "default",
    size: "default",
    variant: "default",
  },
  component: Badge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Vandor UI/Badge",
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Variants: Story = {
  argTypes: { children: { control: false }, variant: { control: false } },
  render: (args) => (
    <div className="flex max-w-xl flex-wrap items-center justify-center gap-2">
      {variants.map((variant) => (
        <Badge {...args} key={variant} variant={variant}>
          {variant}
        </Badge>
      ))}
    </div>
  ),
};
export const Sizes: Story = {
  argTypes: { children: { control: false }, size: { control: false } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      {(["xs", "sm", "default", "lg", "xl"] as const).map((size) => (
        <Badge {...args} key={size} size={size}>
          {size}
        </Badge>
      ))}
    </div>
  ),
};
export const Pill: Story = { args: { radius: "full", variant: "outline" } };
export const WithDot: Story = {
  args: { variant: "success-light" },
  render: ({ children, ...args }) => (
    <Badge {...args}>
      <span
        aria-hidden="true"
        className="size-1.5 shrink-0 rounded-full bg-current"
      />
      {children}
    </Badge>
  ),
};
export const WithIcon: Story = {
  args: { children: "Verified", variant: "success-light" },
  render: ({ children, ...args }) => (
    <Badge {...args}>
      <Check aria-hidden="true" />
      {children}
    </Badge>
  ),
};
export const WithSpinner: Story = {
  args: { children: "Refreshing", variant: "info-light" },
  render: ({ children, ...args }) => (
    <Badge {...args} role="status" aria-live="polite">
      <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />
      {children}
    </Badge>
  ),
};
export const Link: Story = {
  args: { children: "Read documentation", variant: "outline" },
  render: (args) => (
    <Badge
      {...args}
      render={
        <a
          href="https://reui.io/docs/components/base/badge"
          aria-label={
            typeof args.children === "string"
              ? args.children
              : "Read documentation"
          }
        />
      }
    />
  ),
};
export const LongLabel: Story = {
  args: {
    children: "A long descriptive status that should remain readable",
    size: "xl",
    variant: "secondary",
  },
};
