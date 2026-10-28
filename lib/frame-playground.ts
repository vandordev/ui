import { getPlaygroundDefaults } from "@/lib/playground";
import type { PropDefinition } from "@/lib/playground";
import type { FrameProps } from "@/registry/new-york/frame";

export const frameProps = {
  children: {
    defaultValue: "Not set",
    description:
      "Each part: native children. Keep panels as direct siblings for stacked layouts.",
    type: "ReactNode",
  },
  className: {
    defaultValue: "Not set",
    description:
      "Each part: merged classes. Set [--frame-radius:var(--radius-lg)] on Frame to customize concentric corners.",
    type: "string",
  },
  dense: {
    control: { initialValue: false, kind: "boolean", label: "Dense frame" },
    defaultValue: "false",
    description:
      "Frame: removes outer padding and gaps, not panel content padding. Use stacked as well for shared panel seams.",
    type: "boolean",
  },
  description: {
    control: {
      initialValue: "Manage your deployment environments.",
      kind: "text",
      label: "Description",
    },
    defaultValue: "Not set",
    description:
      "Demo content for FrameDescription children, not a Frame prop. Empty text omits the description in this example.",
    type: "ReactNode (FrameDescription children)",
  },
  fit: {
    control: {
      initialValue: false,
      kind: "boolean",
      label: "Fit panels to content",
    },
    defaultValue: "false",
    description:
      "FramePanel only: disables flex growth. Visible when the frame has spare height; the playground uses a minimum height.",
    type: "boolean",
  },
  ref: {
    defaultValue: "Not set",
    description:
      "Each part forwards its React 19 ref to its native element: div, header, h3, p or footer.",
    type: "Ref<HTMLElement> (element-specific)",
  },
  spacing: {
    control: {
      initialValue: "default" as NonNullable<FrameProps["spacing"]>,
      kind: "select",
      label: "Spacing",
      options: ["sm", "default", "lg"],
    },
    defaultValue: '"default"',
    description:
      "Frame: panel padding and header/footer horizontal padding (12/16/24px); outer inset and gap (2/4/8px).",
    type: '"sm" | "default" | "lg"',
  },
  stacked: {
    control: { initialValue: false, kind: "boolean", label: "Stacked panels" },
    defaultValue: "false",
    description:
      "Frame: removes gaps and joins adjacent direct FramePanel siblings with one border. Wrappers interrupt joining.",
    type: "boolean",
  },
  title: {
    control: { initialValue: "Workspace", kind: "text", label: "Title" },
    defaultValue: "Not set",
    description:
      "Demo content for FrameTitle children, not a Frame prop. FrameTitle renders an h3.",
    type: "ReactNode (FrameTitle children)",
  },
  variant: {
    control: {
      initialValue: "default" as NonNullable<FrameProps["variant"]>,
      kind: "select",
      label: "Variant",
      options: ["default", "ghost"],
    },
    defaultValue: '"default"',
    description:
      "Frame: ghost removes only the outer border, preserving the muted surface and panel borders.",
    type: '"default" | "ghost"',
  },
} satisfies Record<string, PropDefinition>;

export const getFrameDefaults = () => getPlaygroundDefaults(frameProps);
export type FramePlaygroundValues = ReturnType<typeof getFrameDefaults>;

export const getFrameCode = (
  values: FramePlaygroundValues
) => `import { Frame, FrameHeader, FrameTitle, FrameDescription, FramePanel, FrameFooter } from "@/components/ui/frame";

export const FrameDemo = () => (
  <Frame className="min-h-80 w-full max-w-md" variant=${JSON.stringify(values.variant)} spacing=${JSON.stringify(values.spacing)} stacked={${values.stacked}} dense={${values.dense}}>
    <FrameHeader>
      <FrameTitle>{${JSON.stringify(values.title)}}</FrameTitle>
      ${values.description ? `<FrameDescription>{${JSON.stringify(values.description)}}</FrameDescription>` : ""}
    </FrameHeader>
    <FramePanel fit={${values.fit}}>
      <h4 className="text-sm font-medium">Deployment</h4>
      <p className="text-sm text-muted-foreground">Production is up to date.</p>
    </FramePanel>
    <FramePanel fit={${values.fit}}>
      <h4 className="text-sm font-medium">Preview</h4>
      <p className="text-sm text-muted-foreground">Changes are ready for review.</p>
    </FramePanel>
    <FrameFooter>Last synced just now</FrameFooter>
  </Frame>
);`;
