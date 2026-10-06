import type { PropDefinition } from "@/lib/playground";
import { getPlaygroundDefaults } from "@/lib/playground";
import type { PageHeaderProps } from "@/registry/new-york/page-header";

export const pageHeaderProps = {
  actions: {
    defaultValue: "Not set",
    description:
      "One or more action elements, trailing on desktop and below the heading on mobile. Wraps when space is limited.",
    type: "ReactNode",
  },
  breadcrumb: {
    control: { initialValue: "", kind: "text", label: "Breadcrumb" },
    defaultValue: "Not set",
    description:
      "Content above the heading. Supply your own accessible breadcrumb navigation; PageHeader adds no nav wrapper.",
    type: "ReactNode",
  },
  className: {
    defaultValue: "Not set",
    description:
      "Classes merged on the header root. No outer margin is added; border-b-0 removes the divider.",
    type: "string",
  },
  description: {
    control: {
      initialValue: "Manage your workspace projects.",
      kind: "text",
      label: "Description",
    },
    defaultValue: "Not set",
    description:
      "Supporting content below the heading, rendered in a div to allow rich content.",
    type: "ReactNode",
  },
  ref: {
    defaultValue: "Not set",
    description: "React 19 ref forwarded to the native header element.",
    type: "Ref<HTMLElement>",
  },
  status: {
    control: { initialValue: "", kind: "text", label: "Status" },
    defaultValue: "Not set",
    description:
      "Optional content next to the title, such as a badge. Does not add a live region.",
    type: "ReactNode",
  },
  title: {
    control: { initialValue: "Projects", kind: "text", label: "Title" },
    defaultValue: "Required",
    description:
      "Page heading rendered as an h1. This is not the native header title attribute.",
    type: "string",
  },
} satisfies Record<string, PropDefinition>;

export const pageHeaderPlaygroundDefinitions = {
  ...pageHeaderProps,
  showActions: {
    control: {
      initialValue: true as boolean,
      kind: "boolean",
      label: "Show actions",
    },
    defaultValue: "true",
    description:
      "Demo composition toggle for the actions slot, not a PageHeader prop.",
    type: "boolean",
  },
} satisfies Record<string, PropDefinition>;

export const getPageHeaderDefaults = () =>
  getPlaygroundDefaults(pageHeaderPlaygroundDefinitions);
export type PageHeaderPlaygroundValues = ReturnType<
  typeof getPageHeaderDefaults
>;

export const getPageHeaderPreviewProps = (values: PageHeaderPlaygroundValues) =>
  ({
    breadcrumb: values.breadcrumb,
    description: values.description,
    status: values.status,
    title: values.title,
  }) satisfies Pick<
    PageHeaderProps,
    "title" | "breadcrumb" | "description" | "status"
  >;

export const getPageHeaderCode = (values: PageHeaderPlaygroundValues) => {
  const attributes = [`title={${JSON.stringify(values.title)}}`];
  for (const key of ["breadcrumb", "description", "status"] as const) {
    if (values[key]) {
      attributes.push(`${key}={${JSON.stringify(values[key])}}`);
    }
  }
  if (values.showActions) {
    attributes.push(`actions={
      <a href="/projects/new" className="inline-flex min-h-9 items-center rounded-md border border-border px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        Create project
      </a>
    }`);
  }
  return `import { PageHeader } from "@/components/ui/page-header";

export const PageHeaderDemo = () => (
  <PageHeader
    ${attributes.join("\n    ")}
  />
);`;
};
