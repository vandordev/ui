import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";
import type { PopoverContentProps } from "./popover";

type Args = Pick<
  PopoverContentProps,
  "side" | "align" | "animated" | "sideOffset"
> & { disabled: boolean; defaultOpen: boolean; title: string };
const triggerClass =
  "rounded-md border border-input bg-background px-3 py-2 text-sm outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";
const StoryPopover = ({ disabled, defaultOpen, title, ...content }: Args) => (
  <Popover key={String(defaultOpen)} defaultOpen={defaultOpen}>
    <PopoverTrigger disabled={disabled} className={triggerClass}>
      Manage access
    </PopoverTrigger>
    <PopoverContent {...content}>
      <PopoverHeader>
        <PopoverTitle>{title}</PopoverTitle>
        <PopoverDescription>
          Only invited members can view this workspace.
        </PopoverDescription>
      </PopoverHeader>
      <PopoverClose className={triggerClass}>Done</PopoverClose>
    </PopoverContent>
  </Popover>
);
const meta = {
  argTypes: {
    align: { control: "select", options: ["start", "center", "end"] },
    animated: { control: "boolean" },
    defaultOpen: { control: "boolean" },
    disabled: { control: "boolean" },
    side: { control: "select", options: ["top", "bottom", "left", "right"] },
    sideOffset: { control: { max: 24, min: 0, step: 1, type: "range" } },
    title: { control: "text" },
  },
  args: {
    align: "start",
    animated: true,
    defaultOpen: false,
    disabled: false,
    side: "bottom",
    sideOffset: 6,
    title: "Workspace access",
  },
  component: StoryPopover,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Vandor UI/Popover",
} satisfies Meta<typeof StoryPopover>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const InitiallyOpen: Story = { args: { defaultOpen: true } };
export const WithoutAnimation: Story = { args: { animated: false } };
export const LongContent: Story = {
  argTypes: { defaultOpen: { control: false }, title: { control: false } },
  render: ({ disabled, ...args }) => (
    <Popover>
      <PopoverTrigger disabled={disabled} className={triggerClass}>
        Read guidelines
      </PopoverTrigger>
      <PopoverContent
        side={args.side}
        align={args.align}
        sideOffset={args.sideOffset}
        animated={args.animated}
        className="max-h-64"
      >
        <PopoverTitle>Workspace guidelines</PopoverTitle>
        {Array.from({ length: 12 }, (_, index) => (
          <p key={index}>
            Guideline {index + 1}: share project access only with invited
            members.
          </p>
        ))}
        <PopoverClose className={triggerClass}>Done</PopoverClose>
      </PopoverContent>
    </Popover>
  ),
};
const ControlledExample = (args: Args) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger disabled={args.disabled} className={triggerClass}>
          Controlled popover
        </PopoverTrigger>
        <PopoverContent
          side={args.side}
          align={args.align}
          sideOffset={args.sideOffset}
          animated={args.animated}
        >
          <PopoverTitle>{args.title}</PopoverTitle>
          <PopoverDescription>
            The parent owns this popup state.
          </PopoverDescription>
          <PopoverClose className={triggerClass}>Done</PopoverClose>
        </PopoverContent>
      </Popover>
      <output className="text-sm text-muted-foreground">
        {open ? "Open" : "Closed"}
      </output>
    </div>
  );
};
export const Controlled: Story = {
  argTypes: { defaultOpen: { control: false } },
  render: (args) => <ControlledExample {...args} />,
};
