"use client";

import { useId, useState } from "react";

import { Button } from "@/registry/new-york/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/new-york/tooltip";

export const TooltipControlledDemo = () => {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3">
      <TooltipProvider delay={200}>
        <Tooltip open={open} onOpenChange={setOpen} triggerId={id}>
          <TooltipTrigger id={id} render={<Button variant="outline" />}>
            Save changes
          </TooltipTrigger>
          <TooltipContent>Save changes</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <output className="text-xs text-muted-foreground">
        {open ? "Open" : "Closed"}
      </output>
    </div>
  );
};
