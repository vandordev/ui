"use client";

import { useState } from "react";

import { ComponentPlayground } from "@/components/component-playground";
import {
  dropdownProps,
  dropdownTriggerClass,
  getDropdownCode,
  getDropdownDefaults,
  getDropdownPreviewProps,
} from "@/lib/dropdown-playground";
import type { DropdownPlaygroundValues } from "@/lib/dropdown-playground";
import { Dropdown } from "@/registry/new-york/dropdown";

export const DropdownPreview = ({
  values,
}: {
  values: DropdownPlaygroundValues;
}) => {
  const [selected, setSelected] = useState("None");
  return (
    <div className="flex flex-col items-center gap-4">
      <Dropdown
        {...getDropdownPreviewProps(values, setSelected)}
        trigger={
          <button type="button" className={dropdownTriggerClass}>
            {values.trigger}
          </button>
        }
      />
      <p role="status" className="text-sm text-muted-foreground">
        Last action: {selected}
      </p>
    </div>
  );
};

export const DropdownPlayground = () => (
  <ComponentPlayground
    title="Dropdown"
    definitions={dropdownProps}
    initialValues={getDropdownDefaults()}
    getCode={getDropdownCode}
    hint="Shortcuts are display hints, not registered key bindings. Actions only update the demo status. Code reproduces configuration, not transient selection; Reset clears selection and closes the menu."
    renderPreview={(values) => <DropdownPreview values={values} />}
  />
);
