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
      "Playground only: choose trigger, external control, render function, or a form.",
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
  title: {
    defaultValue: "Required",
    description: "Drawer: meaningful accessible panel title.",
    type: "ReactNode",
  },
  renderHeader: {
    defaultValue: "Not set",
    description:
      "Drawer: custom header contents receiving ready-to-render title and optional description elements. Keep title in the returned content.",
    type: "(elements: DrawerHeaderElements) => ReactNode",
  },
  description: {
    defaultValue: "Not set",
    description: "Drawer: optional supporting content beneath the title.",
    type: "ReactNode",
  },
  trigger: {
    defaultValue: "Not set",
    description:
      "Drawer: optional button element composed as an associated trigger.",
    type: "ReactElement",
  },
  children: {
    defaultValue: "Not set",
    description:
      "Drawer: content or a function receiving the panel controller.",
    type: "ReactNode | ((control: DrawerControl) => ReactNode)",
  },
  contentProps: {
    defaultValue: "Not set",
    description:
      "Drawer: popup props, focus restoration, close button options, and keepMounted. Does not accept children.",
    type: "object",
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
    description:
      "contentProps.showCloseButton: shows the top-right close button.",
    type: "boolean",
  },
  closeButtonLabel: {
    defaultValue: '"Close drawer"',
    description:
      "contentProps.closeButtonLabel: accessible label for the close button. Use a localized label in translated interfaces.",
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

import { Drawer, DrawerBody, DrawerFooter } from "@/components/ui/drawer";

export function DrawerDemo() {
  return (
    <Drawer
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
    </Drawer>
  );
}`;

export const getDrawerCode = (values: DrawerPlaygroundValues) => {
  if (values.example === "panel-form") {
    return getDrawerPanelCode(values);
  }
  const external = values.example === "control";
  const body = values.longContent
    ? `{Array.from({ length: 30 }, (_, index) => (
            <p key={index} className="mb-4">Setting {index + 1}: Configure your project preferences.</p>
          ))}`
    : "Your settings form";
  return `"use client";

${external ? 'import { useRef } from "react";\n' : ""}import {
  Drawer, DrawerBody, DrawerFooter, ${external ? "useDrawerControl, " : ""}useDrawer,
} from "@/components/ui/drawer";

function DoneButton() {
  const { close } = useDrawer();
  return <button type="button" onClick={close}>Done</button>;
}

export function DrawerDemo() {
${external ? "  const control = useDrawerControl();\n  const opener = useRef<HTMLButtonElement>(null);\n" : ""}  return (
${external ? '    <>\n      <button ref={opener} type="button" onClick={control.open}>Open drawer</button>\n' : ""}    <Drawer${external ? " control={control}" : ""} swipeDirection="${values.swipeDirection}"${values.modal ? "" : " modal={false}"}${values.showSwipeHandle ? " showSwipeHandle" : ""}${snapPointsFor(values.snapPoints)}
      title="Project settings"
      description="Manage the details and preferences for this project."
      ${external ? "" : 'trigger={<button type="button">Open drawer</button>}'}
      contentProps={{ showCloseButton: ${values.showCloseButton}${external ? ", finalFocus: opener" : ""} }}
    >
${values.example === "render-function" ? "      {({ close }) => (\n        <>\n" : ""}
        <DrawerBody>${body}</DrawerBody>
        <DrawerFooter>
          ${values.example === "render-function" ? '<button type="button" onClick={close}>Done</button>' : "<DoneButton />"}
        </DrawerFooter>
${values.example === "render-function" ? "        </>\n      )}\n" : ""}
    </Drawer>
${external ? "    </>\n" : ""}  );
}`;
};
