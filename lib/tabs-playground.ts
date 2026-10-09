import { createElement } from "react";

import type { PropDefinition } from "@/lib/playground";
import { getPlaygroundDefaults } from "@/lib/playground";
import type {
  TabsNavigationProps,
  TabsPanelProps,
} from "@/registry/new-york/tabs";

export const tabsProps = {
  activationMode: {
    control: {
      initialValue: "manual" as "manual" | "automatic",
      kind: "select",
      label: "Activation (panels)",
      options: ["manual", "automatic"],
    },
    defaultValue: '"manual"',
    description:
      "Panel mode: arrows move focus; automatic also selects. Manual uses Enter/Space to activate.",
    type: '"manual" | "automatic"',
  },
  active: {
    defaultValue: "false",
    description:
      "Link item: route-owned active state. Adds aria-current=page; clicks do not change this state. Mark at most one item active.",
    type: "boolean",
  },
  animated: {
    control: {
      initialValue: true as boolean,
      kind: "boolean",
      label: "Animated",
    },
    defaultValue: "true",
    description:
      "Motion indicator and panel fade. Reduced motion always disables movement.",
    type: "boolean",
  },
  content: {
    defaultValue: "Required for panel items",
    description:
      "Panel item: content rendered in its corresponding panel. Accepts any React node.",
    type: "ReactNode",
  },
  contentClassName: {
    defaultValue: "Not set",
    description: "Panel mode: classes applied to each panel element.",
    type: "string",
  },
  defaultValue: {
    defaultValue: "First enabled item",
    description:
      "Panel mode: initial selection. Omitted selects the first enabled item; null selects none.",
    type: "string | null",
  },
  disabled: {
    control: {
      initialValue: false as boolean,
      kind: "boolean",
      label: "Disable Activity (panels)",
    },
    defaultValue: "false",
    description:
      "Panel item only: prevents selection. Demo disables Activity. Disabled Base UI tabs remain keyboard-focusable. Not a root prop or link-item prop.",
    type: "boolean (item; demo control)",
  },
  items: {
    defaultValue: "Required",
    description:
      "Required. One homogeneous collection: value/label/content panels or link/active navigation items. Do not mix both kinds.",
    type: "readonly TabsPanelItem[] | readonly TabsLinkItem[]",
  },
  keepMounted: {
    control: {
      initialValue: false as boolean,
      kind: "boolean",
      label: "Keep mounted (panels)",
    },
    defaultValue: "false",
    description:
      "Panel mode: preserve inactive panel DOM and local state. Hidden panels cannot be interacted with.",
    type: "boolean",
  },
  key: {
    defaultValue: "Link key or index",
    description:
      "Link item: optional stable identity for dynamic collections; falls back to the link element key, then index.",
    type: "string",
  },
  label: {
    control: {
      initialValue: "Project sections",
      kind: "text",
      label: "Accessible label",
    },
    defaultValue: '"Project sections" (demo)',
    description:
      "Panel item: required React node for its trigger. Playground control instead sets the root aria-label; it labels the tablist in panel mode and nav in link mode.",
    type: "ReactNode (panel item); string (demo control)",
  },
  link: {
    defaultValue: "Required for link items",
    description:
      "Link item: native anchor or router Link, including its label. Must forward DOM props and ref to one anchor. No href/to adapter required.",
    type: "ReactElement",
  },
  listClassName: {
    defaultValue: "Not set",
    description: "Class overrides for the tab-bar element.",
    type: "string",
  },
  mode: {
    control: {
      initialValue: "panels" as "panels" | "links",
      kind: "select",
      label: "Example",
      options: ["panels", "links"],
    },
    defaultValue: '"panels" (demo)',
    description:
      "Playground composition, not a public prop. Link preview intercepts clicks and updates demo-owned route state without leaving the page.",
    type: '"panels" | "links" (demo only)',
  },
  onValueChange: {
    defaultValue: "Not set",
    description:
      "Panel mode: Base UI change callback, including fallback changes after item removal/disabling. User changes can be canceled using details.cancel().",
    type: "(value, details) => void",
  },
  orientation: {
    control: {
      initialValue: "horizontal" as "horizontal" | "vertical",
      kind: "select",
      label: "Orientation",
      options: ["horizontal", "vertical"],
    },
    defaultValue: '"horizontal"',
    description:
      "Tab-bar direction. Panel mode also controls keyboard navigation and panel placement.",
    type: '"horizontal" | "vertical"',
  },
  value: {
    defaultValue: "Not set",
    description:
      "Panel item: required unique string identity. On Tabs: controlled active item value; null selects no panel.",
    type: "string | null",
  },
  variant: {
    control: {
      initialValue: "underline" as "underline" | "pill" | "segmented",
      kind: "select",
      label: "Variant",
      options: ["underline", "pill", "segmented"],
    },
    defaultValue: '"underline"',
    description: "Indicator and tab-bar appearance.",
    type: '"underline" | "pill" | "segmented"',
  },
} satisfies Record<string, PropDefinition>;

export const getTabsDefaults = () => getPlaygroundDefaults(tabsProps);
export type TabsPlaygroundValues = ReturnType<typeof getTabsDefaults>;

export const tabsDemoItems = [
  {
    content: "A clear view of your project, without leaving this page.",
    label: "Overview",
    value: "overview",
  },
  {
    content: "Recent changes and conversations, all in one place.",
    label: "Activity",
    value: "activity",
  },
  {
    content: "Manage project preferences and access.",
    label: "Settings",
    value: "settings",
  },
];

export const getTabsPreviewProps = (
  values: TabsPlaygroundValues,
  active = "overview",
  onNavigate?: (value: string) => void
): TabsPanelProps | TabsNavigationProps => {
  const common = {
    animated: values.animated,
    "aria-label": values.label,
    orientation: values.orientation,
    variant: values.variant,
  };
  if (values.mode === "links") {
    return {
      ...common,
      items: tabsDemoItems.map((item) => ({
        active: active === item.value,
        key: item.value,
        link: createElement(
          "a",
          {
            href: `#${item.value}`,
            onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
              if (
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
              ) {
                return;
              }
              event.preventDefault();
              onNavigate?.(item.value);
            },
          },
          item.label
        ),
      })),
    };
  }
  return {
    ...common,
    activationMode: values.activationMode,
    items: tabsDemoItems.map((item) => ({
      ...item,
      disabled: item.value === "activity" && values.disabled,
    })),
    keepMounted: values.keepMounted,
  };
};

export const getTabsCode = (values: TabsPlaygroundValues) => {
  const common = `aria-label={${JSON.stringify(values.label)}} variant="${values.variant}" orientation="${values.orientation}" animated={${values.animated}}`;
  if (values.mode === "links") {
    return `"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";

const items = ${JSON.stringify(tabsDemoItems, null, 2)};

export function TabsDemo() {
  // Demo navigation only. In production, use your router's current location.
  const [active, setActive] = useState("overview");
  return (
    <Tabs ${common}
      items={items.map((item) => ({
        key: item.value,
        active: active === item.value,
        link: (
          <a href={\`#\${item.value}\`} onClick={(event) => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            setActive(item.value);
          }}>{item.label}</a>
        ),
      }))}
    />
  );
}`;
  }
  return `"use client";

import { Tabs } from "@/components/ui/tabs";

const items = ${JSON.stringify(tabsDemoItems, null, 2)};

export function TabsDemo() {
  return (
    <Tabs ${common}
      activationMode="${values.activationMode}" keepMounted={${values.keepMounted}}
      items={items.map((item) => ({
        ...item,
        disabled: item.value === "activity" && ${values.disabled},
      }))}
    />
  );
}`;
};
