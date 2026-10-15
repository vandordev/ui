"use client";

import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/registry/new-york/button";
import { Drawer, DrawerBody } from "@/registry/new-york/drawer";
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

export const SelectInsideDrawerDemo = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Choose fruit in drawer</Button>
      <Drawer title="Choose fruit" open={open} onOpenChange={setOpen}>
        <DrawerBody className="flex flex-col gap-3">
          <Select
            data={items}
            value={value}
            onValueChange={setValue}
            aria-label="Drawer fruit"
            placeholder="Select a fruit"
          />
          <output>Selected: {value ?? "None"}</output>
        </DrawerBody>
      </Drawer>
    </>
  );
};

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
