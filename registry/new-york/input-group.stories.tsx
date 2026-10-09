import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import type { InputProps } from "./input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "./input-group";

type GroupArgs = Pick<
  InputProps,
  | "label"
  | "labelStyle"
  | "placeholder"
  | "defaultValue"
  | "disabled"
  | "readOnly"
  | "aria-invalid"
> & {
  align: "inline-start" | "inline-end" | "block-start" | "block-end";
  addon: string;
};
const meta = {
  argTypes: {
    addon: { control: "text" },
    align: {
      control: "select",
      options: ["inline-start", "inline-end", "block-start", "block-end"],
    },
    "aria-invalid": { control: "boolean" },
    defaultValue: { control: "text" },
    disabled: { control: "boolean" },
    label: { control: "text" },
    labelStyle: { control: "select", options: ["floating", "static"] },
    placeholder: { control: "text" },
    readOnly: { control: "boolean" },
  },
  args: {
    addon: "https://",
    align: "inline-start",
    "aria-invalid": false,
    defaultValue: "",
    disabled: false,
    label: "Website",
    labelStyle: "floating",
    placeholder: "example.com",
    readOnly: false,
  },
  component: InputGroup,
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "Controls configure InputGroupInput and InputGroupAddon, not the native div root. Compound examples also cover buttons and textareas.",
      },
    },
    layout: "padded",
  },
  render: ({ addon, align, ...args }) => (
    <InputGroup>
      <InputGroupAddon align={align}>
        <InputGroupText>{addon}</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput key={String(args.defaultValue)} {...args} />
    </InputGroup>
  ),
  tags: ["autodocs"],
  title: "Vandor UI/Input Group",
} satisfies Meta<GroupArgs>;
export default meta;
type Story = StoryObj<GroupArgs>;
export const Playground: Story = {};
export const Suffix: Story = {
  args: {
    addon: "@example.com",
    align: "inline-end",
    label: "Username",
    placeholder: "alex",
  },
};
export const BlockStart: Story = {
  args: { addon: "Public profile", align: "block-start" },
};
export const BlockEnd: Story = {
  args: { addon: "Visible to everyone", align: "block-end" },
};
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = {
  args: { defaultValue: "example.com", readOnly: true },
};
export const Invalid: Story = { args: { "aria-invalid": true } };
const SearchAction = ({
  addon: _addon,
  align,
  defaultValue,
  ...args
}: GroupArgs) => {
  const [query, setQuery] = useState(String(defaultValue ?? ""));
  const [submitted, setSubmitted] = useState<string | null>(null);
  return (
    <div className="grid gap-2">
      <InputGroup>
        <InputGroupInput
          {...args}
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
        />
        <InputGroupAddon align={align}>
          <InputGroupButton
            disabled={args.disabled}
            onClick={() => setSubmitted(query)}
          >
            Search
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <p role="status" className="text-xs text-muted-foreground">
        {submitted === null
          ? "Local demo, no network request."
          : `Submitted: ${submitted || "empty"}`}
      </p>
    </div>
  );
};
export const WithAction: Story = {
  argTypes: { addon: { control: false }, defaultValue: { control: false } },
  args: {
    align: "inline-end",
    label: "Search",
    placeholder: "Search components",
  },
  render: (args) => <SearchAction {...args} />,
};
export const Textarea: Story = {
  argTypes: { labelStyle: { control: false } },
  args: {
    addon: "Markdown supported",
    align: "block-end",
    label: "Message",
    placeholder: "Write a message…",
  },
  render: ({ addon, align, label, labelStyle: _labelStyle, ...args }) => (
    <InputGroup>
      <InputGroupTextarea
        key={String(args.defaultValue)}
        {...args}
        aria-label={label}
      />
      <InputGroupAddon align={align}>
        <InputGroupText>{addon}</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
};
