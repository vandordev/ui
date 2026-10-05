import { happy, idle, thinking, wink } from "blobatar/expression";

import type { PropDefinition } from "@/lib/playground";
import { getPlaygroundDefaults } from "@/lib/playground";
import type { BlobatarProps } from "@/registry/new-york/blobatar";

export const blobatarProps = {
  alt: {
    defaultValue: '""',
    description:
      "Accessible name shared by photo and fallback. Empty means decorative; pass a label when the avatar stands alone.",
    type: "string",
  },
  blobatar: {
    defaultValue: "Not set",
    description:
      "Appearance options: animate, expression, background, hue, tone, traits, palette, normalize, and contrast. size and title are owned by the wrapper's size and alt props.",
    type: "BlobatarAppearance",
  },
  "blobatar.animate": {
    control: {
      initialValue: "off" as "off" | "hover" | "always",
      kind: "select",
      label: "Animation",
      options: ["off", "hover", "always"],
    },
    defaultValue: "false",
    description:
      "Opt-in inline SVG motion. Follow pointer overrides this to always. Requires blobatar/motion.css and respects reduced motion.",
    type: 'false | "hover" | "always"',
  },
  "blobatar.background": {
    control: {
      initialValue: "circle" as "none" | "circle" | "square" | "squircle",
      kind: "select",
      label: "Background",
      options: ["none", "circle", "square", "squircle"],
    },
    defaultValue: '"circle"',
    description:
      "Full-frame circle by default, matching a photo. Choose none for the upstream transparent silhouette.",
    type: 'false | "circle" | "square" | "squircle"',
  },
  "blobatar.expression": {
    control: {
      initialValue: "idle" as "idle" | "happy" | "wink" | "thinking",
      kind: "select",
      label: "Expression",
      options: ["idle", "happy", "wink", "thinking"],
    },
    defaultValue: "idle",
    description:
      "Expression value imported from blobatar/expression, not a string. The playground shows four of fourteen upstream poses.",
    type: "Expression",
  },
  className: {
    defaultValue: "Not set",
    description:
      "Merged classes on the outer span. Use style to override its pixel dimensions.",
    type: "string",
  },
  followPointer: {
    control: {
      initialValue: false as boolean,
      kind: "boolean",
      label: "Follow pointer",
    },
    defaultValue: "false",
    description:
      "Eyes follow a fine mouse pointer. Forces inline SVG with always motion; requires motion.css and gaze.css. Inert on touch and under reduced motion.",
    type: "boolean",
  },
  name: {
    control: { initialValue: "vandor" as string, kind: "text", label: "Name" },
    defaultValue: "Required",
    description:
      "Stable identity for local generation. NFC-normalized, trimmed, and lowercased by default.",
    type: "string",
  },
  pointerTravel: {
    control: {
      enabledBy: "followPointer",
      initialValue: 3 as number,
      kind: "range",
      label: "Eye travel",
      max: 4,
      min: 1,
      step: 0.5,
    },
    defaultValue: "3",
    description:
      "Eye movement range in SVG viewBox units. Only used when followPointer is enabled.",
    type: "number",
  },
  size: {
    control: {
      initialValue: 64 as number,
      kind: "range",
      label: "Size (px)",
      max: 128,
      min: 24,
      step: 1,
    },
    defaultValue: "40",
    description:
      "Wrapper width and height in pixels. Explicit style overrides these dimensions; the playground starts at 64px.",
    type: "number",
  },
  src: {
    control: {
      initialValue: "" as string,
      kind: "text",
      label: "Photo URL (optional)",
    },
    defaultValue: "Not set",
    description:
      "Profile photo URL. Loading, missing, and failed photos show the generated fallback.",
    type: "string",
  },
  style: {
    defaultValue: "Not set",
    description:
      "Outer span styles, applied after size. Native span attributes, events, and ref are supported; children are not.",
    type: "CSSProperties",
  },
} satisfies Record<string, PropDefinition>;

// Composition is a documentation scenario, not a prop of the registry component.
export const blobatarPlaygroundProps = {
  composition: {
    control: {
      initialValue: "standalone" as
        | "standalone"
        | "popover"
        | "dropdown"
        | "dialog"
        | "drawer",
      kind: "select",
      label: "Composition",
      options: ["standalone", "popover", "dropdown", "dialog", "drawer"],
    },
    defaultValue: '"standalone"',
    description:
      "Preview scenario only. Overlay components are installed separately.",
    type: "Playground scenario",
  },
  ...blobatarProps,
} satisfies Record<string, PropDefinition>;

export const getBlobatarDefaults = () =>
  getPlaygroundDefaults(blobatarPlaygroundProps);
export type BlobatarPlaygroundValues = ReturnType<typeof getBlobatarDefaults>;
const expressions = { happy, idle, thinking, wink };

export const getBlobatarPreviewProps = (
  values: BlobatarPlaygroundValues
): BlobatarProps => ({
  alt: values.name,
  blobatar: {
    animate:
      values["blobatar.animate"] === "off" ? false : values["blobatar.animate"],
    background:
      values["blobatar.background"] === "none"
        ? false
        : values["blobatar.background"],
    expression: expressions[values["blobatar.expression"]],
  },
  followPointer: values.followPointer,
  name: values.name,
  pointerTravel: values.pointerTravel,
  size: values.size,
  src: values.src || undefined,
});

export const getBlobatarCode = (values: BlobatarPlaygroundValues) => {
  const expression = values["blobatar.expression"];
  const animate = values["blobatar.animate"];
  const background = values["blobatar.background"];
  const options = [
    ...(animate === "off" ? [] : [`animate: ${JSON.stringify(animate)}`]),
    ...(background === "circle"
      ? []
      : [
          `background: ${background === "none" ? "false" : JSON.stringify(background)}`,
        ]),
    ...(expression === "idle" ? [] : [`expression: ${expression}`]),
  ];
  const avatar = `<Blobatar\n      name={${JSON.stringify(values.name)}}\n      alt={${values.composition === "standalone" ? JSON.stringify(values.name) : '""'}}\n      size={${values.size}}${values.followPointer ? `\n      followPointer\n      pointerTravel={${values.pointerTravel}}` : ""}${values.src ? `\n      src={${JSON.stringify(values.src)}}` : ""}${options.length ? `\n      blobatar={{ ${options.join(", ")} }}` : ""}\n    />`;
  const imports = `"use client";\n\nimport { Blobatar } from "@/components/ui/blobatar";${expression === "idle" ? "" : `\nimport { ${expression} } from "blobatar/expression";`}${animate !== "off" || expression === "thinking" || values.followPointer ? '\nimport "blobatar/motion.css";' : ""}${values.followPointer ? '\nimport "blobatar/gaze.css";' : ""}`;
  const name = JSON.stringify(values.name);
  const profile = `<p className="break-words font-medium">{${name}}</p>\n      <p className="text-sm text-muted-foreground">Product designer</p>\n      <p className="mt-3 text-sm text-muted-foreground">Building thoughtful interfaces with Vandor UI.</p>`;
  const labels = {
    dialog: "profile dialog",
    drawer: "profile drawer",
    dropdown: "account menu",
    popover: "profile",
  };
  const { composition } = values;
  if (composition === "standalone") {
    return `${imports}\n\nexport function Demo() {\n  return (\n    ${avatar}\n  );\n}`;
  }
  const button = `<button type="button" aria-label={${JSON.stringify(`Open ${labels[composition]} for ${values.name}`)}} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">${avatar}</button>`;
  if (composition === "popover") {
    return `${imports}\nimport { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";\n\nexport function Demo() {\n  return (\n    <Popover>\n      <PopoverTrigger render={${button}} />\n      <PopoverContent className="w-64 max-w-[calc(100vw-2rem)]">${profile}</PopoverContent>\n    </Popover>\n  );\n}`;
  }
  if (composition === "dropdown") {
    return `${imports}\nimport { useState } from "react";\nimport { Dropdown } from "@/components/ui/dropdown";\n\nexport function Demo() {\n  const [status, setStatus] = useState("Available");\n  return (\n    <div className="flex flex-col items-center gap-3">\n      <Dropdown\n        trigger={${button}}\n        items={[{ id: "status", type: "group", label: "Set status", items: [\n          { id: "available", label: "Available", onSelect: () => setStatus("Available") },\n          { id: "busy", label: "Busy", onSelect: () => setStatus("Busy") },\n          { id: "away", label: "Away", onSelect: () => setStatus("Away") },\n        ] }]}\n      />\n      <p role="status" className="text-sm text-muted-foreground">{status}</p>\n    </div>\n  );\n}`;
  }
  const overlay = composition === "dialog" ? "Dialog" : "Drawer";
  const description =
    composition === "dialog"
      ? "A closer look at this team member."
      : "Keep this team member's details close by.";
  return `${imports}\nimport { ${overlay}, ${overlay}Body } from "@/components/ui/${composition}";\n\nexport function Demo() {\n  return (\n    <${overlay} title="Profile details" description=${JSON.stringify(description)} trigger={${button}}>\n      <${overlay}Body${composition === "drawer" ? ' className="pt-5"' : ""}>${profile}</${overlay}Body>\n    </${overlay}>\n  );\n}`;
};
