"use client";

import { SelectInput } from "@/registry/new-york/select";

const items = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Blueberry", value: "blueberry" },
];

export const SelectDemo = () => (
  <SelectInput
    data={items}
    aria-label="Fruit"
    className="w-56 max-w-full"
    placeholder="Select a fruit"
  />
);

export const SelectGroupedDemo = () => (
  <SelectInput
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
