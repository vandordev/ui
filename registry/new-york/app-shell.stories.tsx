import type { Meta, StoryObj } from "@storybook/react";
import {
  ArrowLeftIcon,
  BotIcon,
  FolderIcon,
  LayoutGridIcon,
  SettingsIcon,
} from "lucide-react";
import { useState } from "react";

import { AppShell } from "./app-shell";
import { Button } from "./button";

const meta = {
  argTypes: {
    actions: { control: false },
    brand: { control: false },
    children: { control: false },
    collapsed: { control: "boolean" },
    defaultCollapsed: { control: false },
    header: { control: false },
    navigation: { control: false },
    navigationContext: { control: false },
    navigationLabel: { control: "text" },
    onCollapsedChange: { control: false },
    onSearch: { control: false },
    searchLabel: { control: "text" },
    sidebarFooter: { control: false },
    sidebarHeader: { control: false },
  },
  args: {
    brand: { icon: <LayoutGridIcon />, name: "Acme" },
    children: (
      <>
        <h1 className="text-2xl font-semibold">Workspace</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Consumer content belongs here.
        </p>
      </>
    ),
    navigation: [
      {
        active: true,
        icon: <LayoutGridIcon />,
        id: "overview",
        label: "Overview",
      },
      { icon: <FolderIcon />, id: "projects", label: "Projects" },
      { icon: <SettingsIcon />, id: "settings", label: "Settings" },
    ],
  },
  component: AppShell,
  parameters: { layout: "fullscreen" },
  title: "Vandor UI/AppShell",
} satisfies Meta<typeof AppShell>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Collapsed: Story = { args: { collapsed: true } };
export const Minimal: Story = { args: { navigation: [] } };
export const DisabledDestination: Story = {
  args: {
    navigation: [
      {
        disabled: true,
        icon: <SettingsIcon />,
        id: "locked",
        label: "Unavailable settings",
      },
    ],
  },
};
export const Controlled: Story = {
  argTypes: { collapsed: { control: false } },
  render: function ControlledShell(args) {
    const [collapsed, setCollapsed] = useState(false);
    return (
      <AppShell
        {...args}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        header={
          <span className="text-sm">
            {collapsed ? "Collapsed" : "Expanded"}
          </span>
        }
      />
    );
  },
};
export const NavigationAndSearch: Story = {
  render: function InteractiveShell(args) {
    const [active, setActive] = useState("overview");
    const [status, setStatus] = useState(
      "Select a destination or use Cmd/Ctrl+K."
    );
    return (
      <AppShell
        {...args}
        navigation={args.navigation.map((item) => ({
          ...item,
          active: item.id === active,
          onClick: () => {
            setActive(item.id);
            setStatus(`${item.label} selected`);
          },
        }))}
        onSearch={() =>
          setStatus("Search requested. The application owns its search UI.")
        }
      >
        <h1 className="text-2xl font-semibold">{active}</h1>
        <p role="status" className="mt-2 text-sm text-muted-foreground">
          {status}
        </p>
      </AppShell>
    );
  },
};
export const WorkspaceAndAccount: Story = {
  render: function WorkspaceShell(args) {
    const [workspace, setWorkspace] = useState("Acme");
    const [notice, setNotice] = useState("No account action selected");
    return (
      <AppShell
        {...args}
        sidebarHeader={({ collapsed, closeNavigation }) => (
          <Button
            variant="ghost"
            className="h-12 w-full justify-start overflow-hidden px-3"
            aria-label={`Switch workspace: ${workspace}`}
            onClick={() => {
              setWorkspace(workspace === "Acme" ? "Orbit" : "Acme");
              closeNavigation();
            }}
          >
            <LayoutGridIcon aria-hidden="true" />
            {!collapsed && <span className="truncate">{workspace}</span>}
          </Button>
        )}
        sidebarFooter={({ collapsed }) => (
          <Button
            variant="ghost"
            className="h-12 w-full justify-start overflow-hidden px-3"
            aria-label="Account action"
            onClick={() => setNotice("Local account action selected")}
          >
            <SettingsIcon aria-hidden="true" />
            {!collapsed && <span className="truncate">Avery Cole</span>}
          </Button>
        )}
      >
        <h1 className="text-2xl font-semibold">{workspace}</h1>
        <p role="status" className="mt-2 text-sm text-muted-foreground">
          {notice}
        </p>
      </AppShell>
    );
  },
};
export const Hierarchy: Story = {
  render: function HierarchyShell(args) {
    const [context, setContext] = useState<"workspace" | "agent">("workspace");
    const [agent, setAgent] = useState("Customer Support");
    const [section, setSection] = useState("Profile");
    return (
      <AppShell
        {...args}
        navigationContext={{
          depth: context === "workspace" ? 0 : 1,
          key: context,
        }}
        navigation={
          context === "workspace"
            ? [
                {
                  active: true,
                  icon: <BotIcon />,
                  id: "agents",
                  label: "Agents",
                  onClick: () => setContext("agent"),
                },
              ]
            : [
                {
                  dividerAfter: true,
                  icon: <ArrowLeftIcon />,
                  id: "back",
                  label: "All agents",
                  onClick: () => setContext("workspace"),
                },
                {
                  id: "switcher",
                  label: agent,
                  renderControl: ({ collapsed, closeNavigation }) => (
                    <Button
                      variant="ghost"
                      className="h-12 w-full justify-start overflow-hidden px-3"
                      aria-label={`Switch agent: ${agent}`}
                      onClick={() => {
                        setAgent(
                          agent === "Customer Support"
                            ? "Research Assistant"
                            : "Customer Support"
                        );
                        closeNavigation();
                      }}
                    >
                      <BotIcon aria-hidden="true" />
                      {!collapsed && <span className="truncate">{agent}</span>}
                    </Button>
                  ),
                },
                ...["Profile", "Configure", "Versions"].map((label) => ({
                  active: section === label,
                  id: label,
                  label,
                  onClick: () => setSection(label),
                })),
              ]
        }
      >
        <h1 className="text-2xl font-semibold">
          {context === "workspace" ? "Agents" : `${agent}: ${section}`}
        </h1>
        {context === "workspace" && (
          <Button className="mt-4" onClick={() => setContext("agent")}>
            Open Customer Support
          </Button>
        )}
      </AppShell>
    );
  },
};
export const LongContent: Story = {
  args: {
    brand: { name: "Acme Research and Development Workspace" },
    children: (
      <>
        {Array.from({ length: 40 }, (_, index) => (
          <p key={index} className="py-3 text-sm">
            Workspace activity {index + 1}
          </p>
        ))}
      </>
    ),
    navigation: Array.from({ length: 35 }, (_, index) => ({
      active: index === 0,
      icon: <FolderIcon />,
      id: `project-${index}`,
      label: `Research project ${index + 1}: a deliberately long navigation label`,
    })),
  },
};
export const Mobile: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Use a viewport below 768px. Open navigation, select a destination, and verify dismissal/focus return. Desktop collapsed state is independent from the drawer.",
      },
    },
  },
};
export const ReducedMotion: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Enable prefers-reduced-motion in your browser or OS. Collapse, labels and hierarchy transitions complete without travel animations; no addon is required.",
      },
    },
  },
  render: Hierarchy.render,
};
