"use client";

import {
  CheckIcon,
  ChevronsUpDownIcon,
  FolderIcon,
  LayoutGridIcon,
  UserRoundIcon,
} from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/registry/new-york/app-shell";
import { Button } from "@/registry/new-york/button";
import { Dropdown } from "@/registry/new-york/dropdown";
import { PageContainer } from "@/registry/new-york/page-container";

export const AppShellWorkspaceDemo = () => {
  const [workspace, setWorkspace] = useState("Acme");
  const [active, setActive] = useState("Overview");
  const [notice, setNotice] = useState("Local workspace fixture");
  return (
    <AppShell
      brand={{ name: workspace }}
      sidebarHeader={({ collapsed, closeNavigation }) => (
        <Dropdown
          contentProps={{
            align: "start",
            side: collapsed ? "right" : "bottom",
          }}
          trigger={
            <Button
              variant="ghost"
              className="h-12 w-full min-w-0 justify-start overflow-hidden px-2"
              aria-label={`Switch workspace: ${workspace}`}
            >
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted"
              >
                {workspace[0]}
              </span>
              {!collapsed && (
                <>
                  <span className="min-w-0 flex-1 truncate text-left">
                    {workspace}
                  </span>
                  <ChevronsUpDownIcon aria-hidden="true" />
                </>
              )}
            </Button>
          }
          items={[
            {
              id: "workspaces",
              items: ["Acme", "Orbit"].map((name) => ({
                icon: name === workspace ? CheckIcon : undefined,
                id: name,
                label: name,
                onSelect: () => {
                  setWorkspace(name);
                  setNotice(`${name} selected`);
                  closeNavigation();
                },
              })),
              label: "Workspaces",
              type: "group",
            },
          ]}
        />
      )}
      sidebarFooter={({ collapsed }) => (
        <Dropdown
          contentProps={{ align: "end", side: "right" }}
          trigger={
            <Button
              variant="ghost"
              className="h-12 w-full justify-start overflow-hidden px-3"
              aria-label="Account menu"
            >
              <UserRoundIcon aria-hidden="true" />
              {!collapsed && <span className="truncate">Avery Cole</span>}
            </Button>
          }
          items={[
            {
              id: "profile",
              label: "Profile",
              onSelect: () => setNotice("Profile selected"),
            },
            {
              id: "sign-out",
              label: "Sign out",
              onSelect: () =>
                setNotice("Demo sign out selected. No session was changed."),
            },
          ]}
        />
      )}
      navigation={[
        {
          active: active === "Overview",
          icon: <LayoutGridIcon />,
          id: "overview",
          label: "Overview",
          onClick: () => setActive("Overview"),
        },
        {
          active: active === "Projects",
          icon: <FolderIcon />,
          id: "projects",
          label: "Projects",
          onClick: () => setActive("Projects"),
        },
      ]}
      header={<span className="truncate text-sm font-medium">{workspace}</span>}
      className="h-96 min-h-0 w-full [&_[data-slot=app-shell-sidebar]]:h-full [&_[data-slot=app-shell-header]]:static [&_[data-slot=app-shell-main]]:overflow-y-auto"
    >
      <PageContainer>
        <h2 className="text-lg font-semibold">{active}</h2>
        <p role="status" className="mt-2 text-sm text-muted-foreground">
          {notice}
        </p>
      </PageContainer>
    </AppShell>
  );
};
