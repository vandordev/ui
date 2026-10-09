import type { PropDefinition } from "@/lib/playground";
import { getPlaygroundDefaults } from "@/lib/playground";
import type {
  BoringAvatarProps,
  BoringAvatarVariant,
} from "@/registry/new-york/boring-avatar";

export const boringAvatarPalettes = {
  cool: ["#CADFE8", "#376A86", "#8297BE", "#715C91", "#345F58"],
  warm: ["#F2D7B6", "#B55A30", "#E8A652", "#783F51", "#42665E"],
};

export const boringAvatarProps = {
  alt: {
    control: {
      initialValue: "Vandor" as string,
      kind: "text",
      label: "Accessible label",
    },
    defaultValue: '""',
    description:
      "Accessible label for photo and fallback. Empty makes the avatar decorative.",
    type: "string",
  },
  className: {
    defaultValue: "Not set",
    description:
      "Merged classes on the outer span, with no default background, border, or shadow.",
    type: "string",
  },
  colors: {
    control: {
      initialValue: "default" as "default" | "warm" | "cool",
      kind: "select",
      label: "Palette",
      options: ["default", "warm", "cool"],
    },
    defaultValue: "Upstream five-color palette",
    description:
      "Custom non-empty hexadecimal palette. Empty arrays use the upstream defaults. Playground offers default, warm, and cool presets.",
    type: "string[]",
  },
  name: {
    control: { initialValue: "vandor" as string, kind: "text", label: "Name" },
    defaultValue: "Required",
    description:
      "Stable, case-sensitive identity. Generated locally without a network request or normalization.",
    type: "string",
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
      "Outer width and height in pixels. Explicit style overrides size; preview starts at 64px.",
    type: "number",
  },
  square: {
    control: {
      initialValue: false as boolean,
      kind: "boolean",
      label: "Square",
    },
    defaultValue: "false",
    description:
      "Use square clipping for both SVG fallback and photo instead of a circle.",
    type: "boolean",
  },
  src: {
    control: {
      initialValue: "" as string,
      kind: "text",
      label: "Photo URL (optional)",
    },
    defaultValue: "Not set",
    description:
      "Optional photo URL. Loading, missing, and failed photos show the generated fallback.",
    type: "string",
  },
  style: {
    defaultValue: "Not set",
    description:
      "Outer span styles, applied after size. Native span attributes, event handlers, and React 19 refs are supported; children are not.",
    type: "CSSProperties",
  },
  variant: {
    control: {
      initialValue: "beam" as BoringAvatarVariant,
      kind: "select",
      label: "Variant",
      options: ["beam", "marble", "pixel", "sunset", "ring", "bauhaus"],
    },
    defaultValue: '"beam"',
    description:
      "Original Boring Avatars artwork. The wrapper adds no background; SVG color fields remain part of each variant.",
    type: '"beam" | "marble" | "pixel" | "sunset" | "ring" | "bauhaus"',
  },
} satisfies Record<string, PropDefinition>;

export const getBoringAvatarDefaults = () =>
  getPlaygroundDefaults(boringAvatarProps);
export type BoringAvatarPlaygroundValues = ReturnType<
  typeof getBoringAvatarDefaults
>;
export const getBoringAvatarPreviewProps = (
  values: BoringAvatarPlaygroundValues
): BoringAvatarProps => ({
  alt: values.alt,
  colors:
    values.colors === "default"
      ? undefined
      : boringAvatarPalettes[values.colors],
  name: values.name,
  size: values.size,
  square: values.square,
  src: values.src || undefined,
  variant: values.variant,
});

export const getBoringAvatarCode = (values: BoringAvatarPlaygroundValues) => {
  const props = getBoringAvatarPreviewProps(values);
  const attributes = Object.entries(props)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `      ${key}={${JSON.stringify(value)}}`)
    .join("\n");
  return `import { BoringAvatar } from "@/components/ui/boring-avatar";\n\nexport function Demo() {\n  return (\n    <BoringAvatar\n${attributes}\n    />\n  );\n}`;
};
