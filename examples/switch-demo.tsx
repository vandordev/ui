"use client";
/* eslint-disable jsx-a11y/label-has-associated-control -- Switch supplies the enclosed native input. */

import { Switch } from "@/registry/new-york/switch";

export const SwitchDemo = () => (
  <label className="flex items-center gap-3 text-sm">
    <Switch defaultChecked />
    Enable notifications
  </label>
);
