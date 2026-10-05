import type { PropDefinition } from "@/lib/playground";
import { getPlaygroundDefaults } from "@/lib/playground";
import type { DropdownProps } from "@/registry/new-york/dropdown";

export const dropdownProps = {
  align: {
    control: {
      initialValue: "start" as "start" | "center" | "end",
      kind: "select",
      label: "Alignment",
      options: ["start", "center", "end"],
    },
    defaultValue: '"start"',
    description: "contentProps / Content: alignment against the trigger.",
    type: '"start" | "center" | "end"',
  },
  animated: {
    control: {
      initialValue: true as boolean,
      kind: "boolean",
      label: "Animate menu",
    },
    defaultValue: "true",
    description:
      "Dropdown / Content: native Motion fade and scale. Reduced motion skips animation automatically; compact API applies to submenus too.",
    type: "boolean",
  },
  checked: {
    defaultValue: "Uncontrolled",
    description:
      "CheckboxItem: checked/defaultChecked and onCheckedChange(checked, details). Does not close by default; closeOnClick overrides this. RadioGroup uses value/defaultValue/onValueChange; RadioItem requires value and closes by default.",
    type: "boolean",
  },
  closeOnSelect: {
    defaultValue: "true",
    description:
      "Compact action: true closes immediately, false never closes automatically, success closes after callback resolution. Rejection keeps the current visibility. Compact links accept only boolean; overlays always request closing. Compound parts use closeOnClick instead.",
    type: 'boolean | "success"',
  },
  composition: {
    defaultValue: "Not set",
    description:
      "Compound parts inherit their Base UI props and refs: Root, Trigger, Content, Group, Label, Item, LinkItem, Separator, Shortcut, Sub, SubTrigger, SubContent, CheckboxItem, RadioGroup, RadioItem. Label/SubTrigger/checkbox/radio support inset. Shortcut accepts span props. Place Label inside Group.",
    type: "Base UI Menu props",
  },
  contentProps: {
    defaultValue: "Not set",
    description:
      "Dropdown: Content props except children/animated; includes ref, className, render and placement. Content defaults sideOffset=4, alignOffset=0, collisionPadding=8, keepMounted=false; SubContent defaults inline-end, 0, -3.",
    type: "DropdownContent props",
  },
  disabled: {
    control: {
      initialValue: false as boolean,
      kind: "boolean",
      label: "Disabled",
    },
    defaultValue: "false",
    description:
      "Root / Dropdown: disables the entire menu. triggerProps.disabled can disable only its trigger.",
    type: "boolean",
  },
  items: {
    defaultValue: "Required",
    description:
      "Dropdown: readonly entries with stable unique sibling ids. Choose one intent per item: action, JSX link, or renderOverlay. Actions have label, icon, shortcut, disabled and variant. Groups/submenus have items; separators only need id and type.",
    type: "readonly DropdownEntry[]",
  },
  modal: {
    defaultValue: "true",
    description: "Root / Dropdown: modal menu behavior inherited from Base UI.",
    type: "boolean",
  },
  link: {
    defaultValue: "Not set",
    description:
      "Compact link entry: router JSX or an anchor, composed through LinkItem without nested elements. Forwards router props, handlers and refs. Entry label supplies children. No disabled/variant/action/overlay props.",
    type: "ReactElement",
  },
  onSelect: {
    defaultValue: "Not set",
    description:
      "Compact action: receives the Base UI Item click event. A returned Promise automatically locks all compact items and shows pending until settled, even after dismissal/reopen. No request cancellation is implied.",
    type: "(event) => unknown",
  },
  onSelectError: {
    defaultValue: "Console error",
    description:
      "Compact action: handles synchronous exceptions or Promise rejection. Provide application feedback such as a toast. Not called after Dropdown unmounts.",
    type: "(error: unknown) => void",
  },
  onOpenChange: {
    defaultValue: "Not set",
    description:
      "Root / Dropdown: receives (open, details). details.cancel() rejects a request; externally changing open also works. onOpenChangeComplete fires after each completed transition.",
    type: "(open, details) => void",
  },
  open: {
    defaultValue: "Uncontrolled",
    description:
      "Root / Dropdown: controlled visibility. Pair with onOpenChange; defaultOpen initializes uncontrolled visibility (false).",
    type: "boolean",
  },
  renderOverlay: {
    defaultValue: "Not set",
    description:
      "Compact overlay entry: returns a controlled component rendered outside the menu root. Receives open, onOpenChange and finalFocus (trigger ref). Forward finalFocus to Dialog/Drawer contentProps. Opens after accepted menu close completes; do not call hooks in this callback.",
    type: "(props: DropdownOverlayProps) => ReactNode",
  },
  showShortcuts: {
    control: {
      initialValue: true as boolean,
      kind: "boolean",
      label: "Show shortcuts",
    },
    defaultValue: "true (demo)",
    description:
      "Demo only: displays shortcut hints. Shortcuts do not register keyboard commands.",
    type: "boolean (demo)",
  },
  showSubmenu: {
    control: {
      initialValue: true as boolean,
      kind: "boolean",
      label: "Show submenu",
    },
    defaultValue: "true (demo)",
    description: "Demo only: adds a nested Share menu to the items array.",
    type: "boolean (demo)",
  },
  side: {
    control: {
      initialValue: "bottom" as "bottom" | "top" | "left" | "right",
      kind: "select",
      label: "Side",
      options: ["bottom", "top", "left", "right"],
    },
    defaultValue: '"bottom"',
    description:
      "contentProps / Content: preferred side; collision handling may flip it. Also supports inline-start / inline-end.",
    type: '"top" | "bottom" | "left" | "right" | "inline-start" | "inline-end"',
  },
  trigger: {
    control: { initialValue: "Actions", kind: "text", label: "Trigger label" },
    defaultValue: "Required",
    description:
      "Dropdown: one React element. Props and ref are merged onto it; use a native button or a ref-forwarding button component.",
    type: "ReactElement",
  },
  triggerProps: {
    defaultValue: "Not set",
    description:
      "Dropdown: Base UI Trigger props except children/render, including ref, nativeButton, aria-label and event handlers. Use nativeButton=false for non-button render elements.",
    type: "DropdownTrigger props",
  },
  variant: {
    defaultValue: '"default"',
    description:
      "Item / action entry: default or destructive styling. Item also accepts inset (false), label, disabled and Base UI Item props. Action onSelect maps to onClick; closeOnSelect defaults true.",
    type: '"default" | "destructive"',
  },
} satisfies Record<string, PropDefinition>;

export const getDropdownDefaults = () => getPlaygroundDefaults(dropdownProps);
export type DropdownPlaygroundValues = ReturnType<typeof getDropdownDefaults>;
export const getDropdownPreviewProps = (
  values: DropdownPlaygroundValues,
  onSelect: (label: string) => void
) =>
  ({
    animated: values.animated,
    contentProps: { align: values.align, side: values.side },
    disabled: values.disabled,
    items: [
      {
        id: "edit",
        label: "Edit",
        onSelect: () => onSelect("Edit"),
        shortcut: values.showShortcuts ? "⌘E" : undefined,
      },
      {
        id: "duplicate",
        label: "Duplicate",
        onSelect: () => onSelect("Duplicate"),
      },
      ...(values.showSubmenu
        ? [
            {
              id: "share",
              items: [
                { id: "team", label: "Team", onSelect: () => onSelect("Team") },
                { disabled: true, id: "public", label: "Public link" },
              ],
              label: "Share",
              type: "submenu" as const,
            },
          ]
        : []),
      { id: "separator", type: "separator" },
      {
        id: "delete",
        label: "Delete",
        onSelect: () => onSelect("Delete"),
        variant: "destructive",
      },
    ],
  }) satisfies Omit<DropdownProps, "trigger">;

export const dropdownTriggerClass =
  "rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-xs hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 disabled:opacity-50";

export const getDropdownCode = (
  values: DropdownPlaygroundValues
) => `"use client";

import { useState } from "react";
import { Dropdown } from "@/components/ui/dropdown";

export const DropdownDemo = () => {
  const [selected, setSelected] = useState("None");
  return (
    <div className="flex flex-col items-center gap-4">
      <Dropdown
        animated={${values.animated}}
        disabled={${values.disabled}}
        contentProps={{ side: ${JSON.stringify(values.side)}, align: ${JSON.stringify(values.align)} }}
        trigger={<button type="button" className=${JSON.stringify(dropdownTriggerClass)}>{${JSON.stringify(values.trigger)}}</button>}
        items={[
          { id: "edit", label: "Edit",${values.showShortcuts ? ' shortcut: "⌘E",' : ""} onSelect: () => setSelected("Edit") },
          { id: "duplicate", label: "Duplicate", onSelect: () => setSelected("Duplicate") },${
            values.showSubmenu
              ? `
          { id: "share", type: "submenu", label: "Share", items: [
            { id: "team", label: "Team", onSelect: () => setSelected("Team") },
            { id: "public", label: "Public link", disabled: true },
          ] },`
              : ""
          }
          { id: "separator", type: "separator" },
          { id: "delete", label: "Delete", variant: "destructive", onSelect: () => setSelected("Delete") },
        ]}
      />
      <p role="status" className="text-sm text-muted-foreground">Last action: {selected}</p>
    </div>
  );
};`;
