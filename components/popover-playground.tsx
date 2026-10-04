"use client";

import { ComponentPlayground } from "@/components/component-playground";
import {
  getPopoverCode,
  getPopoverDefaults,
  getPopoverPreviewProps,
  popoverProps,
} from "@/lib/popover-playground";
import { Button } from "@/registry/new-york/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/registry/new-york/popover";

export const PopoverPlayground = () => (
  <ComponentPlayground
    title="Popover"
    definitions={popoverProps}
    initialValues={getPopoverDefaults()}
    getCode={getPopoverCode}
    hint="Click the trigger to preview motion. Escape or outside interaction dismisses. Initially open remounts the preview; Reset restores settings and closes it. Generated code uses the initial state, not transient opening."
    renderPreview={(values) => {
      const props = getPopoverPreviewProps(values);
      return (
        <Popover key={String(values.defaultOpen)} {...props.root}>
          <PopoverTrigger
            {...props.trigger}
            render={<Button variant="outline" />}
          >
            Manage access
          </PopoverTrigger>
          <PopoverContent {...props.content}>
            <PopoverHeader>
              <PopoverTitle>{values.title}</PopoverTitle>
              <PopoverDescription>
                Only invited members can view this workspace.
              </PopoverDescription>
            </PopoverHeader>
            <PopoverClose render={<Button variant="secondary" size="sm" />}>
              Done
            </PopoverClose>
          </PopoverContent>
        </Popover>
      );
    }}
  />
);
