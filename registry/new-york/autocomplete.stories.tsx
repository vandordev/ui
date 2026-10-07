"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import {
  Autocomplete,
  AutocompleteRoot,
  AutocompleteInput,
  AutocompleteContent,
  AutocompleteList,
  AutocompleteItem,
} from "./autocomplete";

interface Controls {
  mode: "free-text" | "selection";
  multiple: boolean;
  label: string;
  placeholder: string;
  labelStyle: "static" | "floating";
  size: "default" | "sm";
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  clearable: boolean;
  showTrigger: boolean;
  animated: boolean;
  autoHighlight: boolean;
  loading: boolean;
  error: string;
  grouping: boolean;
}
const people = [
  {
    description: "Analytical engines",
    group: "Engineering",
    id: "ada",
    label: "Ada Lovelace",
  },
  {
    description: "Product systems",
    group: "Design",
    id: "bea",
    label: "Bea Chen",
  },
  {
    description: "Unavailable",
    disabled: true,
    group: "Engineering",
    id: "cam",
    label: "Cam Rivera",
  },
];
const StoryControl = ({ mode, multiple, grouping, ...args }: Controls) => {
  // Controls can change the committed value's type; remount that state boundary.
  const key = `${mode}:${multiple}`;
  const common = {
    ...args,
    className: "w-80 max-w-full",
    getItemLabel: (person: (typeof people)[number]) => person.label,
    getItemValue: (person: (typeof people)[number]) => person.id,
    groupBy: grouping
      ? (person: (typeof people)[number]) => person.group
      : undefined,
    inputProps: { "aria-label": args.label || "Person" },
    isItemDisabled: (person: (typeof people)[number]) =>
      Boolean(person.disabled),
    items: people,
  };
  if (mode === "selection") {
    return multiple ? (
      <Autocomplete key={key} {...common} mode="selection" multiple />
    ) : (
      <Autocomplete key={key} {...common} mode="selection" />
    );
  }
  return multiple ? (
    <Autocomplete key={key} {...common} multiple />
  ) : (
    <Autocomplete key={key} {...common} />
  );
};
const meta = {
  argTypes: {
    animated: { control: "boolean" },
    autoHighlight: { control: "boolean" },
    clearable: { control: "boolean" },
    disabled: { control: "boolean" },
    error: { control: "text" },
    grouping: { control: "boolean" },
    invalid: { control: "boolean" },
    label: { control: "text" },
    labelStyle: { control: "select", options: ["static", "floating"] },
    loading: { control: "boolean" },
    mode: { control: "select", options: ["free-text", "selection"] },
    multiple: { control: "boolean" },
    placeholder: { control: "text" },
    readOnly: { control: "boolean" },
    showTrigger: { control: "boolean" },
    size: { control: "select", options: ["default", "sm"] },
  },
  args: {
    animated: true,
    autoHighlight: false,
    clearable: false,
    disabled: false,
    error: "",
    grouping: false,
    invalid: false,
    label: "Person",
    labelStyle: "static",
    loading: false,
    mode: "free-text",
    multiple: false,
    placeholder: "Search or type",
    readOnly: false,
    showTrigger: false,
    size: "default",
  },
  component: StoryControl,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Vandor UI/Autocomplete",
} satisfies Meta<typeof StoryControl>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const FreeTextTags: Story = { args: { label: "Tags", multiple: true } };
export const SingleSelection: Story = {
  args: { mode: "selection", showTrigger: true },
};
export const MultipleSelection: Story = {
  args: { mode: "selection", multiple: true, showTrigger: true },
};
export const Grouped: Story = { args: { grouping: true, mode: "selection" } };
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true } };
export const Invalid: Story = { args: { invalid: true } };
export const Loading: Story = { args: { loading: true } };
export const Error: Story = { args: { error: "Suggestions unavailable." } };
export const FloatingLabel: Story = { args: { labelStyle: "floating" } };
const PaginationExample = ({
  label,
  disabled,
  readOnly,
}: Controls & { state?: "more" | "loading" | "error" }) => {
  const [error, setError] = useState(true);
  const [more, setMore] = useState(true);
  return (
    <Autocomplete
      label={label}
      disabled={disabled}
      readOnly={readOnly}
      items={people}
      mode="selection"
      getItemLabel={(person) => person.label}
      getItemValue={(person) => person.id}
      defaultOpen
      pagination={{
        hasNextPage: more,
        fetchingNextPage: false,
        error: error ? "Could not load the next page." : undefined,
        onLoadMore: () => setMore(false),
        onRetry: () => setError(false),
      }}
    />
  );
};
export const NextPageError: Story = {
  render: (args) => <PaginationExample {...args} />,
};
export const NextPageLoading: Story = {
  render: (args) => (
    <Autocomplete
      label={args.label}
      items={["Ada", "Grace"]}
      defaultOpen
      loadingProps={{ variant: "dots", size: 16 }}
      pagination={{
        hasNextPage: true,
        fetchingNextPage: true,
        onLoadMore: () => undefined,
      }}
    />
  ),
};
export const LoadMore: Story = {
  render: (args) => (
    <Autocomplete
      label={args.label}
      items={["Ada", "Grace"]}
      defaultOpen
      pagination={{
        hasNextPage: true,
        fetchingNextPage: false,
        onLoadMore: () => undefined,
      }}
    />
  ),
};
export const MinimumHint: Story = {
  render: (args) => (
    <Autocomplete
      label={args.label}
      items={[]}
      defaultOpen
      hintMessage="Enter at least two characters."
    />
  ),
};
export const BackgroundRefresh: Story = {
  render: (args) => (
    <Autocomplete
      label={args.label}
      items={["Ada", "Grace"]}
      defaultOpen
      backgroundLoading
      loadingProps={{ variant: "dots", size: 16 }}
    />
  ),
};
export const RichItems: Story = {
  argTypes: {
    grouping: { control: false },
    mode: { control: false },
    multiple: { control: false },
  },
  render: ({
    mode: _mode,
    multiple: _multiple,
    grouping: _grouping,
    ...args
  }) => (
    <Autocomplete
      {...args}
      mode="selection"
      className="w-80 max-w-full"
      items={people}
      getItemLabel={(person) => person.label}
      getItemValue={(person) => person.id}
      groupBy={(person) => person.group}
      renderItem={(person) => (
        <span className="grid">
          <span>{person.label}</span>
          <span className="text-xs text-muted-foreground">
            {person.description}
          </span>
        </span>
      )}
    />
  ),
};
export const LongContent: Story = {
  argTypes: {
    grouping: { control: false },
    mode: { control: false },
    multiple: { control: false },
  },
  render: ({
    mode: _mode,
    multiple: _multiple,
    grouping: _grouping,
    ...args
  }) => (
    <Autocomplete
      {...args}
      multiple
      className="w-56 max-w-full"
      items={["A very long label that stays inside a narrow field", "React"]}
      defaultValue={[
        "A very long label that stays inside a narrow field",
        "React",
      ]}
    />
  ),
};
const ControlledExample = ({ label, disabled }: Controls) => {
  const [value, setValue] = useState<(typeof people)[number] | null>(people[0]);
  const [query, setQuery] = useState(people[0].label);
  return (
    <div className="grid w-80 max-w-full gap-2">
      <Autocomplete
        mode="selection"
        items={people}
        getItemLabel={(person) => person.label}
        getItemValue={(person) => person.id}
        label={label}
        disabled={disabled}
        value={value}
        onValueChange={setValue}
        inputValue={query}
        onInputValueChange={setQuery}
        clearable
      />
      <output>
        {value?.id ?? "null"}: {query}
      </output>
    </div>
  );
};
export const Controlled: Story = {
  argTypes: Object.fromEntries(
    Object.keys(meta.args)
      .filter((name) => !["label", "disabled"].includes(name))
      .map((name) => [name, { control: false }])
  ),
  render: ControlledExample,
};
export const Composition: Story = {
  argTypes: Object.fromEntries(
    Object.keys(meta.args)
      .filter((name) => !["label", "disabled", "animated"].includes(name))
      .map((name) => [name, { control: false }])
  ),
  render: ({ label, disabled, animated }) => (
    <AutocompleteRoot
      items={["React", "Vue"]}
      disabled={disabled}
      animated={animated}
    >
      <AutocompleteInput aria-label={label} />
      <AutocompleteContent>
        <AutocompleteList>
          {["React", "Vue"].map((item) => (
            <AutocompleteItem key={item} value={item}>
              {item}
            </AutocompleteItem>
          ))}
        </AutocompleteList>
      </AutocompleteContent>
    </AutocompleteRoot>
  ),
};
