"use client";

import { useState } from "react";

import {
  DropdownRoot,
  DropdownTrigger,
  DropdownContent,
  DropdownGroup,
  DropdownLabel,
  DropdownCheckboxItem,
  DropdownSeparator,
  DropdownRadioGroup,
  DropdownRadioItem,
  DropdownLinkItem,
} from "@/registry/new-york/dropdown";

export const DropdownSettingsDemo = () => {
  const [sidebar, setSidebar] = useState(true);
  const [sort, setSort] = useState("name");
  return (
    <div className="flex flex-col items-center gap-4">
      <DropdownRoot>
        <DropdownTrigger className="rounded-md border border-input px-3 py-2 text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring">
          View settings
        </DropdownTrigger>
        <DropdownContent>
          <DropdownGroup>
            <DropdownLabel>Layout</DropdownLabel>
            <DropdownCheckboxItem
              checked={sidebar}
              onCheckedChange={setSidebar}
            >
              Show sidebar
            </DropdownCheckboxItem>
          </DropdownGroup>
          <DropdownSeparator />
          <DropdownGroup>
            <DropdownLabel>Sort by</DropdownLabel>
            <DropdownRadioGroup value={sort} onValueChange={setSort}>
              <DropdownRadioItem value="name" closeOnClick={false}>
                Name
              </DropdownRadioItem>
              <DropdownRadioItem value="date" closeOnClick={false}>
                Date modified
              </DropdownRadioItem>
            </DropdownRadioGroup>
          </DropdownGroup>
          <DropdownSeparator />
          <DropdownGroup>
            <DropdownLinkItem
              href="https://base-ui.com/react/components/menu"
              closeOnClick
            >
              Menu documentation
            </DropdownLinkItem>
          </DropdownGroup>
        </DropdownContent>
      </DropdownRoot>
      <p role="status" className="text-sm text-muted-foreground">
        Sidebar {sidebar ? "visible" : "hidden"}; sort by {sort}.
      </p>
    </div>
  );
};
