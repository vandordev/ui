"use client";

import { ComponentPlayground } from "@/components/component-playground";
import {
  getSelectCode,
  getSelectDefaults,
  selectItems,
  selectProps,
} from "@/lib/select-playground";
import { SelectInput } from "@/registry/new-york/select";

export const SelectPlayground = () => (
  <ComponentPlayground
    title="Select"
    definitions={selectProps}
    initialValues={getSelectDefaults()}
    getCode={getSelectCode}
    hint="Open the menu to preview the motion. Arrow keys navigate, Enter selects, and Escape closes."
    renderPreview={(values) => (
      <SelectInput
        data={selectItems}
        disabled={values.disabled}
        aria-label="Fruit"
        className="w-56 max-w-full"
        size={values.size}
        placeholder={values.placeholder}
        animated={values.animated}
      />
    )}
  />
);
