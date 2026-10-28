import type { PropDefinition } from "./playground";

export const appShellProps: Record<string, PropDefinition> = {
  actions: {
    defaultValue: "undefined",
    description:
      "Trailing header actions. Consumers provide accessible names and responsive layouts.",
    type: "ReactNode",
  },
  brand: {
    defaultValue: "Required",
    description:
      "Brand shown in the default desktop sidebar header. name also labels the mobile drawer when sidebarHeader is absent. href turns the desktop brand into a link.",
    type: "{ name: string; icon?: ReactNode; href?: string }",
  },
  children: {
    defaultValue: "Required",
    description:
      "Content inside the shell's main landmark. Do not nest another main element.",
    type: "ReactNode",
  },
  className: {
    defaultValue: "undefined",
    description:
      "Merged classes on the shell root. Default is a viewport-height application layout.",
    type: "string",
  },
  collapsed: {
    defaultValue: "undefined",
    description:
      "Controlled desktop collapse state. The caller must update it in response to onCollapsedChange.",
    type: "boolean",
  },
  contentClassName: {
    defaultValue: "undefined",
    description:
      "Merged classes on the main content element, not the navigation or top header.",
    type: "string",
  },
  defaultCollapsed: {
    defaultValue: "false",
    description:
      "Initial uncontrolled desktop collapse state. Later changes to this prop do not reset the state.",
    type: "boolean",
  },
  header: {
    defaultValue: "undefined",
    description:
      "Content after the navigation trigger and optional search button in the top header.",
    type: "ReactNode",
  },
  labels: {
    defaultValue: "English labels",
    description:
      "Accessible shell labels, independent of navigationLabel and searchLabel.",
    type: "{ sidebar?: string; skipToContent?: string; openNavigation?: string; closeNavigation?: string; expandSidebar?: string; collapseSidebar?: string }",
  },
  navigation: {
    defaultValue: "Required",
    description:
      "Ordered navigation. Each item requires a unique id and label. Optional icon, href, onClick, active, disabled, dividerAfter and renderControl configure the item. An empty array is supported.",
    type: "readonly AppShellNavigationItem[]",
  },
  navigationContext: {
    defaultValue: "undefined",
    description:
      "Optional transition identity. A key change replaces the middle navigation panel. Increasing depth slides in, decreasing depth slides back; same depth slides in. Keep key stable for active-menu and same-panel resource changes.",
    type: "{ key: string; depth: number }",
  },
  navigationLabel: {
    defaultValue: '"Main navigation"',
    description:
      "Accessible name of navigation; also the mobile drawer title when a custom sidebarHeader is supplied.",
    type: "string",
  },
  onCollapsedChange: {
    defaultValue: "undefined",
    description:
      "Called synchronously with the requested next state when the desktop toggle is activated. Not called for initial state or external prop updates.",
    type: "(collapsed: boolean) => void",
  },
  onSearch: {
    defaultValue: "undefined",
    description:
      "Enables a search button and document-level Cmd/Ctrl+K callback. No search dialog or shortcut listener exists without it.",
    type: "() => void",
  },
  searchLabel: {
    defaultValue: '"Search workspace"',
    description: "Visible search-button label. Only used with onSearch.",
    type: "string",
  },
  showHeader: {
    defaultValue: "true",
    description:
      "Show the topbar. Headerless mode retains sidebar controls and a right-side mobile drawer; header/actions/search UI is hidden, not relocated.",
    type: "boolean",
  },
  sidebarFooter: {
    defaultValue: "undefined",
    description:
      "Persistent footer below the scrollable navigation. Receives collapsed and closeNavigation; mobile receives collapsed=false. Overrides user, including an explicit null.",
    type: "ReactNode | ((state: AppShellNavigationState) => ReactNode)",
  },
  sidebarHeader: {
    defaultValue: "undefined",
    description:
      "Replaces the brand row. Receives collapsed and closeNavigation. Mobile receives collapsed=false; closeNavigation closes only the mobile drawer.",
    type: "ReactNode | ((state: AppShellNavigationState) => ReactNode)",
  },
  user: {
    defaultValue: "undefined",
    description:
      "Optional name, description, avatar, readonly DropdownEntry[] items, pending and menuLabel. Custom sidebarFooter (including null) overrides this identity menu. Async drawer closure waits for accepted fulfillment; rejected and canceled actions retain navigation.",
    type: "AppShellUser",
  },
};
