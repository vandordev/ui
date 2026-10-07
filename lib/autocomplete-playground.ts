import type { AutocompleteProps } from "../registry/new-york/autocomplete-types";
// The emitted value type mirrors the public four-way mode discriminator.
/* eslint-disable no-nested-ternary */
import type { PropDefinition } from "./playground";
import { getPlaygroundDefaults } from "./playground";

const booleanControl = (label: string, initialValue = false) => ({
  control: { initialValue, kind: "boolean" as const, label },
  defaultValue: String(initialValue),
  description: label,
  type: "boolean",
});
const textControl = (label: string, initialValue: string) => ({
  control: { initialValue, kind: "text" as const, label },
  defaultValue: "Not set",
  description: label,
  type: "string",
});
const selectControl = <Value extends string>(
  label: string,
  initialValue: Value,
  options: readonly NoInfer<Value>[]
) => ({
  control: { initialValue, kind: "select" as const, label, options },
  defaultValue: JSON.stringify(initialValue),
  description: label,
  type: options.map((option) => JSON.stringify(option)).join(" | "),
});
export const autocompleteProps = {
  animated: booleanControl("Animated", true),
  autoHighlight: booleanControl("Auto highlight"),
  className: {
    defaultValue: "Not set",
    description: "Convenience outer field container.",
    type: "string",
  },
  clearLabel: {
    defaultValue: '"Clear value"',
    description: "Accessible clear action name.",
    type: "string",
  },
  clearable: booleanControl("Clearable"),
  contentProps: {
    defaultValue: "bottom, start, offset 4",
    description:
      "Popup attributes/ref/class/style and positioning/collision options; excludes children/render.",
    type: "AutocompleteContentProps",
  },
  defaultInputValue: {
    defaultValue: "Selected label or empty",
    description: "Initial uncontrolled draft/query except single free text.",
    type: "string",
  },
  defaultOpen: {
    defaultValue: "false",
    description: "Initial popup state.",
    type: "boolean",
  },
  defaultValue: {
    defaultValue: "Mode-specific empty",
    description:
      "Initial uncontrolled committed value restored on native reset.",
    type: "Same as value",
  },
  disabled: booleanControl("Disabled"),
  emptyMessage: {
    defaultValue: '"No results found."',
    description: "Empty suggestion status.",
    type: "ReactNode",
  },
  error: {
    defaultValue: "Not set",
    description: "Suggestion error; takes precedence over loading and empty.",
    type: "ReactNode",
  },
  filter: {
    defaultValue: "Case/accent insensitive label matching",
    description: "null disables filtering for server results.",
    type: "((item: Item, query: string) => boolean) | null",
  },
  form: {
    defaultValue: "Nearest form",
    description: "External native form ID, including reset ownership.",
    type: "string",
  },
  getItemLabel: {
    defaultValue: "String item",
    description: "Required for objects; display and default filtering label.",
    type: "(item: Item) => string",
  },
  getItemValue: {
    defaultValue: "String item",
    description:
      "Required for objects; unique stable string identity and form value.",
    type: "(item: Item) => string",
  },
  groupBy: {
    defaultValue: "Not set",
    description:
      "Convenience assembly: first-seen group order, original order inside groups.",
    type: "(item: Item) => string",
  },
  grouping: booleanControl("Grouping"),
  inputProps: {
    defaultValue: "Not set",
    description:
      "Native input attributes, handlers, descriptions and ref; excludes managed state/form/type props.",
    type: "AutocompleteInputProps",
  },
  inputValue: {
    defaultValue: "Not set",
    description: "Controlled draft/query, forbidden for single free text.",
    type: "string",
  },
  invalid: booleanControl("Invalid"),
  isItemDisabled: {
    defaultValue: "Not set",
    description: "Disable an individual suggestion.",
    type: "(item: Item) => boolean",
  },
  items: {
    defaultValue: "Required",
    description:
      "Flat source collection. Strings work without accessors; objects require both accessors.",
    type: "readonly Item[]",
  },
  label: textControl("Label", "Framework"),
  labelStyle: selectControl("Label style", "static" as "static" | "floating", [
    "static",
    "floating",
  ]),
  loading: {
    defaultValue: "false",
    description:
      "Suppress stale result commits, preserve text editing and free-text creation.",
    type: "boolean",
  },
  loadingVariant: selectControl("Loading variant", "arc" as "arc" | "dots", ["arc", "dots"]),
  automaticPagination: booleanControl("Automatic pagination", true),
  hasNextPage: booleanControl("Has next page", true),
  loadingMessage: {
    defaultValue: '"Loading suggestions…"',
    description: "Loading suggestion status.",
    type: "ReactNode",
  },
  mode: selectControl("Mode", "free-text" as "free-text" | "selection", [
    "free-text",
    "selection",
  ]),
  multiple: booleanControl("Multiple"),
  name: {
    defaultValue: "Not set",
    description:
      "Committed form value, repeated entries for multiple; queries never submit.",
    type: "string",
  },
  onInputValueChange: {
    defaultValue: "Not set",
    description:
      "Query edits and cleanup requests; never changes committed values.",
    type: "(query: string) => void",
  },
  onOpenChange: {
    defaultValue: "Not set",
    description: "Popup change request.",
    type: "(open: boolean) => void",
  },
  onValueChange: {
    defaultValue: "Not set",
    description:
      "Real edits, commits, removals and clear; callback type follows literal mode/multiple.",
    type: "(value) => void",
  },
  open: {
    defaultValue: "Not set",
    description: "Controlled popup state.",
    type: "boolean",
  },
  placeholder: textControl("Placeholder", "Search frameworks"),
  readOnly: booleanControl("Read only"),
  ref: {
    defaultValue: "Not set",
    description: "Editable input, merged with inputProps.ref.",
    type: "Ref<HTMLInputElement>",
  },
  removeLabel: {
    defaultValue: '"Remove {label}"',
    description: "Accessible chip removal action name.",
    type: "(label: string) => string",
  },
  renderItem: {
    defaultValue: "Item label",
    description:
      "Convenience assembly: visual content only, not identity or filtering.",
    type: "(item: Item) => ReactNode",
  },
  required: {
    defaultValue: "false",
    description: "Requires committed value, not an uncommitted query.",
    type: "boolean",
  },
  scenario: selectControl(
    "Status scenario",
    "ready" as "ready" | "loading" | "error" | "empty" | "hint" | "background" | "more" | "page-loading" | "page-error" | "end",
    ["ready", "loading", "error", "empty", "hint", "background", "more", "page-loading", "page-error", "end"]
  ),
  showTrigger: {
    ...booleanControl("Show trigger"),
    defaultValue: "true in selection; false in free-text",
  },
  size: selectControl("Size", "default" as "default" | "sm", ["default", "sm"]),
  value: {
    defaultValue: "Mode-specific empty",
    description: "Committed value. Controlled state stays authoritative.",
    type: "string | string[] | Item | null | Item[]",
  },
} satisfies Record<string, PropDefinition>;
export const getAutocompleteDefaults = () =>
  getPlaygroundDefaults(autocompleteProps);
export type AutocompletePlaygroundValues = ReturnType<
  typeof getAutocompleteDefaults
>;
export const autocompleteItems = [
  { group: "Libraries", id: "react", label: "React" },
  { group: "Frameworks", id: "vue", label: "Vue" },
  { group: "Frameworks", id: "svelte", label: "Svelte" },
];
export type AutocompletePlaygroundItem = (typeof autocompleteItems)[number];

export const getAutocompletePreviewConfig = (
  values: AutocompletePlaygroundValues
): AutocompleteProps<AutocompletePlaygroundItem> => {
  const common = {
    animated: values.animated,
    autoHighlight: values.autoHighlight,
    className: "w-72 max-w-full",
    clearable: values.clearable,
    disabled: values.disabled,
    error:
      values.scenario === "error"
        ? "Suggestions unavailable. Try again later."
        : undefined,
    getItemLabel: (item: AutocompletePlaygroundItem) => item.label,
    getItemValue: (item: AutocompletePlaygroundItem) => item.id,
    groupBy: values.grouping
      ? (item: AutocompletePlaygroundItem) => item.group
      : undefined,
    inputProps: { "aria-label": values.label || "Framework" },
    invalid: values.invalid,
    items: values.scenario === "empty" ? [] : autocompleteItems,
    label: values.label,
    labelStyle: values.labelStyle,
    loading: values.scenario === "loading",
    loadingProps: { variant: values.loadingVariant, size: 16 },
    hintMessage: values.scenario === "hint" ? "Enter at least two characters." : undefined,
    backgroundLoading: values.scenario === "background",
    pagination: ["more", "page-loading", "page-error", "end"].includes(values.scenario) ? {
      hasNextPage: values.hasNextPage && values.scenario !== "end",
      fetchingNextPage: values.scenario === "page-loading",
      automatic: values.automaticPagination,
      error: values.scenario === "page-error" ? "Could not load more suggestions." : undefined,
      onLoadMore: () => undefined,
      onRetry: () => undefined,
    } : undefined,
    placeholder: values.placeholder,
    readOnly: values.readOnly,
    showTrigger: values.showTrigger,
    size: values.size,
  };
  if (values.mode === "selection") {
    return values.multiple
      ? { ...common, mode: "selection", multiple: true }
      : { ...common, mode: "selection", multiple: false };
  }
  return values.multiple
    ? { ...common, mode: "free-text", multiple: true }
    : { ...common, mode: "free-text", multiple: false };
};
export const getAutocompleteCode = (values: AutocompletePlaygroundValues) => {
  const config = getAutocompletePreviewConfig(values);
  const type =
    values.mode === "selection"
      ? values.multiple
        ? "Framework[]"
        : "Framework | null"
      : values.multiple
        ? "string[]"
        : "string";
  const empty = values.multiple
    ? "[]"
    : values.mode === "selection"
      ? "null"
      : '""';
  const query = values.mode === "selection" || values.multiple;
  const names = [
    "mode",
    "multiple",
    "label",
    "labelStyle",
    "placeholder",
    "size",
    "disabled",
    "readOnly",
    "invalid",
    "clearable",
    "showTrigger",
    "animated",
    "autoHighlight",
    "loading",
    "loadingProps",
    "hintMessage",
    "backgroundLoading",
    "error",
    "className",
  ] as const;
  const attributes = names
    .flatMap((key) =>
      config[key] === undefined
        ? []
        : [`      ${key}={${JSON.stringify(config[key])}}`]
    )
    .join("\n");
  return `"use client";

import { useState } from "react";
import { Autocomplete } from "@/components/autocomplete";

type Framework = { id: string; label: string; group: string };
const items: readonly Framework[] = ${JSON.stringify(config.items, null, 2)};

export function AutocompleteDemo() {
  const [value, setValue] = useState<${type}>(${empty});${query ? '\n  const [query, setQuery] = useState("");' : ""}
  return (
    <Autocomplete
      items={items}
      getItemLabel={(item) => item.label}
      getItemValue={(item) => item.id}
      value={value}
      onValueChange={setValue}${query ? "\n      inputValue={query}\n      onInputValueChange={setQuery}" : ""}
${attributes}${values.grouping ? "\n      groupBy={(item) => item.group}" : ""}${config.pagination ? `\n      pagination={{ ...${JSON.stringify(config.pagination)}, onLoadMore: () => undefined, onRetry: () => undefined }}` : ""}
      inputProps={{ "aria-label": ${JSON.stringify(values.label || "Framework")} }}
    />
  );
}`;
};
