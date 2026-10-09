import type { Meta, StoryObj } from "@storybook/react";

import { BoringAvatar } from "./boring-avatar";

const meta = {
  argTypes: {
    alt: { control: "text" },
    colors: { control: "object" },
    name: { control: "text" },
    ref: { control: false },
    size: { control: { max: 128, min: 24, step: 1, type: "range" } },
    square: { control: "boolean" },
    src: { control: "text" },
    style: { control: false },
    variant: {
      control: "select",
      options: ["beam", "marble", "pixel", "sunset", "ring", "bauhaus"],
    },
  },
  args: {
    alt: "Vandor",
    name: "vandor",
    size: 64,
    square: false,
    variant: "beam",
  },
  component: BoringAvatar,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Vandor UI/BoringAvatar",
} satisfies Meta<typeof BoringAvatar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Variants: Story = {
  argTypes: { src: { control: false }, variant: { control: false } },
  render: (args) => (
    <div className="flex flex-wrap gap-4">
      {(["beam", "marble", "pixel", "sunset", "ring", "bauhaus"] as const).map(
        (variant) => (
          <div key={variant} className="flex flex-col items-center gap-2">
            <BoringAvatar {...args} variant={variant} src={undefined} />
            <span className="text-sm text-muted-foreground">{variant}</span>
          </div>
        )
      )}
    </div>
  ),
};
export const Sizes: Story = {
  argTypes: { size: { control: false } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {[24, 40, 64, 96].map((size) => (
        <BoringAvatar {...args} key={size} size={size} />
      ))}
    </div>
  ),
};
export const Square: Story = { args: { square: true } };
export const CustomPalette: Story = {
  args: { colors: ["#F2D7B6", "#B55A30", "#E8A652", "#783F51", "#42665E"] },
};
export const Photo: Story = {
  args: {
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23d9e4d5'/%3E%3Ccircle cx='50' cy='50' r='25' fill='%23596d51'/%3E%3C/svg%3E",
  },
};
export const FailedPhoto: Story = {
  args: { src: "data:image/png;base64,invalid" },
};
export const Decorative: Story = {
  argTypes: { alt: { control: false } },
  args: { alt: "" },
  render: (args) => (
    <div className="flex items-center gap-3">
      <BoringAvatar {...args} alt="" />
      <span>{args.name}</span>
    </div>
  ),
};
