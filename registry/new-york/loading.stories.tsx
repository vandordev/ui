import type { Meta, StoryObj } from "@storybook/react";

import { Loading } from "./loading";
import { loadingVariants } from "./loading-variants";

const meta = {
  argTypes: {
    "aria-label": { control: "text" },
    duration: { control: { max: 4, min: 0.25, step: 0.25, type: "range" } },
    size: { control: { max: 64, min: 16, step: 4, type: "range" } },
    text: { control: "text" },
    variant: { control: "select", options: loadingVariants },
    variantProps: { control: false },
  },
  args: {
    "aria-label": "Loading content",
    duration: 1,
    size: 32,
    text: "Loading",
    variant: "arc",
  },
  component: Loading,
  parameters: {
    docs: {
      description: {
        component:
          "Inherits your global theme/CSS. System prefers-reduced-motion replaces looping visuals with a static fallback; change the OS/browser preference to inspect it. Duration affects CSS-based loaders only.",
      },
    },
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "Vandor UI/Loading",
} satisfies Meta<typeof Loading>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const AllVariants: Story = {
  argTypes: { variant: { control: false }, variantProps: { control: false } },
  render: ({ variant: _variant, variantProps: _variantProps, ...args }) => (
    <div className="grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {loadingVariants.map((variant) => (
        <div
          key={variant}
          className="flex min-h-24 flex-col items-center justify-center gap-3"
        >
          <Loading {...args} variant={variant} />
          <span className="text-xs text-muted-foreground">{variant}</span>
        </div>
      ))}
    </div>
  ),
};
export const Text: Story = {
  args: { size: 20, text: "Saving draft", variant: "text-dots" },
};
export const CSSSize: Story = {
  argTypes: { size: { control: "text" } },
  args: { size: "2rem", variant: "ring" },
};
export const Terminal: Story = {
  argTypes: { variant: { control: false } },
  render: ({ variant: _variant, variantProps: _variantProps, ...args }) => (
    <Loading {...args} variant="terminal" variantProps={{ prompt: "$" }} />
  ),
};
export const CustomDots: Story = {
  argTypes: { variant: { control: false } },
  render: ({ variant: _variant, variantProps: _variantProps, ...args }) => (
    <Loading
      {...args}
      variant="dots-ring"
      variantProps={{ dotScale: 0.2, dots: 12 }}
    />
  ),
};
export const BusyRegion: Story = {
  argTypes: { "aria-label": { control: false } },
  render: (args) => (
    <section
      aria-label="Project activity"
      aria-busy="true"
      className="flex items-center gap-3"
    >
      <Loading {...args} aria-hidden="true" />
      <p role="status">Loading project activity…</p>
    </section>
  ),
};
