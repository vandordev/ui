import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { TextArea } from "./textarea";
import type { TextAreaProps } from "./textarea";

const meta = {
  argTypes: {
    "aria-invalid": { control: "boolean" },
    defaultValue: { control: "text" },
    disabled: { control: "boolean" },
    label: { control: "text" },
    maxLength: { control: { min: 1, type: "number" } },
    onChange: { control: false },
    placeholder: { control: "text" },
    readOnly: { control: "boolean" },
    rows: { control: { max: 12, min: 2, type: "number" } },
    value: { control: false },
  },
  args: {
    "aria-invalid": false,
    defaultValue: "",
    disabled: false,
    label: "Message",
    placeholder: "Write your message…",
    readOnly: false,
    rows: 4,
  },
  component: TextArea,
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "padded" },
  render: (args) => <TextArea key={String(args.defaultValue)} {...args} />,
  tags: ["autodocs"],
  title: "Vandor UI/TextArea",
} satisfies Meta<typeof TextArea>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Populated: Story = {
  args: {
    defaultValue: "A short update about the project.\nReady for review.",
  },
};
export const Disabled: Story = {
  args: { defaultValue: "Editing is unavailable.", disabled: true },
};
export const ReadOnly: Story = {
  args: { defaultValue: "This message is read-only.", readOnly: true },
};
export const Invalid: Story = {
  args: { "aria-describedby": "message-error", "aria-invalid": true },
  render: (args) => (
    <div className="grid gap-2">
      <TextArea {...args} />
      <p id="message-error" className="text-sm text-destructive">
        A message is required.
      </p>
    </div>
  ),
};
const CountedField = ({
  defaultValue,
  onChange,
  value: _value,
  ...args
}: TextAreaProps) => {
  const [value, setValue] = useState(String(defaultValue ?? ""));
  return (
    <div className="grid gap-2">
      <TextArea
        {...args}
        value={value}
        onChange={(event) => {
          setValue(event.currentTarget.value);
          onChange?.(event);
        }}
      />
      <output className="text-xs text-muted-foreground">
        {value.length} / {args.maxLength} characters
      </output>
    </div>
  );
};
export const CharacterCount: Story = {
  argTypes: { defaultValue: { control: false } },
  args: { maxLength: 200 },
  render: (args) => <CountedField {...args} />,
};
