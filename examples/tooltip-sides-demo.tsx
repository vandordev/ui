"use client";

import { Button } from "@/registry/new-york/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/new-york/tooltip";

export const TooltipSidesDemo = () => (
  <TooltipProvider delay={200}>
    <div className="flex flex-wrap justify-center gap-3">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Tooltip key={side}>
          <TooltipTrigger render={<Button variant="outline" />}>
            {side}
          </TooltipTrigger>
          <TooltipContent side={side}>
            Preferred placement: {side}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  </TooltipProvider>
);
