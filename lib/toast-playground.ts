import type { PropDefinition } from "@/lib/playground";
import { getPlaygroundDefaults } from "@/lib/playground";
import type { ToastOptions } from "@/registry/new-york/toast";

export const toastProps = {
  action: {
    control: { initialValue: false, kind: "boolean", label: "Include action" },
    defaultValue: "false",
    description: "Show an action notification with a 4-second default timeout.",
    type: "boolean",
  },
  actionLabel: {
    control: { initialValue: "Undo", kind: "text", label: "Action label" },
    defaultValue: "Undo",
    description: "Action control label.",
    type: "string",
  },
  customDuration: {
    control: {
      initialValue: false,
      kind: "boolean",
      label: "Override duration",
    },
    defaultValue: "false",
    description: "Use the configured duration; loading still persists.",
    type: "boolean",
  },
  description: {
    control: {
      initialValue: "Your project settings are up to date.",
      kind: "text",
      label: "Description",
    },
    defaultValue: "Not set",
    description: "Optional detail opens the connected toast body.",
    type: "string",
  },
  duration: {
    control: {
      enabledBy: "customDuration",
      initialValue: 4000,
      kind: "range",
      label: "Duration (ms)",
      max: 12_000,
      min: 0,
      step: 500,
    },
    defaultValue: "4000",
    description: "Zero means persistent.",
    type: "number",
  },
  position: {
    control: {
      initialValue: "responsive",
      kind: "select",
      label: "Position",
      options: [
        "responsive",
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
    },
    defaultValue: "responsive",
    description: "Root toaster placement.",
    type: "ToastPosition",
  },
  title: {
    control: { initialValue: "Changes saved", kind: "text", label: "Title" },
    defaultValue: "Changes saved",
    description: "Short notification title shown in the compact pill.",
    type: "ReactNode",
  },
  type: {
    control: {
      initialValue: "success",
      kind: "select",
      label: "Status",
      options: ["success", "error", "warning", "info", "loading", "action"],
    },
    defaultValue: "success",
    description: "Status icon; only loading waits without a timer by default.",
    type: "ToastKind",
  },
} satisfies Record<string, PropDefinition>;

export const toastApiProps = {
  actionLabel: {
    defaultValue: "undefined",
    description:
      "Toast option that renders a separately focusable action button with a 4-second default timeout.",
    type: "string",
  },
  actionOnClick: {
    defaultValue: "undefined",
    description:
      "Toast option callback invoked by the action button. Use actionLabel to show the button.",
    type: "() => void",
  },
  description: {
    defaultValue: "undefined",
    description: "Toast option rendered in the connected detail body.",
    type: "ReactNode",
  },
  duration: {
    defaultValue:
      "3,000 ms title-only; 4,000 ms with description/action; loading waits without a timer",
    description:
      "Toast option. Overrides the default auto-dismiss duration; 0 persists until explicitly dismissed.",
    type: "number",
  },
  id: {
    defaultValue: "Generated for new toasts; required by toast.update",
    description:
      "Toast ID. New toast methods return this ID; use it with toast.update or toast.dismiss to target that notification.",
    type: "string",
  },
  onClose: {
    defaultValue: "undefined",
    description:
      "Called once when dismissal starts, whether explicit, swipe, or timeout.",
    type: "() => void",
  },
  onRemove: {
    defaultValue: "undefined",
    description:
      "Called after closing animations finish and Base UI removes the record.",
    type: "() => void",
  },
  position: {
    defaultValue: "top-right",
    description:
      "Optional Toaster prop. The default top-right position becomes top-center on narrow screens.",
    type: '"top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"',
  },
  priority: {
    defaultValue: "low; error toasts default to high",
    description:
      "Announcement priority. High priority is announced urgently; this does not change duration.",
    type: '"low" | "high"',
  },
  title: {
    defaultValue:
      "Required by toast methods; preserved when omitted from updates",
    description:
      "Visible notification title. Each toast method takes the title as its first argument.",
    type: "ReactNode",
  },
  type: {
    defaultValue:
      "Preserved for toast.update; determined by the selected toast method otherwise",
    description:
      "Toast status: action, error, info, loading, success, or warning.",
    type: '"action" | "error" | "info" | "loading" | "success" | "warning"',
  },
} satisfies Record<string, PropDefinition>;

export const getToastDefaults = () => getPlaygroundDefaults(toastProps);

export const getToastPreviewOptions = (
  values: ReturnType<typeof getToastDefaults>,
  actionOnClick: () => void
): ToastOptions => ({
  description: values.description || undefined,
  ...(values.action
    ? { actionLabel: String(values.actionLabel) || "Undo", actionOnClick }
    : {}),
  ...(values.customDuration ? { duration: Number(values.duration) } : {}),
});

export const getToastCode = (values: ReturnType<typeof getToastDefaults>) => {
  const options = [
    values.description
      ? `description: ${JSON.stringify(values.description)}`
      : "",
    values.action
      ? `actionLabel: ${JSON.stringify(values.actionLabel || "Undo")}, actionOnClick: () => toast.success("Action completed")`
      : "",
    values.customDuration ? `duration: ${Number(values.duration)}` : "",
  ].filter(Boolean);
  const call = `toast.${values.type}(${JSON.stringify(values.title)}${options.length ? `, { ${options.join(", ")} }` : ""});`;
  const placement =
    values.position === "responsive"
      ? ""
      : ` position=${JSON.stringify(values.position)}`;
  return `"use client";\n\nimport { ToastProvider, Toaster, toast } from "@/components/ui/toast";\n\n// Mount the provider/toaster once above routes in a real application.\nexport function ToastExample() {\n  return (\n    <ToastProvider>\n      <Toaster${placement} />\n      <button type="button" onClick={() => { ${call} }}>Show notification</button>\n    </ToastProvider>\n  );\n}`;
};
