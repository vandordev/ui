"use client";

import { FolderIcon, LayoutGridIcon, SettingsIcon } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/registry/new-york/app-shell";
import { PageContainer } from "@/registry/new-york/page-container";

// Only the fixture is bounded; a real application uses AppShell's viewport layout.
export const AppShellDemo = ({
  defaultCollapsed = false,
}: {
  defaultCollapsed?: boolean;
}) => {
  const [active, setActive] = useState("overview");
  const destinations = [
    { icon: <LayoutGridIcon />, id: "overview", label: "Overview" },
    { icon: <FolderIcon />, id: "projects", label: "Projects" },
    { icon: <SettingsIcon />, id: "settings", label: "Settings" },
  ];
  const title = destinations.find((item) => item.id === active)?.label;
  return (
    <AppShell
      brand={{ icon: <LayoutGridIcon />, name: "Acme" }}
      navigation={destinations.map((item) => ({
        ...item,
        active: item.id === active,
        onClick: () => setActive(item.id),
      }))}
      defaultCollapsed={defaultCollapsed}
      header={<span className="truncate text-sm font-medium">Workspace</span>}
      className="h-80 min-h-0 w-full [&_[data-slot=app-shell-sidebar]]:h-full [&_[data-slot=app-shell-header]]:static [&_[data-slot=app-shell-main]]:overflow-y-auto"
    >
      <PageContainer>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Select a destination, collapse the sidebar, or open navigation on
          mobile.
        </p>
        <p className="mt-6 text-xs text-muted-foreground">
          Local demo. No application routes are changed.
        </p>
      </PageContainer>
    </AppShell>
  );
};

export const AppShellCollapsedDemo = () => <AppShellDemo defaultCollapsed />;
