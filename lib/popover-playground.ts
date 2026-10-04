import type { PropDefinition } from "@/lib/playground";
import { getPlaygroundDefaults } from "@/lib/playground";
import type { PopoverContentProps } from "@/registry/new-york/popover";

export const popoverProps = {
  actionsRef: {
    defaultValue: "Not set",
    description:
      "Popover: imperative close/unmount actions. The component manages animation unmounting.",
    type: "RefObject<Popover.Root.Actions | null>",
  },
  align: {
    control: {
      initialValue: "start" as "start" | "center" | "end",
      kind: "select",
      label: "Alignment",
      options: ["start", "center", "end"],
    },
    defaultValue: '"start"',
    description: "PopoverContent: alignment relative to the trigger.",
    type: '"start" | "center" | "end"',
  },
  alignOffset: {
    defaultValue: "0",
    description: "PopoverContent: offset along the alignment axis.",
    type: "number",
  },
  anchor: {
    defaultValue: "Trigger",
    description: "PopoverContent: optional alternate positioning anchor.",
    type: "Positioner.Props['anchor']",
  },
  animated: {
    control: {
      initialValue: true as boolean,
      kind: "boolean",
      label: "Animated",
    },
    defaultValue: "true",
    description:
      "PopoverContent: Motion entrance and exit; reduced motion disables transitions.",
    type: "boolean",
  },
  collisionAvoidance: {
    defaultValue: "Base UI default",
    description: "PopoverContent: inherited flip/shift placement policy.",
    type: "Positioner.Props['collisionAvoidance']",
  },
  collisionPadding: {
    defaultValue: "8",
    description: "PopoverContent: padding from collision boundaries.",
    type: "number | Partial<Record<Side, number>>",
  },
  defaultOpen: {
    control: {
      initialValue: false as boolean,
      kind: "boolean",
      label: "Initially open",
    },
    defaultValue: "false",
    description:
      "Popover: initial uncontrolled state. Changing this control remounts the preview.",
    type: "boolean",
  },
  disabled: {
    control: {
      initialValue: false as boolean,
      kind: "boolean",
      label: "Disabled trigger",
    },
    defaultValue: "false",
    description:
      "PopoverTrigger: prevents trigger interaction, not programmatic opening.",
    type: "boolean",
  },
  finalFocus: {
    defaultValue: "Base UI default",
    description: "PopoverContent: controls focus restoration when closed.",
    type: "Popup.Props['finalFocus']",
  },
  initialFocus: {
    defaultValue: "Base UI default",
    description:
      "PopoverContent: controls focus when opened; touch behavior follows Base UI.",
    type: "Popup.Props['initialFocus']",
  },
  modal: {
    defaultValue: "false",
    description:
      "Popover: modal interaction policy. Include PopoverClose for modal accessibility.",
    type: 'boolean | "trap-focus"',
  },
  onOpenChange: {
    defaultValue: "Not set",
    description:
      "Popover: receives requested state and Base UI reason. details.cancel() rejects the change.",
    type: "(open, details) => void",
  },
  onOpenChangeComplete: {
    defaultValue: "Not set",
    description:
      "Popover: notified after the opening or closing lifecycle completes.",
    type: "(open: boolean) => void",
  },
  open: {
    defaultValue: "Not set",
    description: "Popover: controlled open state; pair with onOpenChange.",
    type: "boolean",
  },
  render: {
    defaultValue: "Not set",
    description:
      "Trigger, Close, Title, Description, Content: compose a custom element while preserving primitive props and refs.",
    type: "ReactElement | ((props, state) => ReactElement)",
  },
  side: {
    control: {
      initialValue: "bottom" as "top" | "bottom" | "left" | "right",
      kind: "select",
      label: "Side",
      options: ["top", "bottom", "left", "right"],
    },
    defaultValue: '"bottom"',
    description:
      "PopoverContent: preferred side; collision avoidance can flip it.",
    type: '"top" | "bottom" | "left" | "right" | "inline-start" | "inline-end"',
  },
  sideOffset: {
    control: {
      initialValue: 6,
      kind: "range",
      label: "Side offset",
      max: 24,
      min: 0,
      step: 1,
    },
    defaultValue: "6",
    description: "PopoverContent: distance from the trigger in pixels.",
    type: "number",
  },
  title: {
    control: { initialValue: "Workspace access", kind: "text", label: "Title" },
    defaultValue: "Not set",
    description:
      "PopoverTitle: accessible popup heading, composed inside PopoverHeader.",
    type: "ReactNode",
  },
} satisfies Record<string, PropDefinition>;

export const getPopoverDefaults = () => getPlaygroundDefaults(popoverProps);
export type PopoverPlaygroundValues = ReturnType<typeof getPopoverDefaults>;
export const getPopoverPreviewProps = (values: PopoverPlaygroundValues) => ({
  content: {
    align: values.align,
    animated: values.animated,
    side: values.side,
    sideOffset: values.sideOffset,
  } satisfies PopoverContentProps,
  root: { defaultOpen: values.defaultOpen },
  trigger: { disabled: values.disabled },
});
export const getPopoverCode = (
  values: PopoverPlaygroundValues
) => `"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription, PopoverClose } from "@/components/ui/popover";

export const PopoverDemo = () => (
  <Popover defaultOpen={${values.defaultOpen}}>
    <PopoverTrigger disabled={${values.disabled}} render={<Button variant="outline" />}>Manage access</PopoverTrigger>
    <PopoverContent side="${values.side}" align="${values.align}" sideOffset={${values.sideOffset}} animated={${values.animated}}>
      <PopoverHeader>
        <PopoverTitle>{${JSON.stringify(values.title)}}</PopoverTitle>
        <PopoverDescription>Only invited members can view this workspace.</PopoverDescription>
      </PopoverHeader>
      <PopoverClose render={<Button variant="secondary" size="sm" />}>Done</PopoverClose>
    </PopoverContent>
  </Popover>
);`;
