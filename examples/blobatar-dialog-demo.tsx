"use client";

import { Blobatar } from "@/registry/new-york/blobatar";
import type { BlobatarProps } from "@/registry/new-york/blobatar";
import { Dialog, DialogBody } from "@/registry/new-york/dialog";

export const BlobatarDialogDemo = ({
  name = "vandor",
  ...props
}: Partial<BlobatarProps>) => (
  <Dialog
    title="Profile details"
    description="A closer look at this team member."
    trigger={
      <button
        type="button"
        aria-label={`Open profile dialog for ${name}`}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <Blobatar {...props} name={name} alt="" />
      </button>
    }
  >
    <DialogBody>
      <p className="break-words font-medium">{name}</p>
      <p className="text-sm text-muted-foreground">Product designer</p>
      <p className="mt-3 text-sm text-muted-foreground">
        Building thoughtful interfaces with Vandor UI.
      </p>
    </DialogBody>
  </Dialog>
);
