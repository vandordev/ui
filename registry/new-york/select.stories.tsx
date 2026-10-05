import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { Select } from "./select";

const data = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { disabled: true, label: "Unavailable", value: "unavailable" },
];
const StorySelect = ({
  size,
  disabled,
  animated,
  placeholder,
}: {
  size: "sm" | "default";
  disabled: boolean;
  animated: boolean;
  placeholder: string;
}) => (
  <Select
    data={data}
    size={size}
    disabled={disabled}
    animated={animated}
    placeholder={placeholder}
    aria-label="Fruit"
    className="w-56"
  />
);
const meta = {
  argTypes: {
    animated: { control: "boolean" },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
    size: { control: "select", options: ["sm", "default"] },
  },
  args: {
    animated: true,
    disabled: false,
    placeholder: "Choose a fruit",
    size: "default",
  },
  component: StorySelect,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Vandor UI/Select",
} satisfies Meta<typeof StorySelect>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Small: Story = { args: { size: "sm" } };
export const Disabled: Story = { args: { disabled: true } };
export const WithoutMotion: Story = { args: { animated: false } };
export const Grouped: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Select
      data={[
        { items: data, label: "Fruit" },
        { items: [{ label: "Carrot", value: "carrot" }], label: "Vegetables" },
      ]}
      aria-label="Produce"
      placeholder="Choose produce"
      className="w-56"
    />
  ),
};
export const Multiple: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Select
      data={data}
      multiple
      defaultValue={["apple"]}
      aria-label="Fruits"
      className="w-56"
    />
  ),
};
export const Invalid: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-2">
      <Select
        data={data}
        aria-label="Fruit"
        aria-invalid="true"
        aria-describedby="fruit-error"
        placeholder="Choose a fruit"
        className="w-56"
      />
      <p id="fruit-error" className="text-sm text-destructive">
        Choose a fruit to continue.
      </p>
    </div>
  ),
};
const ControlledExample = () => {
  const [value, setValue] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-3">
      <Select
        data={data}
        value={value}
        onValueChange={setValue}
        aria-label="Fruit"
        placeholder="Choose a fruit"
        className="w-56"
      />
      <output>Selected: {value ?? "None"}</output>
    </div>
  );
};
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledExample />,
};
