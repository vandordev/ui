import type { Meta, StoryObj } from "@storybook/react";

import { PageContainer } from "./page-container";

const meta = {
  argTypes: {
    children: { control: "text" },
    className: { control: "text" },
    ref: { control: false },
    size: { control: "select", options: ["sm", "md", "lg", "xl", "full"] },
  },
  args: { children: "Page content", size: "lg" },
  component: PageContainer,
  parameters: { layout: "fullscreen" },
  render: ({ children, ...args }) => (
    <PageContainer {...args}>
      <div className="bg-muted py-8 text-sm text-foreground">{children}</div>
    </PageContainer>
  ),
  tags: ["autodocs"],
  title: "Vandor UI/PageContainer",
} satisfies Meta<typeof PageContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const FullWidth: Story = { args: { size: "full" } };
export const LongContent: Story = {
  args: {
    children:
      "Page content stays within the available width. Long prose wraps naturally; tables and unbroken values should manage overflow inside the page, not on the container.",
    size: "sm",
  },
};
export const Sizes: Story = {
  argTypes: { children: { control: false }, size: { control: false } },
  render: (args) => (
    <div className="flex flex-col gap-6 py-6">
      {(["sm", "md", "lg", "xl", "full"] as const).map((size) => (
        <PageContainer {...args} key={size} size={size}>
          <div className="bg-muted py-4 text-sm text-foreground">{size}</div>
        </PageContainer>
      ))}
    </div>
  ),
};
