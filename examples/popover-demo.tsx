"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/new-york/popover";

export function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger className="h-9 rounded-md border px-3 text-sm">
        Open details
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start">
        A popover positions itself against its trigger and dismisses with
        Escape.
      </PopoverContent>
    </Popover>
  );
}
