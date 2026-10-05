"use client";

import { CopyIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useState } from "react";

import { Dropdown } from "@/registry/new-york/dropdown";

export const DropdownDemo = () => {
  const [selected, setSelected] = useState("None");
  return (
    <div className="flex flex-col items-center gap-4">
      <Dropdown
        trigger={
          <button
            type="button"
            className="rounded-md border border-input px-3 py-2 text-sm font-medium hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
          >
            Actions
          </button>
        }
        items={[
          {
            icon: PencilIcon,
            id: "edit",
            label: "Edit",
            onSelect: () => setSelected("Edit"),
            shortcut: "⌘E",
          },
          {
            icon: CopyIcon,
            id: "duplicate",
            label: "Duplicate",
            onSelect: () => setSelected("Duplicate"),
          },
          { id: "divider", type: "separator" },
          {
            icon: TrashIcon,
            id: "delete",
            label: "Delete",
            onSelect: () => setSelected("Delete"),
            variant: "destructive",
          },
        ]}
      />
      <p role="status" className="text-sm text-muted-foreground">
        Last action: {selected}
      </p>
    </div>
  );
};
