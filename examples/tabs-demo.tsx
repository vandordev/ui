"use client";

import { Tabs } from "@/registry/new-york/tabs";

export const TabsDemo = () => (
  <Tabs
    aria-label="Project sections"
    items={[
      {
        content: "Your project at a glance.",
        label: "Overview",
        value: "overview",
      },
      {
        content: "Recent updates and conversations.",
        label: "Activity",
        value: "activity",
      },
      {
        content: "Manage your project preferences.",
        label: "Settings",
        value: "settings",
      },
    ]}
  />
);
