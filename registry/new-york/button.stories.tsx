import type { Meta, StoryObj } from "@storybook/react";
import { Plus } from "lucide-react";

import { Button } from "./button";

const meta = {
  argTypes: {
    "aria-label": { control: "text" },
    asChild: { control: false },
    children: { control: "text", description: "Button label." },
    className: { control: "text" },
    disabled: { control: "boolean" },
    isLoading: { control: "boolean" },
    nativeButton: { control: false },
    render: { control: false },
    size: {
      control: "select",
      options: [
        "xs",
        "sm",
        "default",
        "lg",
        "icon-xs",
        "icon-sm",
        "icon",
        "icon-lg",
      ],
    },
    transition: { control: false },
    variant: {
      control: "select",
      options: [
        "default",
        "secondary",
        "outline",
        "ghost",
        "destructive",
        "link",
      ],
    },
    whileTap: { control: false },
  },
  args: {
    children: "Button",
    disabled: false,
    isLoading: false,
    size: "default",
    variant: "default",
  },
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Vandor UI/Button",
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  argTypes: { children: { control: false }, variant: { control: false } },
  render: (args) => (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {(
        [
          "default",
          "secondary",
          "outline",
          "ghost",
          "destructive",
          "link",
        ] as const
      ).map((variant) => (
        <Button {...args} key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  argTypes: {
    "aria-label": { control: false },
    children: { control: false },
    size: { control: false },
  },
  render: (args) => (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {(["xs", "sm", "default", "lg"] as const).map((size) => (
          <Button {...args} key={size} size={size}>
            {size}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {(["icon-xs", "icon-sm", "icon", "icon-lg"] as const).map((size) => (
          <Button
            {...args}
            key={size}
            size={size}
            aria-label={`Add item (${size})`}
          >
            <Plus aria-hidden="true" />
          </Button>
        ))}
      </div>
    </div>
  ),
};

export const Disabled: Story = { args: { disabled: true } };

export const Loading: Story = { args: { children: "Saving", isLoading: true } };

export const WithIcon: Story = {
  args: { children: "Add item" },
  render: (args) => (
    <Button {...args}>
      <Plus aria-hidden="true" data-icon="inline-start" />
      {args.children}
    </Button>
  ),
};

export const IconOnly: Story = {
  argTypes: { children: { control: false } },
  args: { "aria-label": "Add item", size: "icon" },
  render: (args) => (
    <Button {...args}>
      <Plus aria-hidden="true" />
    </Button>
  ),
};

export const AsLink: Story = {
  argTypes: { disabled: { control: false } },
  args: { asChild: true, children: "Browse components", variant: "outline" },
  parameters: {
    docs: {
      description: {
        story:
          "The child retains link semantics. Native disabled does not disable a link; isLoading blocks clicks. The fragment URL keeps this example inside Storybook.",
      },
    },
  },
  render: (args) => (
    <Button {...args}>
      <a href="#button-story">{args.children}</a>
    </Button>
  ),
};

export const WithoutPressAnimation: Story = {
  args: { children: "No scale feedback", whileTap: false },
};
