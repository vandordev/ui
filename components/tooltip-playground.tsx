"use client";

import { ComponentPlayground } from "@/components/component-playground";
import {
  getTooltipCode,
  getTooltipDefaults,
  getTooltipPreviewProps,
  tooltipProps,
} from "@/lib/tooltip-playground";
import { Button } from "@/registry/new-york/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/new-york/tooltip";

export const TooltipPlayground = () => (
  <ComponentPlayground
    title="Tooltip"
    definitions={tooltipProps}
    initialValues={getTooltipDefaults()}
    getCode={getTooltipCode}
    hint="Hover or Tab to the button. Click or Escape dismisses. Disable tooltip leaves the button usable. Initially open remounts the preview; Reset restores settings and closes it. Code reflects initial configuration, not transient visibility. Touch does not reveal tooltips."
    renderPreview={(values) => {
      const props = getTooltipPreviewProps(values);
      return (
        <TooltipProvider {...props.provider}>
          <Tooltip key={String(values.defaultOpen)} {...props.root}>
            <TooltipTrigger
              id="tooltip-preview"
              render={<Button variant="outline" />}
            >
              Save changes
            </TooltipTrigger>
            <TooltipContent {...props.content} />
          </Tooltip>
        </TooltipProvider>
      );
    }}
  />
);
