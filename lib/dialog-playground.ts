import type { PropDefinition } from "@/lib/playground";
import { getPlaygroundDefaults } from "@/lib/playground";
import type { DialogProps } from "@/registry/new-york/dialog";

export const dialogProps = {
  children: {
    defaultValue: "Not set",
    description:
      "Dialog: plain content or optional render function. Content is not automatically wrapped in DialogBody.",
    type: "ReactNode | ((control: DialogControl) => ReactNode)",
  },
  closeButtonLabel: {
    defaultValue: '"Close dialog"',
    description:
      "contentProps.closeButtonLabel: localized accessible name for the built-in X.",
    type: "string",
  },
  contentProps: {
    defaultValue: "Not set",
    description:
      "Popup props, ref, className, render, initialFocus, finalFocus, size, and close/persistence options. No children.",
    type: "DialogContentProps",
  },
  control: {
    defaultValue: "Not set",
    description:
      "Dialog: controller from useDialogControl. Exclusive with open, defaultOpen, and handle.",
    type: "DialogControl",
  },
  defaultOpen: {
    defaultValue: "false",
    description: "Dialog: initial uncontrolled state.",
    type: "boolean",
  },
  description: {
    control: {
      initialValue:
        "Manage the details and preferences for this project." as string,
      kind: "text",
      label: "Description",
    },
    defaultValue: "Not set",
    description: "Dialog: optional supporting description.",
    type: "ReactNode",
  },
  disablePointerDismissal: {
    defaultValue: "false",
    description:
      "Dialog: prevent outside-press dismissal; non-modal focus-out dismissal is also prevented. Escape still works.",
    type: "boolean",
  },
  example: {
    control: {
      initialValue: "plain" as "plain" | "render-function" | "control" | "form",
      kind: "select",
      label: "Example",
      options: ["plain", "render-function", "control", "form"],
    },
    defaultValue: "Not applicable",
    description:
      "Playground only: plain children, render function, external control, or native form.",
    type: "Example preset",
  },
  finalFocus: {
    defaultValue: "Base UI default",
    description:
      "contentProps.finalFocus: closing focus target. Set explicitly for external openers.",
    type: "Base UI Popup finalFocus",
  },
  initialFocus: {
    defaultValue: "Base UI default",
    description:
      "contentProps.initialFocus: opening focus target, boolean, ref, or interaction-aware function.",
    type: "Base UI Popup initialFocus",
  },
  keepMounted: {
    control: {
      initialValue: false as boolean,
      kind: "boolean",
      label: "Keep mounted",
    },
    defaultValue: "false",
    description:
      "contentProps.keepMounted: retain hidden content and form state after closing.",
    type: "boolean",
  },
  longContent: {
    control: {
      initialValue: false as boolean,
      kind: "boolean",
      label: "Long content",
    },
    defaultValue: "Not applicable",
    description:
      "Playground only: demonstrate a scrolling body with stationary actions.",
    type: "boolean",
  },
  modal: {
    control: { initialValue: true as boolean, kind: "boolean", label: "Modal" },
    defaultValue: "true",
    description:
      "Dialog: modal focus and scroll lock. Only true renders a backdrop; trap-focus traps focus without blocking outside pointer interaction.",
    type: 'boolean | "trap-focus"',
  },
  onOpenChange: {
    defaultValue: "Not set",
    description:
      "Dialog: state request with Base UI reason and details.cancel() for unsaved-change guards.",
    type: "(open, details) => void",
  },
  onOpenChangeComplete: {
    defaultValue: "Not set",
    description:
      "Dialog: runs after native Motion animations complete. close() itself returns void.",
    type: "(open: boolean) => void",
  },
  open: {
    defaultValue: "Not set",
    description:
      "Dialog: controlled state; update in onOpenChange to accept requests.",
    type: "boolean",
  },
  renderHeader: {
    defaultValue: "Not set",
    description:
      "Dialog: customize header contents while retaining the provided semantic title and description exactly once.",
    type: "(elements: DialogHeaderElements) => ReactNode",
  },
  showCloseButton: {
    control: {
      initialValue: true as boolean,
      kind: "boolean",
      label: "Close button",
    },
    defaultValue: "true",
    description:
      "contentProps.showCloseButton: show the built-in accessible X.",
    type: "boolean",
  },
  size: {
    control: {
      initialValue: "md" as "sm" | "md" | "lg" | "xl",
      kind: "select",
      label: "Size",
      options: ["sm", "md", "lg", "xl"],
    },
    defaultValue: '"md"',
    description: "contentProps.size: responsive maximum panel width.",
    type: '"sm" | "md" | "lg" | "xl"',
  },
  title: {
    control: {
      initialValue: "Project settings" as string,
      kind: "text",
      label: "Title",
    },
    defaultValue: "Required",
    description: "Dialog: required meaningful accessible title.",
    type: "ReactNode",
  },
  trigger: {
    defaultValue: "Not set",
    description:
      "Dialog: associated button element. Custom components must forward refs and native props.",
    type: "ReactElement",
  },
} satisfies Record<string, PropDefinition>;

export const getDialogDefaults = () => getPlaygroundDefaults(dialogProps);
export type DialogPlaygroundValues = ReturnType<typeof getDialogDefaults>;
export const getDialogPreviewProps = (values: DialogPlaygroundValues) =>
  ({
    contentProps: {
      keepMounted: values.keepMounted,
      showCloseButton: values.showCloseButton,
      size: values.size,
    },
    description: values.description || undefined,
    modal: values.modal,
    title: values.title,
  }) satisfies Pick<
    DialogProps,
    "title" | "description" | "modal" | "contentProps"
  >;

const getExampleSetup = (example: DialogPlaygroundValues["example"]) => {
  if (example === "control") {
    return {
      imports: 'import { useRef } from "react";\n',
      state:
        "  const control = useDialogControl();\n  const opener = useRef<HTMLButtonElement>(null);\n",
    };
  }
  if (example === "form") {
    return {
      imports: 'import { useId } from "react";\n',
      state: "  const nameId = useId();\n",
    };
  }
  return { imports: "", state: "" };
};
const getExampleActions = (form: boolean, renderFunction: boolean) => {
  if (form) {
    return '<button type="submit">Submit demo</button>\n              <button type="button" onClick={close}>Cancel</button>';
  }
  if (renderFunction) {
    return '<button type="button" onClick={close}>Done</button>';
  }
  return "<DoneButton />";
};
export const getDialogCode = (values: DialogPlaygroundValues) => {
  const props = getDialogPreviewProps(values);
  const external = values.example === "control";
  const form = values.example === "form";
  const renderFunction = form || values.example === "render-function";
  const setup = getExampleSetup(values.example);
  const body = form
    ? `<label htmlFor={nameId}>Project name</label>
            <input id={nameId} name="name" defaultValue="Vandor UI" required />`
    : "Your settings form";
  return `"use client";

${setup.imports}import { Dialog, DialogBody, DialogFooter, ${external ? "useDialogControl, " : ""}${renderFunction ? "" : "useDialog"} } from "@/components/ui/dialog";
${
  renderFunction
    ? ""
    : `
function DoneButton() {
  const { close } = useDialog();
  return <button type="button" onClick={close}>Done</button>;
}
`
}
export function DialogDemo() {
${setup.state}  return (
    <>${external ? '\n      <button ref={opener} type="button" onClick={control.open}>Open dialog</button>' : ""}
      <Dialog
        title={${JSON.stringify(props.title)}}
        ${props.description ? `description={${JSON.stringify(props.description)}}` : ""}
        ${external ? "control={control}" : 'trigger={<button type="button">Open dialog</button>}'}
        modal={${props.modal}}
        contentProps={{ size: "${props.contentProps.size}", showCloseButton: ${props.contentProps.showCloseButton}, keepMounted: ${props.contentProps.keepMounted}${external ? ", finalFocus: opener" : ""} }}
      >
${renderFunction ? "        {({ close }) => (" : ""}
          ${form ? '<form className="flex min-h-0 flex-1 flex-col" onSubmit={(event) => { event.preventDefault(); close(); /* Demo only: close after save succeeds in production. */ }}>' : "<>"}
            <DialogBody>
              ${body}
              ${values.longContent ? '{Array.from({ length: 30 }, (_, index) => <p key={index} className="mb-4">Setting {index + 1}: Configure your project preferences.</p>)}' : ""}
            </DialogBody>
            <DialogFooter>
              ${getExampleActions(form, renderFunction)}
            </DialogFooter>
          ${form ? "</form>" : "</>"}
${renderFunction ? "        )}" : ""}
      </Dialog>
    </>
  );
}`;
};
