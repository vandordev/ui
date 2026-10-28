import type { Meta, StoryObj } from "@storybook/react";

import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "./frame";

const meta = {
  argTypes: {
    children: { control: false },
    dense: { control: "boolean" },
    ref: { control: false },
    spacing: { control: "select", options: ["sm", "default", "lg"] },
    stacked: { control: "boolean" },
    variant: { control: "select", options: ["default", "ghost"] },
  },
  args: {
    dense: false,
    spacing: "default",
    stacked: false,
    variant: "default",
  },
  component: Frame,
  render: (args) => (
    <Frame {...args} className="w-full max-w-md">
      <FrameHeader>
        <FrameTitle>Workspace</FrameTitle>
        <FrameDescription>
          Manage your deployment environments.
        </FrameDescription>
      </FrameHeader>
      <FramePanel>Production is up to date.</FramePanel>
      <FramePanel>Preview is ready for review.</FramePanel>
      <FrameFooter>Last synced just now</FrameFooter>
    </Frame>
  ),
  tags: ["autodocs"],
  title: "Vandor UI/Frame",
} satisfies Meta<typeof Frame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Separated: Story = {};
export const Stacked: Story = { args: { stacked: true } };
export const Dense: Story = {
  args: { dense: true, spacing: "sm", stacked: true },
};
export const Ghost: Story = { args: { variant: "ghost" } };
export const FitPanels: Story = {
  render: (args) => (
    <Frame {...args} className="min-h-80 w-full max-w-md">
      <FrameHeader>
        <FrameTitle>Content-sized panels</FrameTitle>
      </FrameHeader>
      <FramePanel fit>This panel does not grow.</FramePanel>
      <FramePanel>The remaining height belongs to this panel.</FramePanel>
    </Frame>
  ),
};
export const LongContent: Story = {
  render: (args) => (
    <Frame {...args} className="w-full max-w-xs">
      <FrameHeader>
        <FrameTitle>
          A workspace with a long descriptive name that wraps naturally
        </FrameTitle>
      </FrameHeader>
      <FramePanel>
        deployment-preview-with-a-very-long-unbroken-identifier.example.invalid
      </FramePanel>
    </Frame>
  ),
};
