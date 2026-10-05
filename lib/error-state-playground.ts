import type { ComponentProps } from "react";

import { getPlaygroundDefaults } from "@/lib/playground";
import type { PropDefinition } from "@/lib/playground";
import type { ErrorState } from "@/registry/new-york/error-state";

export const errorStateProps = {
  border: {
    control: {
      initialValue: "none" as "none" | "solid" | "dashed",
      kind: "select",
      label: "Border",
      options: ["none", "solid", "dashed"],
    },
    defaultValue: '"none"',
    description:
      "ErrorState: optional solid or dashed outline using the theme border token.",
    type: '"none" | "solid" | "dashed"',
  },
  children: {
    defaultValue: "Not set",
    description:
      "All parts: explicit content. Details does not redact supplied content; only provide safe, non-sensitive information.",
    type: "ReactNode",
  },
  className: {
    defaultValue: "Not set",
    description:
      "All parts: classes merged with defaults through cn. The root has no border by default.",
    type: "string",
  },
  defaultOpen: {
    defaultValue: "false",
    description: "ErrorStateDetails: initial uncontrolled open state.",
    type: "boolean",
  },
  description: {
    control: {
      initialValue: "Check your connection and try again.",
      kind: "text",
      label: "Description",
    },
    defaultValue: "Not set",
    description:
      "ErrorStateDescription children. Explain a useful recovery step without blaming the user.",
    type: "ReactNode (composition)",
  },
  disabled: {
    defaultValue: "false",
    description: "ErrorStateDetails: disables disclosure interaction.",
    type: "boolean",
  },
  expandedIcon: {
    defaultValue: "MinusIcon",
    description:
      "ErrorStateDetails: expanded-state indicator. Crossfades with the closed icon.",
    type: "ReactNode",
  },
  icon: {
    defaultValue: "PlusIcon",
    description:
      "ErrorStateDetails: closed-state indicator React node. null hides the indicator.",
    type: "ReactNode",
  },
  onOpenChange: {
    defaultValue: "Not set",
    description:
      "ErrorStateDetails: requests an open-state change when the Accordion trigger is activated.",
    type: "(open: boolean) => void",
  },
  open: {
    defaultValue: "Uncontrolled",
    description:
      "ErrorStateDetails: controlled open state; pair with onOpenChange. No details are rendered unless composed explicitly.",
    type: "boolean",
  },
  role: {
    defaultValue: "Not set",
    description:
      "ErrorState: choose a region or announcement policy at the application level. No automatic alert, focus movement, or live region.",
    type: "AriaRole",
  },
  showAction: {
    control: {
      initialValue: true as boolean,
      kind: "boolean",
      label: "Show retry",
    },
    defaultValue: "true (demo)",
    description:
      "Demo composition: includes an inert retry button. Connect its onClick to your application's recovery operation.",
    type: "boolean (demo only)",
  },
  showDetails: {
    control: {
      initialValue: false as boolean,
      kind: "boolean",
      label: "Show support details",
    },
    defaultValue: "false (demo)",
    description:
      "Demo composition: includes an initially closed Accordion disclosure with a safe example reference.",
    type: "boolean (demo only)",
  },
  showMedia: {
    control: {
      initialValue: true as boolean,
      kind: "boolean",
      label: "Show icon",
    },
    defaultValue: "true (demo)",
    description:
      "Demo composition: includes ErrorStateMedia with a decorative CircleAlert icon.",
    type: "boolean (demo only)",
  },
  summary: {
    defaultValue: '"Technical details"',
    description:
      "ErrorStateDetails: accessible disclosure label. Keep it nonempty and free of interactive children.",
    type: "ReactNode",
  },
  title: {
    control: {
      initialValue: "Unable to load projects",
      kind: "text",
      label: "Title",
    },
    defaultValue: "Not set",
    description:
      "ErrorStateTitle children, not a prop on ErrorState. Renders a div; supply heading semantics when appropriate.",
    type: "ReactNode (composition)",
  },
  variant: {
    control: {
      initialValue: "centered" as "centered" | "inline",
      kind: "select",
      label: "Layout",
      options: ["centered", "inline"],
    },
    defaultValue: '"centered"',
    description:
      "ErrorState: centered replacement content or a compact, leading-icon inline layout.",
    type: '"centered" | "inline"',
  },
} satisfies Record<string, PropDefinition>;

export const getErrorStateDefaults = () =>
  getPlaygroundDefaults(errorStateProps);
export type ErrorStatePlaygroundValues = ReturnType<
  typeof getErrorStateDefaults
>;
export const getErrorStatePreviewProps = (values: ErrorStatePlaygroundValues) =>
  ({
    border: values.border,
    variant: values.variant,
  }) satisfies ComponentProps<typeof ErrorState>;

export const getErrorStateCode = (
  values: ErrorStatePlaygroundValues
) => `${values.showMedia ? 'import { CircleAlertIcon } from "lucide-react";\n' : ""}${values.showAction ? 'import { Button } from "@/components/ui/button";\n' : ""}import { ErrorState, ErrorStateContent, ErrorStateHeader, ErrorStateTitle, ErrorStateDescription${values.showMedia ? ", ErrorStateMedia" : ""}${values.showAction ? ", ErrorStateActions" : ""}${values.showDetails ? ", ErrorStateDetails" : ""} } from "@/components/ui/error-state";

export const ErrorStateDemo = () => (
  <ErrorState variant="${values.variant}" border="${values.border}">${
    values.showMedia
      ? `
    <ErrorStateMedia><CircleAlertIcon aria-hidden="true" /></ErrorStateMedia>`
      : ""
  }
    <ErrorStateContent>
      <ErrorStateHeader>
        <ErrorStateTitle>{${JSON.stringify(values.title)}}</ErrorStateTitle>
        <ErrorStateDescription>{${JSON.stringify(values.description)}}</ErrorStateDescription>
      </ErrorStateHeader>${
        values.showAction
          ? `
      <ErrorStateActions>
        {/* Connect onClick to your application's recovery operation. */}
        <Button type="button" variant="outline" size="sm">Try again</Button>
      </ErrorStateActions>`
          : ""
      }${
        values.showDetails
          ? `
      <ErrorStateDetails>Reference: DEMO-1042</ErrorStateDetails>`
          : ""
      }
    </ErrorStateContent>
  </ErrorState>
);`;
