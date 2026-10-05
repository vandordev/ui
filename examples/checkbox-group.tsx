"use client";
/* eslint-disable jsx-a11y/label-has-associated-control -- Checkbox renders a native input inside the enclosing label. */

import { useState } from "react";

import { Checkbox } from "@/registry/new-york/checkbox";

const channels = ["Email", "Push", "SMS"];

export const CheckboxGroup = () => {
  const [selected, setSelected] = useState<string[]>(["Email"]);
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-4 text-sm font-medium">
        Notification channels
      </legend>
      <label className="flex items-center gap-3 text-sm font-medium">
        <Checkbox
          checked={selected.length === channels.length}
          indeterminate={
            selected.length > 0 && selected.length < channels.length
          }
          onCheckedChange={(checked) => setSelected(checked ? channels : [])}
        />
        Select all
      </label>
      {channels.map((channel) => (
        <label key={channel} className="flex items-center gap-3 text-sm">
          <Checkbox
            checked={selected.includes(channel)}
            onCheckedChange={(checked) =>
              setSelected((current) =>
                checked
                  ? [...current, channel]
                  : current.filter((item) => item !== channel)
              )
            }
          />
          {channel}
        </label>
      ))}
      <output className="text-xs text-muted-foreground">
        {selected.length} of {channels.length} selected
      </output>
    </fieldset>
  );
};
