import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { Drawer, DrawerBody, DrawerFooter } from "./drawer";
import type { DrawerProps } from "./drawer";

const buttonClass =
  "rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";
type Args = Pick<
  DrawerProps,
  "title" | "description" | "swipeDirection" | "modal" | "showSwipeHandle"
> & {
  keepMounted: boolean;
  showCloseButton: boolean;
  longContent: boolean;
  disabled: boolean;
};
const StoryDrawer = ({
  keepMounted,
  showCloseButton,
  longContent,
  disabled,
  ...props
}: Args) => (
  <div className="flex flex-col gap-3">
    <Drawer
      {...props}
      contentProps={{ keepMounted, showCloseButton }}
      trigger={
        <button className={buttonClass} type="button" disabled={disabled}>
          Open drawer
        </button>
      }
    >
      {({ close }) => (
        <>
          <DrawerBody>
            {longContent
              ? Array.from({ length: 30 }, (_, index) => (
                  <p className="mb-4" key={index}>
                    Setting {index + 1}: Configure project preferences.
                  </p>
                ))
              : "Your settings form"}
          </DrawerBody>
          <DrawerFooter>
            <button className={buttonClass} type="button" onClick={close}>
              Done
            </button>
          </DrawerFooter>
        </>
      )}
    </Drawer>
    <output>Sibling spacing stays unchanged.</output>
  </div>
);
const meta = {
  argTypes: {
    description: { control: "text" },
    disabled: { control: "boolean" },
    keepMounted: { control: "boolean" },
    longContent: { control: "boolean" },
    modal: { control: "select", options: [true, false, "trap-focus"] },
    showCloseButton: { control: "boolean" },
    showSwipeHandle: { control: "boolean" },
    swipeDirection: {
      control: "select",
      options: ["right", "left", "up", "down"],
    },
    title: { control: "text" },
  },
  args: {
    description: "Manage project preferences.",
    disabled: false,
    keepMounted: false,
    longContent: false,
    modal: true,
    showCloseButton: true,
    showSwipeHandle: false,
    swipeDirection: "right",
    title: "Project settings",
  },
  component: StoryDrawer,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Vandor UI/Drawer",
} satisfies Meta<typeof StoryDrawer>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const LongContent: Story = { args: { longContent: true } };
export const PersistentContent: Story = { args: { keepMounted: true } };
export const NonModal: Story = { args: { modal: false } };
export const Disabled: Story = { args: { disabled: true } };
export const SnapPoints: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Drawer
      title="Snap points"
      swipeDirection="down"
      snapPoints={[0.5, 0.9]}
      showSwipeHandle
      trigger={
        <button className={buttonClass} type="button">
          Open snap drawer
        </button>
      }
    >
      <DrawerBody>Swipe between half and full height.</DrawerBody>
    </Drawer>
  ),
};
export const Nested: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Drawer
      title="Parent drawer"
      trigger={
        <button className={buttonClass} type="button">
          Open parent
        </button>
      }
    >
      <DrawerBody>
        <Drawer
          title="Child drawer"
          trigger={
            <button className={buttonClass} type="button">
              Open child
            </button>
          }
        >
          <DrawerBody>
            The child escapes the parent panel while keeping its theme.
          </DrawerBody>
        </Drawer>
      </DrawerBody>
    </Drawer>
  ),
};
const ControlledExample = () => {
  const [open, setOpen] = useState(false);
  return (
    <Drawer
      title="Controlled drawer"
      open={open}
      onOpenChange={setOpen}
      trigger={
        <button className={buttonClass} type="button">
          Open controlled
        </button>
      }
    >
      <DrawerBody>Application-owned state.</DrawerBody>
      <DrawerFooter>
        <button
          className={buttonClass}
          type="button"
          onClick={() => setOpen(false)}
        >
          Done
        </button>
      </DrawerFooter>
    </Drawer>
  );
};
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledExample />,
};
