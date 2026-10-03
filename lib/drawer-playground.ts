import type { PropDefinition } from "@/lib/playground";
import { getPlaygroundDefaults } from "@/lib/playground";

// eslint-disable-next-line sort-keys
export const drawerProps = {
  example: {
    control: {
      initialValue: "trigger" as
        | "trigger"
        | "control"
        | "render-function"
        | "panel-form",
      kind: "select",
      label: "Example",
      options: ["trigger", "control", "render-function", "panel-form"],
    },
    defaultValue: "Not applicable",
    description:
      "Playground only: choose trigger, external control, render function, or a DrawerPanel form.",
    type: "Example preset",
  },
  longContent: {
    control: {
      initialValue: false as boolean,
      kind: "boolean",
      label: "Long content",
    },
    defaultValue: "Not applicable",
    description:
      "Playground only: adds content to demonstrate DrawerBody scrolling.",
    type: "boolean",
  },
  control: {
    defaultValue: "Not set",
    description:
      "Drawer: stable controller returned by useDrawerControl. Cannot be combined with open, defaultOpen, or handle.",
    type: "DrawerControl",
  },
  swipeDirection: {
    control: {
      initialValue: "right" as "right" | "left" | "up" | "down",
      kind: "select",
      label: "Swipe direction",
      options: ["right", "left", "up", "down"],
    },
    defaultValue: '"right"',
    description:
      "Drawer: edge the panel enters from and swipes toward to close.",
    type: '"right" | "left" | "up" | "down"',
  },
  modal: {
    control: {
      initialValue: true as boolean,
      kind: "boolean",
      label: "Modal",
    },
    defaultValue: "true",
    description:
      "Drawer: locks modal focus and renders a backdrop when enabled.",
    type: "boolean",
  },
  showSwipeHandle: {
    control: {
      initialValue: false as boolean,
      kind: "boolean",
      label: "Swipe handle",
    },
    defaultValue: "false",
    description: "Drawer: shows a visual grabber for touch gestures.",
    type: "boolean",
  },
  showCloseButton: {
    control: {
      initialValue: true as boolean,
      kind: "boolean",
      label: "Close button",
    },
    defaultValue: "true",
    description: "DrawerContent: shows the top-right close button.",
    type: "boolean",
  },
  closeButtonLabel: {
    defaultValue: '"Close drawer"',
    description:
      "DrawerContent: accessible label for the close button. Use a localized label in translated interfaces.",
    type: "string",
  },
  snapPoints: {
    control: {
      initialValue: "none" as "none" | "half" | "half-full",
      kind: "select",
      label: "Snap points",
      options: ["none", "half", "half-full"],
    },
    defaultValue: "Not set",
    description: "Drawer: optional vertical drawer resting heights.",
    type: "number[]",
  },
  defaultOpen: {
    defaultValue: "false",
    description: "Drawer: initially opens the panel.",
    type: "boolean",
  },
  open: {
    defaultValue: "Not set",
    description: "Drawer: controlled open state.",
    type: "boolean",
  },
  onOpenChange: {
    defaultValue: "Not set",
    description:
      "Drawer: receives the next open state and Base UI event details.",
    type: "(open, details) => void",
  },
} satisfies Record<string, PropDefinition>;

export const getDrawerDefaults = () => getPlaygroundDefaults(drawerProps);
export type DrawerPlaygroundValues = ReturnType<typeof getDrawerDefaults>;

const snapPointsFor = (preset: DrawerPlaygroundValues["snapPoints"]) => {
  if (preset === "half") {
    return " snapPoints={[0.5]}";
  }
  if (preset === "half-full") {
    return " snapPoints={[0.5, 0.9]}";
  }
  return "";
};

const getDrawerPanelCode = (values: DrawerPlaygroundValues) => `"use client";

import { DrawerPanel, DrawerBody, DrawerFooter } from "@/components/ui/drawer";

export function DrawerDemo() {
  return (
    <DrawerPanel
      title="Project settings"
      description="Edit the project name. This demo does not save data."
      trigger={<button type="button">Open drawer</button>}
      swipeDirection="${values.swipeDirection}"${values.modal ? "" : " modal={false}"}${values.showSwipeHandle ? " showSwipeHandle" : ""}${snapPointsFor(values.snapPoints)}
      contentProps={{ showCloseButton: ${values.showCloseButton} }}
    >
      {({ close }) => (
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={(event) => {
          event.preventDefault();
          close(); // Demo only: in production, close after saving succeeds.
        }}>
          <DrawerBody>
            <label htmlFor="project-name">Project name</label>
            <input id="project-name" name="name" defaultValue="Vandor UI" required />
            ${values.longContent ? "{Array.from({ length: 30 }, (_, index) => <p key={index}>Setting {index + 1}: Configure your project preferences.</p>)}" : ""}
          </DrawerBody>
          <DrawerFooter>
            <button type="submit">Submit demo</button>
            <button type="button" onClick={close}>Cancel</button>
          </DrawerFooter>
        </form>
      )}
    </DrawerPanel>
  );
}`;

export const getDrawerCode = (values: DrawerPlaygroundValues) => {
  if (values.example === "panel-form") {
    return getDrawerPanelCode(values);
  }
  const external = values.example === "control";
  const renderFunction = values.example === "render-function";
  const body = values.longContent
    ? `{Array.from({ length: 30 }, (_, index) => (
            <p key={index} className="mb-4">Setting {index + 1}: Configure your project preferences.</p>
          ))}`
    : "Your settings form";
  return `"use client";

${external ? 'import { useRef } from "react";\n' : ""}import {
  Drawer, DrawerBody, ${renderFunction ? "" : "DrawerClose, "}DrawerContent, DrawerDescription, DrawerFooter,
  DrawerHeader, DrawerTitle, ${external ? "useDrawerControl" : "DrawerTrigger"},
} from "@/components/ui/drawer";

export function DrawerDemo() {
${external ? "  const control = useDrawerControl();\n  const opener = useRef<HTMLButtonElement>(null);\n" : ""}  return (
${external ? '    <>\n      <button ref={opener} type="button" onClick={control.open}>Open drawer</button>\n' : ""}    <Drawer${external ? " control={control}" : ""} swipeDirection="${values.swipeDirection}"${values.modal ? "" : " modal={false}"}${values.showSwipeHandle ? " showSwipeHandle" : ""}${snapPointsFor(values.snapPoints)}>
${external ? "" : "      <DrawerTrigger>Open drawer</DrawerTrigger>\n"}      <DrawerContent${external ? " finalFocus={opener}" : ""}${values.showCloseButton ? "" : " showCloseButton={false}"}>
${renderFunction ? "        {({ close }) => (\n          <>\n" : ""}        <DrawerHeader>
          <DrawerTitle>Project settings</DrawerTitle>
          <DrawerDescription>Manage the details and preferences for this project.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>${body}</DrawerBody>
        <DrawerFooter>
          ${renderFunction ? '<button type="button" onClick={close}>Done</button>' : "<DrawerClose>Done</DrawerClose>"}
        </DrawerFooter>
${renderFunction ? "          </>\n        )}\n" : ""}      </DrawerContent>
    </Drawer>
${external ? "    </>\n" : ""}  );
}`;
};
