"use client";

import {
  ArrowLeftIcon,
  BotIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  HistoryIcon,
  LayoutGridIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/registry/new-york/app-shell";
import type { AppShellNavigationItem } from "@/registry/new-york/app-shell";
import { Button } from "@/registry/new-york/button";
import { Dropdown } from "@/registry/new-york/dropdown";
import { PageContainer } from "@/registry/new-york/page-container";

export const AppShellHierarchyDemo = () => {
  const [context, setContext] = useState<"workspace" | "agent">("workspace");
  const [agent, setAgent] = useState("Customer Support");
  const [section, setSection] = useState("Profile");
  const [collapsed, setCollapsed] = useState(false);
  const agents = ["Customer Support", "Research Assistant"];
  const openAgent = (name: string) => {
    setAgent(name);
    setSection("Profile");
    setContext("agent");
  };
  const navigation: AppShellNavigationItem[] =
    context === "workspace"
      ? [
          {
            icon: <LayoutGridIcon />,
            id: "overview",
            label: "Overview",
            onClick: () => setSection("Overview"),
          },
          {
            active: section !== "Overview",
            icon: <BotIcon />,
            id: "agents",
            label: "Agents",
            onClick: () => setSection("Agents"),
          },
        ]
      : [
          {
            dividerAfter: true,
            icon: <ArrowLeftIcon />,
            id: "back",
            label: "All agents",
            onClick: () => {
              setContext("workspace");
              setSection("Agents");
            },
          },
          ...["Profile", "Configure", "Versions"].map((label) => ({
            active: section === label,
            icon:
              label === "Versions" ? (
                <HistoryIcon />
              ) : (
                <SlidersHorizontalIcon />
              ),
            id: label,
            label,
            onClick: () => setSection(label),
          })),
        ];
  return (
    <AppShell
      brand={{ icon: <LayoutGridIcon />, name: "Acme" }}
      sidebarHeader={
        context === "agent"
          ? ({ collapsed: compact, closeNavigation }) => (
              <Dropdown
                contentProps={{ align: "start", side: "right" }}
                trigger={
                  <Button
                    variant="ghost"
                    className="h-12 w-full min-w-0 justify-start overflow-hidden px-3"
                    aria-label={`Switch agent: ${agent}`}
                  >
                    <BotIcon aria-hidden="true" />
                    {!compact && (
                      <>
                        <span className="min-w-0 flex-1 truncate text-left">
                          {agent}
                        </span>
                        <ChevronsUpDownIcon aria-hidden="true" />
                      </>
                    )}
                  </Button>
                }
                items={[
                  {
                    id: "agents",
                    items: agents.map((name) => ({
                      icon: name === agent ? CheckIcon : undefined,
                      id: name,
                      label: name,
                      onSelect: () => {
                        openAgent(name);
                        closeNavigation();
                      },
                    })),
                    label: "Agents",
                    type: "group",
                  },
                ]}
              />
            )
          : undefined
      }
      navigation={navigation}
      navigationContext={{
        depth: context === "workspace" ? 0 : 1,
        key: context,
      }}
      navigationLabel={
        context === "workspace" ? "Workspace navigation" : "Agent navigation"
      }
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
      header={
        <span className="truncate text-sm font-medium">
          {context === "workspace" ? "Workspace" : agent}
        </span>
      }
      className="h-[28rem] min-h-0 w-full [&_[data-slot=app-shell-sidebar]]:h-full [&_[data-slot=app-shell-header]]:static [&_[data-slot=app-shell-main]]:overflow-y-auto"
    >
      <PageContainer>
        <h2 className="text-lg font-semibold">
          {context === "workspace" ? "Agents" : section}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {context === "workspace"
            ? "Open an agent to replace the middle navigation panel."
            : "Return with All agents. Switching agents keeps the same navigation panel."}
        </p>
        {context === "workspace" && (
          <div className="mt-6 flex flex-col items-start gap-3">
            {agents.map((name) => (
              <Button
                key={name}
                variant="outline"
                className="max-w-full whitespace-normal text-left"
                onClick={() => openAgent(name)}
              >
                <BotIcon aria-hidden="true" />
                {name}
              </Button>
            ))}
          </div>
        )}
        {context === "agent" && (
          <p className="mt-6 text-sm text-muted-foreground">
            {agent} / {section}
          </p>
        )}
      </PageContainer>
    </AppShell>
  );
};
