"use client";

import { SaveIcon } from "lucide-react";

import { Button } from "@/registry/new-york/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/new-york/tooltip";

export const TooltipDemo = () => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger
        aria-label="Save changes"
        render={<Button variant="outline" size="icon" />}
      >
        <SaveIcon aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent>Save changes</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
