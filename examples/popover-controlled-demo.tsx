"use client";

import { useState } from "react";

import { Button } from "@/registry/new-york/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
} from "@/registry/new-york/popover";

export const PopoverControlledDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={<Button variant="outline" />}>
          Review sharing
        </PopoverTrigger>
        <PopoverContent align="center" side="top">
          <PopoverTitle>Private workspace</PopoverTitle>
          <PopoverDescription>
            This example controls visibility only. Closing does not save or
            discard application data.
          </PopoverDescription>
          <PopoverClose render={<Button size="sm" />}>Got it</PopoverClose>
        </PopoverContent>
      </Popover>
      <output className="text-xs text-muted-foreground">
        {open ? "Popover is open" : "Popover is closed"}
      </output>
    </div>
  );
};
