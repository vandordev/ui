"use client";

import { Blobatar } from "@/registry/new-york/blobatar";
import type { BlobatarProps } from "@/registry/new-york/blobatar";
import { Drawer, DrawerBody } from "@/registry/new-york/drawer";

export const BlobatarDrawerDemo = ({
  name = "vandor",
  ...props
}: Partial<BlobatarProps>) => (
  <Drawer
    title="Profile details"
    description="Keep this team member's details close by."
    trigger={
      <button
        type="button"
        aria-label={`Open profile drawer for ${name}`}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <Blobatar {...props} name={name} alt="" />
      </button>
    }
  >
    <DrawerBody className="pt-5">
      <p className="break-words font-medium">{name}</p>
      <p className="text-sm text-muted-foreground">Product designer</p>
      <p className="mt-3 text-sm text-muted-foreground">
        Building thoughtful interfaces with Vandor UI.
      </p>
    </DrawerBody>
  </Drawer>
);
