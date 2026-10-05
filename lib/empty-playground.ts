import type { ComponentProps } from "react";

import type { PropDefinition } from "@/lib/playground";
import { getPlaygroundDefaults } from "@/lib/playground";
import type { Empty, EmptyMedia } from "@/registry/new-york/empty";

export const emptyProps = {
  children: {
    defaultValue: "Not set",
    description:
      "All parts: compose content explicitly. Header groups Media, Title, and Description; Content holds actions or inputs.",
    type: "ReactNode",
  },
  className: {
    defaultValue: "Not set",
    description:
      "All parts: merged with defaults. Add border to Empty for a dashed outline; no border width is enabled by default.",
    type: "string",
  },
  description: {
    control: {
      initialValue: "Create your first project to get started.",
      kind: "text",
      label: "Description",
    },
    defaultValue: "Not set",
    description: "EmptyDescription children, not a prop on Empty.",
    type: "ReactNode (composition)",
  },
  outline: {
    control: {
      initialValue: false as boolean,
      kind: "boolean",
      label: "Dashed outline",
    },
    defaultValue: "false (demo)",
    description:
      'Demo composition: adds className="border" to Empty; not a component prop.',
    type: "boolean (demo only)",
  },
  showAction: {
    control: {
      initialValue: true as boolean,
      kind: "boolean",
      label: "Show action",
    },
    defaultValue: "true (demo)",
    description:
      "Demo composition: includes EmptyContent with a documentation link. Replace its destination in your application.",
    type: "boolean (demo only)",
  },
  showMedia: {
    control: {
      initialValue: true as boolean,
      kind: "boolean",
      label: "Show media",
    },
    defaultValue: "true (demo)",
    description:
      "Demo composition: includes EmptyMedia and a decorative folder icon.",
    type: "boolean (demo only)",
  },
  title: {
    control: { initialValue: "No projects yet", kind: "text", label: "Title" },
    defaultValue: "Not set",
    description:
      "EmptyTitle children, not a prop on Empty. The title renders a div, not a heading.",
    type: "ReactNode (composition)",
  },
  variant: {
    control: {
      initialValue: "icon" as "default" | "icon",
      kind: "select",
      label: "Media variant",
      options: ["default", "icon"],
    },
    defaultValue: '"default"',
    description:
      "EmptyMedia: transparent media container or muted icon tile. Only affects the preview when media is shown.",
    type: '"default" | "icon"',
  },
} satisfies Record<string, PropDefinition>;

export const getEmptyDefaults = () => getPlaygroundDefaults(emptyProps);
export type EmptyPlaygroundValues = ReturnType<typeof getEmptyDefaults>;
export const getEmptyPreviewProps = (values: EmptyPlaygroundValues) => ({
  media: { variant: values.variant } satisfies ComponentProps<
    typeof EmptyMedia
  >,
  root: {
    className: values.outline ? "border" : undefined,
  } satisfies ComponentProps<typeof Empty>,
});

export const getEmptyCode = (
  values: EmptyPlaygroundValues
) => `import { FolderIcon } from "lucide-react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";

export const EmptyDemo = () => (
  <Empty${values.outline ? ' className="border"' : ""}>
    <EmptyHeader>${
      values.showMedia
        ? `
      <EmptyMedia variant="${values.variant}">
        <FolderIcon aria-hidden="true" />
      </EmptyMedia>`
        : ""
    }
      <EmptyTitle>{${JSON.stringify(values.title)}}</EmptyTitle>
      <EmptyDescription>{${JSON.stringify(values.description)}}</EmptyDescription>
    </EmptyHeader>${
      values.showAction
        ? `
    <EmptyContent>
      <a href="/docs/components" className="rounded-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4">Explore components</a>
    </EmptyContent>`
        : ""
    }
  </Empty>
);`;
