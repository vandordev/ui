"use client";

import { Autocomplete } from "@/registry/new-york/autocomplete";
import { Button } from "@/registry/new-york/button";
import { Dialog } from "@/registry/new-york/dialog";
import { Drawer } from "@/registry/new-york/drawer";

const items = ["React", "Vue", "Svelte", "Solid"];

export const AutocompleteOverlayDemo = () => (
  <div className="flex flex-wrap gap-2">
    <Drawer
      title="Choose framework"
      trigger={<Button variant="outline">Open Drawer</Button>}
    >
      <Autocomplete
        items={items}
        label="Framework"
        labelStyle="floating"
        showTrigger
        clearable
      />
    </Drawer>
    <Dialog
      title="Choose framework"
      trigger={<Button variant="outline">Open Dialog</Button>}
    >
      <Autocomplete
        items={items}
        label="Framework"
        labelStyle="floating"
        showTrigger
        clearable
      />
    </Dialog>
  </div>
);
