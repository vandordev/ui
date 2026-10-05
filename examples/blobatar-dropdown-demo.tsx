"use client";

import { useState } from "react";

import { Blobatar } from "@/registry/new-york/blobatar";
import type { BlobatarProps } from "@/registry/new-york/blobatar";
import { Dropdown } from "@/registry/new-york/dropdown";

export const BlobatarDropdownDemo = ({
  name = "vandor",
  ...props
}: Partial<BlobatarProps>) => {
  const [status, setStatus] = useState("Available");
  return (
    <div className="flex flex-col items-center gap-3">
      <Dropdown
        trigger={
          <button
            type="button"
            aria-label={`Open account menu for ${name}`}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <Blobatar {...props} name={name} alt="" />
          </button>
        }
        items={[
          {
            id: "status",
            items: [
              {
                id: "available",
                label: "Available",
                onSelect: () => setStatus("Available"),
              },
              { id: "busy", label: "Busy", onSelect: () => setStatus("Busy") },
              { id: "away", label: "Away", onSelect: () => setStatus("Away") },
            ],
            label: "Set status",
            type: "group",
          },
        ]}
      />
      <p role="status" className="text-sm text-muted-foreground">
        {status}
      </p>
    </div>
  );
};
