"use client";

import { ComponentPlayground } from "@/components/component-playground";
import {
  getSelectCode,
  getSelectDefaults,
  getSelectPreviewProps,
  selectProps,
} from "@/lib/select-playground";
import { Select } from "@/registry/new-york/select";

export const SelectPlayground = () => (
  <ComponentPlayground
    title="Select"
    definitions={selectProps}
    initialValues={getSelectDefaults()}
    getCode={getSelectCode}
    hint="Open the menu to preview the motion. Arrow keys navigate, Enter selects, and Escape closes."
    renderPreview={(values) => (
      <Select {...getSelectPreviewProps(values)} className="w-56 max-w-full" />
    )}
  />
);
