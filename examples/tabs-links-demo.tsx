"use client";

import Link from "next/link";
import { useState } from "react";

import { Tabs } from "@/registry/new-york/tabs";

export const TabsLinksDemo = () => {
  const [active, setActive] = useState("overview");
  return (
    <Tabs
      aria-label="Project navigation"
      variant="pill"
      items={["overview", "activity", "settings"].map((section) => ({
        active: active === section,
        key: section,
        link: (
          <Link
            href={`#${section}`}
            onClick={(event) => {
              if (
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
              ) {
                return;
              }
              event.preventDefault();
              setActive(section);
            }}
          >
            {section[0].toUpperCase() + section.slice(1)}
          </Link>
        ),
      }))}
    />
  );
};
