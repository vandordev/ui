"use client";

import { Blobatar } from "@/registry/new-york/blobatar";
import type { BlobatarProps } from "@/registry/new-york/blobatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/new-york/popover";

export const BlobatarPopoverDemo = ({
  name = "vandor",
  ...props
}: Partial<BlobatarProps>) => (
  <Popover>
    <PopoverTrigger
      render={
        <button
          type="button"
          aria-label={`Open profile for ${name}`}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        />
      }
    >
      <Blobatar {...props} name={name} alt="" />
    </PopoverTrigger>
    <PopoverContent className="w-64 max-w-[calc(100vw-2rem)]">
      <p className="break-words font-medium">{name}</p>
      <p className="text-sm text-muted-foreground">Product designer</p>
      <p className="mt-3 text-sm text-muted-foreground">
        Building thoughtful interfaces with Vandor UI.
      </p>
    </PopoverContent>
  </Popover>
);
