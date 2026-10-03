"use client";

import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { useCallback, useEffect, useRef } from "react";

import { collapse, expand } from "@/audio/core";
import { adaptBase } from "@/components/ui/base-ui-adapter";
import { useFeedback } from "@/hooks/use-feedback";

const CollapsiblePrimitive = {
  CollapsibleContent: adaptBase(BaseCollapsible.Panel),
  CollapsibleTrigger: adaptBase(BaseCollapsible.Trigger, "button"),
  Root: adaptBase(BaseCollapsible.Root),
};

const Collapsible = ({
  onOpenChange,
  sounds = false,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root> & {
  sounds?: boolean;
}) => {
  const playExpand = useFeedback({ soundDef: expand });
  const playCollapse = useFeedback({ soundDef: collapse });
  const isControlled = props.open !== undefined;
  const lastOpen = useRef(props.open ?? props.defaultOpen ?? false);

  const playStateSound = useCallback(
    (open: boolean) => {
      if (!sounds || open === lastOpen.current) {
        return;
      }

      if (open) {
        playExpand();
      } else {
        playCollapse();
      }

      lastOpen.current = open;
    },
    [playCollapse, playExpand, sounds]
  );

  useEffect(() => {
    if (!isControlled) {
      return;
    }

    playStateSound(props.open ?? false);
  }, [isControlled, playStateSound, props.open]);

  const handleOpenChange = useCallback(
    (open: boolean, details: BaseCollapsible.Root.ChangeEventDetails) => {
      playStateSound(open);
      onOpenChange?.(open, details);
    },
    [onOpenChange, playStateSound]
  );

  if (!sounds) {
    return (
      <CollapsiblePrimitive.Root
        data-slot="collapsible"
        onOpenChange={onOpenChange}
        {...props}
      />
    );
  }

  return (
    <CollapsiblePrimitive.Root
      data-slot="collapsible"
      onOpenChange={handleOpenChange}
      {...props}
    />
  );
};

const CollapsibleTrigger = ({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) => (
  <CollapsiblePrimitive.CollapsibleTrigger
    data-slot="collapsible-trigger"
    {...props}
  />
);

const CollapsibleContent = ({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) => (
  <CollapsiblePrimitive.CollapsibleContent
    data-slot="collapsible-content"
    {...props}
  />
);

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
