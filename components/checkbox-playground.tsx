"use client";
/* eslint-disable jsx-a11y/label-has-associated-control -- Checkbox renders a native input inside the enclosing label. */

import { ComponentPlayground } from "@/components/component-playground";
import {
  checkboxPlaygroundDefinitions,
  getCheckboxCode,
  getCheckboxDefaults,
  getCheckboxPreviewProps,
} from "@/lib/checkbox-playground";
import type { CheckboxPlaygroundValues } from "@/lib/checkbox-playground";
import { Checkbox } from "@/registry/new-york/checkbox";

export const CheckboxPreview = ({
  values,
}: {
  values: CheckboxPlaygroundValues;
}) => (
    <label className="flex items-center gap-3 text-sm">
      <Checkbox
        key={String(values.defaultChecked)}
        {...getCheckboxPreviewProps(values)}
      />
      <span>{values.label}</span>
    </label>
  );

export const CheckboxPlayground = () => (
  <ComponentPlayground
    title="Checkbox"
    definitions={checkboxPlaygroundDefinitions}
    initialValues={getCheckboxDefaults()}
    getCode={getCheckboxCode}
    renderPreview={(values) => <CheckboxPreview values={values} />}
    hint="Click the label or press Space to toggle. Code captures configuration, not transient clicks. Initially checked remounts the checkbox; Reset restores configuration and interaction state."
  />
);
