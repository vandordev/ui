"use client";
/* eslint-disable jsx-a11y/label-has-associated-control -- Switch renders a native input inside the enclosing label. */

import { ComponentPlayground } from "@/components/component-playground";
import {
  getSwitchCode,
  getSwitchDefaults,
  getSwitchPreviewProps,
  switchPlaygroundDefinitions,
} from "@/lib/switch-playground";
import type { SwitchPlaygroundValues } from "@/lib/switch-playground";
import { Switch } from "@/registry/new-york/switch";

export const SwitchPreview = ({
  values,
}: {
  values: SwitchPlaygroundValues;
}) => (
  <label className="flex items-center gap-3 text-sm">
    <Switch
      key={String(values.defaultChecked)}
      {...getSwitchPreviewProps(values)}
    />
    <span>{values.label}</span>
  </label>
);

export const SwitchPlayground = () => (
  <ComponentPlayground
    title="Switch"
    definitions={switchPlaygroundDefinitions}
    initialValues={getSwitchDefaults()}
    getCode={getSwitchCode}
    renderPreview={(values) => <SwitchPreview values={values} />}
    hint="Click the label or press Space to toggle. Code captures configuration, not transient clicks. Initially checked remounts the switch; Reset restores configuration and interaction state."
  />
);
