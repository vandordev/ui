"use client";

import { useState } from "react";

import { Dropdown } from "@/registry/new-york/dropdown";

export const DropdownNestedDemo = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("None");
  return (
    <div className="flex flex-col items-center gap-4">
      <Dropdown
        open={open}
        onOpenChange={setOpen}
        trigger={
          <button
            type="button"
            className="rounded-md border border-input px-3 py-2 text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
          >
            Project
          </button>
        }
        items={[
          {
            id: "project",
            items: [
              {
                id: "rename",
                label: "Rename",
                onSelect: () => setSelected("Rename"),
              },
              {
                id: "share",
                items: [
                  {
                    id: "team",
                    label: "Team",
                    onSelect: () => setSelected("Team"),
                  },
                  { disabled: true, id: "public", label: "Public link" },
                ],
                label: "Share with",
                type: "submenu",
              },
            ],
            label: "Project actions",
            type: "group",
          },
        ]}
      />
      <p role="status" className="text-sm text-muted-foreground">
        Last action: {selected}
      </p>
    </div>
  );
};
