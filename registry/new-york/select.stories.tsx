import { Drawer as PrimitiveDrawer } from "@base-ui/react/drawer";
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
  label,
  labelStyle,
}: {
  size: "sm" | "default";
  disabled: boolean;
  animated: boolean;
  placeholder: string;
  label: string;
  labelStyle: "floating" | "static";
}) => (
  <Select
    data={data}
    size={size}
    disabled={disabled}
    animated={animated}
    placeholder={placeholder}
    label={label}
    labelStyle={labelStyle}
    aria-label={label ? undefined : "Fruit"}
    className="w-56"
  />
);
const meta = {
  argTypes: {
    animated: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
    labelStyle: { control: "select", options: ["floating", "static"] },
    placeholder: { control: "text" },
    size: { control: "select", options: ["sm", "default"] },
  },
  args: {
    animated: true,
    disabled: false,
    label: "Fruit",
    labelStyle: "floating",
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
export const StaticLabel: Story = { args: { labelStyle: "static" } };
export const Unlabeled: Story = { args: { label: "" } };
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

const DrawerExample = () => (
  <div className="min-h-[200vh]">
    <PrimitiveDrawer.Root>
      <PrimitiveDrawer.Trigger
        render={
          <button
            type="button"
            className="rounded-md border px-3 py-2 text-sm"
          />
        }
      >
        Open selection drawer
      </PrimitiveDrawer.Trigger>
      <PrimitiveDrawer.Portal>
        <PrimitiveDrawer.Backdrop className="fixed inset-0 bg-foreground/20" />
        <PrimitiveDrawer.Viewport className="fixed inset-0 flex items-end justify-center">
          <PrimitiveDrawer.Popup className="flex w-full max-w-lg flex-col gap-4 rounded-t-lg border border-border bg-background p-6 text-foreground">
            <PrimitiveDrawer.Title className="text-base font-medium">
              Choose fruit
            </PrimitiveDrawer.Title>
            <PrimitiveDrawer.Description className="text-sm text-muted-foreground">
              Select a fruit, then close the drawer.
            </PrimitiveDrawer.Description>
            <ControlledExample />
            <PrimitiveDrawer.Close className="rounded-md border px-3 py-2 text-sm">
              Close drawer
            </PrimitiveDrawer.Close>
          </PrimitiveDrawer.Popup>
        </PrimitiveDrawer.Viewport>
      </PrimitiveDrawer.Portal>
    </PrimitiveDrawer.Root>
  </div>
);

export const InsideDrawer: Story = {
  parameters: { controls: { disable: true } },
  render: () => <DrawerExample />,
};
