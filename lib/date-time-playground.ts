import type { PropDefinition } from "@/lib/playground";
import { getPlaygroundDefaults } from "@/lib/playground";

export const dateTimeProps = {
  display: {
    control: {
      initialValue: "date-time",
      kind: "select",
      label: "Display",
      options: ["date-time", "date", "time"],
    },
    defaultValue: "Playground only",
    description: "Playground preset mapping to the format prop.",
    type: '"date-time" | "date" | "time"',
  },
  fallback: {
    control: { initialValue: "—", kind: "text", label: "Fallback" },
    defaultValue: '"—"',
    description: "Text for invalid or absent input.",
    type: "string",
  },
  format: {
    defaultValue: "Numeric day/year, short month, two-digit 24-hour time",
    description:
      "Replaces default Intl options; explicit timeZone overrides format.timeZone.",
    type: "Intl.DateTimeFormatOptions",
  },
  locale: {
    control: {
      initialValue: "en-US",
      kind: "select",
      label: "Locale",
      options: ["en-US", "id-ID", "fr-FR"],
    },
    defaultValue: '"en-US"',
    description: "Intl locale.",
    type: "string | string[]",
  },
  timeZone: {
    control: {
      initialValue: "",
      kind: "select",
      label: "Timezone",
      options: ["", "UTC", "Asia/Jakarta", "America/New_York"],
    },
    defaultValue: "Browser timezone after hydration",
    description:
      "Explicit timezone override. Empty playground option uses the browser timezone.",
    type: "string",
  },
  value: {
    control: {
      initialValue: "2026-10-24T08:00:00Z",
      kind: "text",
      label: "Instant",
    },
    defaultValue: "Required",
    description:
      "Strict ISO instant with an explicit timezone, valid Date, epoch milliseconds, null or undefined. Playground accepts text.",
    type: "DateInput",
  },
} satisfies Record<string, PropDefinition>;

export const getDateTimeDefaults = () => getPlaygroundDefaults(dateTimeProps);
export type DateTimePlaygroundValues = ReturnType<typeof getDateTimeDefaults>;

export const getDateTimeFormat = (
  display: DateTimePlaygroundValues["display"]
): Intl.DateTimeFormatOptions | undefined => {
  if (display === "date") {
    return { dateStyle: "medium" };
  }
  if (display === "time") {
    return { hour: "numeric", minute: "2-digit" };
  }
};

export const getDateTimeCode = (values: DateTimePlaygroundValues) => {
  const format = getDateTimeFormat(values.display);
  return `import { DateTime } from "@/components/date-time";

export const DateTimeDemo = () => (
    <DateTime value={${JSON.stringify(values.value)}} locale={${JSON.stringify(values.locale)}}${values.timeZone ? ` timeZone={${JSON.stringify(values.timeZone)}}` : ""}${format ? ` format={${JSON.stringify(format)}}` : ""} fallback={${JSON.stringify(values.fallback)}} />
);`;
};
