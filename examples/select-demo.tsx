"use client";

import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/registry/new-york/button";
import { Select } from "@/registry/new-york/select";

const items = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Blueberry", value: "blueberry" },
];

export const SelectDemo = () => (
  <Select
    data={items}
    aria-label="Fruit"
    className="w-56 max-w-full"
    placeholder="Select a fruit"
  />
);

export const SelectGroupedDemo = () => (
  <Select
    data={[
      { label: "Apple", value: "apple" },
      {
        items: [
          { label: "Mango", value: "mango" },
          { disabled: true, label: "Banana", value: "banana" },
        ],
        label: "Tropical",
      },
    ]}
    aria-label="Grouped fruit"
    className="w-56 max-w-full"
    placeholder="Select a fruit"
  />
);

export const SelectCustomTriggerDemo = () => (
  <Select
    data={items}
    aria-label="Fruit"
    placeholder="Select a fruit"
    trigger={({ selectedLabel, placeholder, open }) => (
      <Button variant="outline" className="w-56 max-w-full justify-between">
        {selectedLabel ?? placeholder}
        <ChevronDownIcon
          aria-hidden="true"
          className={open ? "rotate-180" : undefined}
        />
      </Button>
    )}
  />
);
