"use client";

import { useState } from "react";

import { Tabs } from "@/registry/new-york/tabs";

export const TabsControlledDemo = () => {
  const [value, setValue] = useState<string | null>("profile");
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Tabs
        aria-label="Account settings"
        variant="segmented"
        value={value}
        onValueChange={setValue}
        keepMounted
        items={[
          {
            content: (
              <label className="flex flex-col gap-2">
                Display name
                <input
                  className="h-9 rounded-md border bg-background px-3"
                  defaultValue="Alex"
                />
              </label>
            ),
            label: "Profile",
            value: "profile",
          },
          {
            content: "Your profile draft is retained when you return.",
            label: "Security",
            value: "security",
          },
          {
            content: "Unavailable",
            disabled: true,
            label: "Billing",
            value: "billing",
          },
        ]}
      />
      <p className="text-xs text-muted-foreground">
        Selected: {value ?? "none"}. Edit the name, switch tabs, then return.
      </p>
    </div>
  );
};
