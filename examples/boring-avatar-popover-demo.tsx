"use client";

import { BoringAvatar } from "@/registry/new-york/boring-avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/new-york/popover";

export const BoringAvatarPopoverDemo = () => (
  <Popover>
    <PopoverTrigger
      render={
        <button
          type="button"
          aria-label="Open Vandor profile"
          className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <BoringAvatar name="vandor" size={64} />
        </button>
      }
    />
    <PopoverContent className="w-64 max-w-[calc(100vw-2rem)]">
      <p className="font-medium">Vandor</p>
      <p className="text-sm text-muted-foreground">Product designer</p>
    </PopoverContent>
  </Popover>
);
