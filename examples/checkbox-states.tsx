"use client";
/* eslint-disable jsx-a11y/label-has-associated-control -- Checkbox renders a native input inside the enclosing label. */

import { Checkbox } from "@/registry/new-york/checkbox";

export const CheckboxStates = () => (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-4 text-sm font-medium">
        Notification preferences
      </legend>
      <label className="flex items-center gap-3 text-sm">
        <Checkbox disabled defaultChecked />
        Disabled
      </label>
      <label className="flex items-center gap-3 text-sm">
        <Checkbox readOnly defaultChecked />
        Read only
      </label>
      <label className="flex items-center gap-3 text-sm">
        <Checkbox aria-invalid aria-describedby="checkbox-error" />
        Accept terms
      </label>
      <p id="checkbox-error" className="text-sm text-destructive">
        Accept the terms before continuing.
      </p>
    </fieldset>
  );
