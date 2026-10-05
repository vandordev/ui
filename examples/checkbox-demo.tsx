"use client";
/* eslint-disable jsx-a11y/label-has-associated-control -- Checkbox renders a native input inside the enclosing label. */

import { Checkbox } from "@/registry/new-york/checkbox";

export const CheckboxDemo = () => (
    <label className="flex items-center gap-3 text-sm">
      <Checkbox defaultChecked />
      Enable notifications
    </label>
  );
