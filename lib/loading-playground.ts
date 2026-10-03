import type { PropDefinition } from "@/lib/playground";
import { getPlaygroundDefaults } from "@/lib/playground";
import { loadingVariants } from "@/registry/new-york/loading-variants";
import type { LoadingVariant } from "@/registry/new-york/loading-variants";

// Keep the primary playground controls first, like the Button playground.
// eslint-disable-next-line sort-keys
export const loadingProps = {
  variant: {
    control: {
      initialValue: "arc" as LoadingVariant,
      kind: "select",
      label: "Variant",
      options: loadingVariants,
    },
    defaultValue: '"arc"',
    description:
      "Select any of the 47 loading-ui components. Names match the upstream registry.",
    type: "LoadingVariant",
  },
  "aria-label": {
    defaultValue: '"Loading"',
    description:
      "Accessible status name. Translate or customize for the current operation. Decorative use can set aria-hidden on the wrapper.",
    type: "string",
  },
  className: {
    defaultValue: "Not set",
    description:
      "Layout and inherited color classes on the wrapper. Use variantProps.className to style the visual itself.",
    type: "string",
  },
  duration: {
    defaultValue: "Upstream default",
    description:
      "CSS animation cycle in seconds, via --duration. Fixed Motion and SVG SMIL timings are unchanged. For text shimmer, bobbing dots, and pulsating dots, use variantProps.duration.",
    type: "number",
  },
  size: {
    control: {
      initialValue: 32 as number,
      kind: "range",
      label: "Size (px)",
      max: 64,
      min: 12,
      step: 1,
    },
    defaultValue: "24",
    description:
      "Base visual size. Text and glyph variants use this as font size; skeleton and eyes use proportional dimensions. The playground starts at 32px.",
    type: "number | string",
  },
  text: {
    control: {
      initialValue: "Loading" as string,
      kind: "text",
      label: "Text (text variants)",
    },
    defaultValue: '"Loading"',
    description:
      "Visible content for text-blink, text-dots, text-shimmer, and text-shimmer-wave.",
    type: "string",
  },
  variantProps: {
    defaultValue: "Not set",
    description:
      "Typed upstream props for the selected variant, including dots, bars, prompt, glyphs, eye scales, colors, className, and style. Children are supplied through text; refs belong to the wrapper.",
    type: "Props of selected loading-ui component",
  },
} satisfies Record<string, PropDefinition>;

export const getLoadingDefaults = () => getPlaygroundDefaults(loadingProps);
export type LoadingPlaygroundValues = ReturnType<typeof getLoadingDefaults>;

export const getLoadingCode = (values: LoadingPlaygroundValues) => {
  const textProp = values.variant.startsWith("text-")
    ? ` text={${JSON.stringify(values.text)}}`
    : "";
  return `import { Loading } from "@/components/ui/loading";\n\nexport function Demo() {\n  return <Loading variant="${values.variant}" size={${values.size}}${textProp} />;\n}`;
};
