import type { Meta, StoryObj } from "@storybook/react";
import { useId, useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import type { TooltipContentProps } from "./tooltip";

type Args = Pick<
  TooltipContentProps,
  "side" | "align" | "sideOffset" | "animated" | "showArrow"
> & {
  content: string;
  delay: number;
  disabled: boolean;
  defaultOpen: boolean;
};
const triggerClass =
  "rounded-md border border-input bg-background px-3 py-2 text-sm outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring";
const StoryTooltip = ({
  content,
  delay,
  disabled,
  defaultOpen,
  ...props
}: Args) => {
  const id = useId();
  return (
    <TooltipProvider delay={delay}>
      <Tooltip
        key={String(defaultOpen)}
        defaultOpen={defaultOpen}
        defaultTriggerId={id}
        disabled={disabled}
      >
        <TooltipTrigger id={id} className={triggerClass}>
          Save changes
        </TooltipTrigger>
        <TooltipContent {...props}>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
const meta = {
  argTypes: {
    align: { control: "select", options: ["start", "center", "end"] },
    animated: { control: "boolean" },
    content: { control: "text" },
    defaultOpen: { control: "boolean" },
    delay: { control: { max: 1000, min: 0, step: 50, type: "range" } },
    disabled: { control: "boolean" },
    showArrow: { control: "boolean" },
    side: {
      control: "select",
      options: ["top", "bottom", "left", "right", "inline-start", "inline-end"],
    },
    sideOffset: { control: { max: 24, min: 0, step: 1, type: "range" } },
  },
  args: {
    align: "center",
    animated: true,
    content: "Save changes",
    defaultOpen: false,
    delay: 0,
    disabled: false,
    showArrow: true,
    side: "top",
    sideOffset: 4,
  },
  component: StoryTooltip,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Vandor UI/Tooltip",
} satisfies Meta<typeof StoryTooltip>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const InitiallyOpen: Story = { args: { defaultOpen: true } };
export const DisabledTooltip: Story = { args: { disabled: true } };
export const WithoutAnimation: Story = { args: { animated: false } };
export const WithoutArrow: Story = { args: { showArrow: false } };
export const LongContent: Story = {
  args: {
    content:
      "Save the current draft, including your latest changes, to this workspace. This supplementary hint wraps within the available viewport width.",
    defaultOpen: true,
  },
};
export const SharedDelay: Story = {
  argTypes: { defaultOpen: { control: false } },
  render: ({
    content,
    delay,
    disabled,
    defaultOpen: _defaultOpen,
    ...props
  }) => (
    <TooltipProvider delay={delay}>
      <div className="flex flex-wrap gap-3">
        {["Save changes", "Duplicate draft", "Archive draft"].map((label) => (
          <Tooltip key={label} disabled={disabled}>
            <TooltipTrigger className={triggerClass}>{label}</TooltipTrigger>
            <TooltipContent {...props}>
              {label}: {content}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  ),
};
const ControlledExample = ({
  content,
  delay,
  disabled,
  defaultOpen: _defaultOpen,
  ...props
}: Args) => {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3">
      <TooltipProvider delay={delay}>
        <Tooltip
          open={open}
          onOpenChange={setOpen}
          triggerId={id}
          disabled={disabled}
        >
          <TooltipTrigger id={id} className={triggerClass}>
            Save changes
          </TooltipTrigger>
          <TooltipContent {...props}>{content}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <output className="text-xs text-muted-foreground">
        {open ? "Open" : "Closed"}
      </output>
    </div>
  );
};
export const Controlled: Story = {
  argTypes: { defaultOpen: { control: false } },
  render: (args) => <ControlledExample {...args} />,
};
export const IconOnly: Story = {
  argTypes: { defaultOpen: { control: false } },
  render: ({
    content,
    delay,
    disabled,
    defaultOpen: _defaultOpen,
    ...props
  }) => (
    <TooltipProvider delay={delay}>
      <Tooltip disabled={disabled}>
        <TooltipTrigger aria-label="Save changes" className={triggerClass}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12l4 4v12a2 2 0 0 1-2 2Z" />
            <path d="M7 3v6h10V3M7 21v-8h10v8" />
          </svg>
        </TooltipTrigger>
        <TooltipContent {...props}>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};
