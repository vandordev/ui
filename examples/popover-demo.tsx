"use client";

import { Button } from "@/registry/new-york/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
} from "@/registry/new-york/popover";

export const PopoverDemo = () => (
  <Popover>
    <PopoverTrigger render={<Button variant="outline" />}>
      Manage access
    </PopoverTrigger>
    <PopoverContent side="bottom" align="start">
      <PopoverHeader>
        <PopoverTitle>Workspace access</PopoverTitle>
        <PopoverDescription>
          Only invited members can view this workspace.
        </PopoverDescription>
      </PopoverHeader>
      <PopoverClose render={<Button variant="secondary" size="sm" />}>
        Done
      </PopoverClose>
    </PopoverContent>
  </Popover>
);
