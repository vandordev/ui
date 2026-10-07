"use client";
/* eslint-disable jsx-a11y/label-has-associated-control -- Switch supplies the enclosed native input. */

import { Switch } from "@/registry/new-york/switch";

export const SwitchStates = () => (
  <div className="flex flex-col gap-5">
    <label className="flex items-center gap-3 text-sm">
      <Switch size="sm" defaultChecked />
      Small switch
    </label>
    <label className="flex items-center gap-3 text-sm text-muted-foreground">
      <Switch disabled defaultChecked />
      Disabled
    </label>
    <label className="flex items-center gap-3 text-sm">
      <Switch readOnly defaultChecked />
      Read only
    </label>
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-3 text-sm">
        <Switch aria-invalid aria-describedby="switch-states-error" />
        Enable account alerts
      </label>
      <p id="switch-states-error" className="text-xs text-destructive">
        Account alerts are required for this workspace.
      </p>
    </div>
  </div>
);
