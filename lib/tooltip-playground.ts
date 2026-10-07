import type { Tooltip as Primitive } from "@base-ui/react/tooltip";

import type { PropDefinition } from "@/lib/playground";
import { getPlaygroundDefaults } from "@/lib/playground";
import type { TooltipContentProps } from "@/registry/new-york/tooltip";

export const tooltipProps = {
  actionsRef: {
    defaultValue: "Not set",
    description:
      "Tooltip: imperative close/unmount actions. The wrapper manages exit unmounting.",
    type: "RefObject<Tooltip.Root.Actions | null>",
  },
  align: {
    control: {
      initialValue: "center" as "start" | "center" | "end",
      kind: "select",
      label: "Alignment",
      options: ["start", "center", "end"],
    },
    defaultValue: '"center"',
    description: "TooltipContent: alignment relative to the trigger.",
    type: '"start" | "center" | "end"',
  },
  alignOffset: {
    defaultValue: "0",
    description: "TooltipContent: offset along the alignment axis.",
    type: "number",
  },
  anchor: {
    defaultValue: "Trigger",
    description: "TooltipContent: optional alternate positioning anchor.",
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
      "TooltipContent: smooth Motion entrance and exit. Reduced motion and Base UI instant interactions skip transitions.",
    type: "boolean",
  },
  closeDelay: {
    defaultValue: "Trigger: 0",
    description:
      "TooltipProvider or TooltipTrigger: hover closing delay in milliseconds. Trigger overrides Provider.",
    type: "number",
  },
  closeOnClick: {
    defaultValue: "true",
    description:
      "TooltipTrigger: dismiss the tooltip when the trigger is clicked.",
    type: "boolean",
  },
  collisionAvoidance: {
    defaultValue: "Base UI default",
    description: "TooltipContent: inherited flip/shift policy.",
    type: "Positioner.Props['collisionAvoidance']",
  },
  collisionPadding: {
    defaultValue: "8",
    description: "TooltipContent: clearance from viewport boundaries.",
    type: "number | Partial<Record<Side, number>>",
  },
  content: {
    control: { initialValue: "Save changes", kind: "text", label: "Content" },
    defaultValue: "Not set",
    description:
      "TooltipContent children: a brief, non-interactive visual hint. This text control configures the demo only.",
    type: "ReactNode (children)",
  },
  defaultOpen: {
    control: {
      initialValue: false as boolean,
      kind: "boolean",
      label: "Initially open",
    },
    defaultValue: "false",
    description:
      "Tooltip: initial uncontrolled visibility. This control remounts the preview.",
    type: "boolean",
  },
  defaultTriggerId: {
    defaultValue: "Not set",
    description: "Tooltip: trigger ID to anchor initially open content.",
    type: "string | null",
  },
  delay: {
    control: {
      initialValue: 0,
      kind: "range",
      label: "Hover delay (ms)",
      max: 1000,
      min: 0,
      step: 50,
    },
    defaultValue: "Provider: 0; Trigger: 600 without a provider",
    description:
      "TooltipProvider or TooltipTrigger: hover opening delay in milliseconds. Trigger overrides Provider; keyboard focus opens immediately.",
    type: "number",
  },
  disableHoverablePopup: {
    defaultValue: "false",
    description: "Tooltip: prevent hovering the popup to keep it open.",
    type: "boolean",
  },
  disabled: {
    control: {
      initialValue: false as boolean,
      kind: "boolean",
      label: "Disable tooltip",
    },
    defaultValue: "false",
    description:
      "Tooltip or TooltipTrigger: disables tooltip interaction, not the underlying button action. The demo uses Tooltip.disabled.",
    type: "boolean",
  },
  handle: {
    defaultValue: "Not set",
    description:
      "Tooltip and TooltipTrigger: Base UI handle for detached triggers. Create using the upstream Tooltip.createHandle API.",
    type: "TooltipHandle<Payload>",
  },
  onOpenChange: {
    defaultValue: "Not set",
    description:
      "Tooltip: requested visibility and Base UI reason. Call details.cancel() to reject a request.",
    type: "(open, details) => void",
  },
  onOpenChangeComplete: {
    defaultValue: "Not set",
    description:
      "Tooltip: notified after the opening/closing lifecycle completes.",
    type: "(open: boolean) => void",
  },
  open: {
    defaultValue: "Not set",
    description: "Tooltip: controlled visibility. Pair with onOpenChange.",
    type: "boolean",
  },
  payload: {
    defaultValue: "Not set",
    description:
      "TooltipTrigger: data passed to Tooltip function children for the active trigger.",
    type: "Payload",
  },
  render: {
    defaultValue: "Not set",
    description:
      "TooltipTrigger and TooltipContent: custom elements with composed primitive props, event handlers, and refs.",
    type: "ReactElement | ((props, state) => ReactElement)",
  },
  showArrow: {
    control: {
      initialValue: true as boolean,
      kind: "boolean",
      label: "Show arrow",
    },
    defaultValue: "true",
    description: "TooltipContent: show the positioning arrow.",
    type: "boolean",
  },
  side: {
    control: {
      initialValue: "top" as "top" | "bottom" | "left" | "right",
      kind: "select",
      label: "Side",
      options: ["top", "bottom", "left", "right"],
    },
    defaultValue: '"top"',
    description:
      "TooltipContent: preferred side. Collision handling may flip it.",
    type: '"top" | "bottom" | "left" | "right" | "inline-start" | "inline-end"',
  },
  sideOffset: {
    control: {
      initialValue: 4,
      kind: "range",
      label: "Side offset",
      max: 24,
      min: 0,
      step: 1,
    },
    defaultValue: "4",
    description: "TooltipContent: distance from the trigger in pixels.",
    type: "number",
  },
  timeout: {
    defaultValue: "400",
    description:
      "TooltipProvider: time window in milliseconds for adjacent tooltips to open instantly.",
    type: "number",
  },
  trackCursorAxis: {
    defaultValue: '"none"',
    description: "Tooltip: cursor tracking along the chosen axis.",
    type: '"none" | "x" | "y" | "both"',
  },
  triggerId: {
    defaultValue: "Not set",
    description:
      "Tooltip: active trigger ID when controlling visibility, required to select among multiple triggers.",
    type: "string | null",
  },
} satisfies Record<string, PropDefinition>;

export const getTooltipDefaults = () => getPlaygroundDefaults(tooltipProps);
export type TooltipPlaygroundValues = ReturnType<typeof getTooltipDefaults>;
export const getTooltipPreviewProps = (values: TooltipPlaygroundValues) => ({
  content: {
    align: values.align,
    animated: values.animated,
    children: values.content,
    showArrow: values.showArrow,
    side: values.side,
    sideOffset: values.sideOffset,
  } satisfies TooltipContentProps,
  provider: { delay: values.delay } satisfies Primitive.Provider.Props,
  root: {
    defaultOpen: values.defaultOpen,
    defaultTriggerId: "tooltip-preview",
    disabled: values.disabled,
  } satisfies Primitive.Root.Props,
});
export const getTooltipCode = (
  values: TooltipPlaygroundValues
) => `"use client";

import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export const TooltipDemo = () => (
  <TooltipProvider delay={${values.delay}}>
    <Tooltip defaultOpen={${values.defaultOpen}} defaultTriggerId="tooltip-preview" disabled={${values.disabled}}>
      <TooltipTrigger id="tooltip-preview" render={<Button variant="outline" />}>Save changes</TooltipTrigger>
      <TooltipContent side="${values.side}" align="${values.align}" sideOffset={${values.sideOffset}} animated={${values.animated}} showArrow={${values.showArrow}}>
        {${JSON.stringify(values.content)}}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);`;
