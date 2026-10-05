import type { Meta, StoryObj } from "@storybook/react";
import { happy, thinking } from "blobatar/expression";

import { Blobatar } from "./blobatar";

const meta = {
  argTypes: {
    alt: { control: "text" },
    blobatar: { control: false },
    followPointer: { control: "boolean" },
    name: { control: "text" },
    pointerTravel: { control: { max: 4, min: 1, step: 0.5, type: "range" } },
    ref: { control: false },
    size: { control: { max: 128, min: 24, step: 1, type: "range" } },
    src: { control: "text" },
    style: { control: false },
  },
  args: {
    alt: "Vandor",
    followPointer: false,
    name: "vandor",
    pointerTravel: 3,
    size: 64,
  },
  component: Blobatar,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Vandor UI/Blobatar",
} satisfies Meta<typeof Blobatar>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const PointerTracking: Story = {
  args: { followPointer: true, size: 128 },
};
export const Sizes: Story = {
  argTypes: { size: { control: false } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {[24, 40, 64, 96].map((size) => (
        <Blobatar {...args} key={size} size={size} />
      ))}
    </div>
  ),
};
export const Crowd: Story = {
  argTypes: {
    alt: { control: false },
    name: { control: false },
    src: { control: false },
  },
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      {["alain", "vandor", "luna", "mars"].map((name) => (
        <Blobatar {...args} key={name} name={name} alt={name} src={undefined} />
      ))}
    </div>
  ),
};
export const Photo: Story = {
  args: {
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23d9e4d5'/%3E%3Ccircle cx='50' cy='50' r='25' fill='%23596d51'/%3E%3C/svg%3E",
  },
};
export const FailedPhoto: Story = {
  args: { src: "data:image/png;base64,invalid" },
};
export const HoverMotion: Story = {
  args: { blobatar: { animate: "hover", expression: happy } },
};
export const Thinking: Story = {
  args: { blobatar: { animate: "always", expression: thinking } },
};
export const Backdrops: Story = {
  argTypes: { blobatar: { control: false }, src: { control: false } },
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      {([false, "square", "circle", "squircle"] as const).map((background) => (
        <Blobatar
          {...args}
          key={String(background)}
          src={undefined}
          blobatar={{ background }}
        />
      ))}
    </div>
  ),
};
export const Decorative: Story = {
  argTypes: { alt: { control: false } },
  args: { alt: "" },
};
