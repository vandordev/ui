import { Dialog as PrimitiveDialog } from "@base-ui/react/dialog";
import type { Meta, StoryObj } from "@storybook/react";
import { CopyIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useState } from "react";

import {
  Dropdown,
  DropdownRoot,
  DropdownTrigger,
  DropdownContent,
  DropdownGroup,
  DropdownLabel,
  DropdownCheckboxItem,
  DropdownRadioGroup,
  DropdownRadioItem,
  DropdownSeparator,
} from "./dropdown";
import type { DropdownOverlayProps } from "./dropdown";

const buttonClass =
  "rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 disabled:opacity-50";
interface StoryArgs {
  animated: boolean;
  disabled: boolean;
  label: string;
  side: "bottom" | "top" | "left" | "right";
  align: "start" | "center" | "end";
  submenu: boolean;
  shortcuts: boolean;
}
const StoryDropdown = ({
  animated,
  disabled,
  label,
  side,
  align,
  submenu,
  shortcuts,
}: StoryArgs) => {
  const [selected, setSelected] = useState("None");
  return (
    <div className="flex flex-col items-center gap-4">
      <Dropdown
        animated={animated}
        disabled={disabled}
        contentProps={{ align, side }}
        trigger={
          <button type="button" className={buttonClass}>
            {label}
          </button>
        }
        items={[
          {
            icon: PencilIcon,
            id: "edit",
            label: "Edit",
            onSelect: () => setSelected("Edit"),
            shortcut: shortcuts ? "⌘E" : undefined,
          },
          {
            icon: CopyIcon,
            id: "copy",
            label: "Duplicate",
            onSelect: () => setSelected("Duplicate"),
          },
          ...(submenu
            ? [
                {
                  id: "share",
                  items: [
                    {
                      id: "team",
                      label: "Team",
                      onSelect: () => setSelected("Team"),
                    },
                    { disabled: true, id: "public", label: "Public link" },
                  ],
                  label: "Share with",
                  type: "submenu" as const,
                },
              ]
            : []),
          { id: "divider", type: "separator" },
          {
            icon: TrashIcon,
            id: "delete",
            label: "Delete",
            onSelect: () => setSelected("Delete"),
            variant: "destructive",
          },
        ]}
      />
      <p role="status" className="text-sm text-muted-foreground">
        Last action: {selected}
      </p>
    </div>
  );
};
const meta = {
  argTypes: {
    align: { control: "select", options: ["start", "center", "end"] },
    animated: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
    shortcuts: { control: "boolean" },
    side: { control: "select", options: ["bottom", "top", "left", "right"] },
    submenu: { control: "boolean" },
  },
  args: {
    align: "start",
    animated: true,
    disabled: false,
    label: "Actions",
    shortcuts: true,
    side: "bottom",
    submenu: true,
  },
  parameters: { layout: "centered" },
  render: (args) => <StoryDropdown {...args} />,
  title: "Vandor UI/Dropdown",
} satisfies Meta<StoryArgs>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const WithoutMotion: Story = { args: { animated: false } };
export const LongLabel: Story = {
  args: { label: "Actions for the shared workspace project" },
};
const fixedControls = {
  align: { control: false as const },
  label: { control: false as const },
  shortcuts: { control: false as const },
  submenu: { control: false as const },
};
const Settings = ({ animated, disabled, side }: StoryArgs) => {
  const [checked, setChecked] = useState(true);
  const [sort, setSort] = useState("name");
  return (
    <DropdownRoot disabled={disabled}>
      <DropdownTrigger className={buttonClass}>View settings</DropdownTrigger>
      <DropdownContent animated={animated} side={side}>
        <DropdownGroup>
          <DropdownLabel>Layout</DropdownLabel>
          <DropdownCheckboxItem checked={checked} onCheckedChange={setChecked}>
            Show sidebar
          </DropdownCheckboxItem>
        </DropdownGroup>
        <DropdownSeparator />
        <DropdownGroup>
          <DropdownLabel>Sort by</DropdownLabel>
          <DropdownRadioGroup value={sort} onValueChange={setSort}>
            <DropdownRadioItem value="name" closeOnClick={false}>
              Name
            </DropdownRadioItem>
            <DropdownRadioItem value="date" closeOnClick={false}>
              Date modified
            </DropdownRadioItem>
          </DropdownRadioGroup>
        </DropdownGroup>
      </DropdownContent>
    </DropdownRoot>
  );
};
export const CompoundSettings: Story = {
  argTypes: fixedControls,
  render: (args) => <Settings {...args} />,
};
const ControlledMenu = ({
  animated,
  disabled,
  side,
  align,
  label,
}: StoryArgs) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col items-center gap-4">
      <Dropdown
        animated={animated}
        disabled={disabled}
        open={open}
        onOpenChange={setOpen}
        contentProps={{ align, side }}
        trigger={
          <button type="button" className={buttonClass}>
            {label}
          </button>
        }
        items={[{ closeOnSelect: false, id: "action", label: "Keep open" }]}
      />
      <p role="status" className="text-sm text-muted-foreground">
        Menu {open ? "open" : "closed"}
      </p>
    </div>
  );
};
export const Controlled: Story = {
  argTypes: { shortcuts: { control: false }, submenu: { control: false } },
  render: (args) => <ControlledMenu {...args} />,
};
export const IconOnly: Story = {
  argTypes: { ...fixedControls, side: { control: false } },
  render: ({ animated, disabled }) => (
    <Dropdown
      animated={animated}
      disabled={disabled}
      trigger={
        <button
          type="button"
          aria-label="More project actions"
          className={buttonClass}
        >
          ⋯
        </button>
      }
      items={[{ icon: PencilIcon, id: "edit", label: "Edit" }]}
    />
  ),
};

const AsyncMenu = ({ animated, disabled, side, align }: StoryArgs) => {
  const [fail, setFail] = useState(false);
  const [status, setStatus] = useState("No request sent.");
  return (
    <div className="flex flex-col items-center gap-4">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={fail}
          onChange={(event) => setFail(event.target.checked)}
        />
        Simulate failure
      </label>
      <Dropdown
        animated={animated}
        disabled={disabled}
        contentProps={{ side, align }}
        trigger={
          <button type="button" className={buttonClass}>
            Account actions
          </button>
        }
        items={[
          {
            id: "profile",
            label: "View profile",
            onSelect: () => setStatus("Profile selected."),
          },
          {
            id: "logout",
            label: "Logout (simulation)",
            variant: "destructive",
            closeOnSelect: "success",
            onSelect: async () => {
              setStatus("Sending simulated request…");
              // eslint-disable-next-line promise/avoid-new
              await new Promise<void>((resolve) => setTimeout(resolve, 800));
              if (fail) {
                throw new Error("Request failed. Try again.");
              }
              setStatus("Simulated logout succeeded.");
            },
            onSelectError: (error) =>
              setStatus(
                error instanceof Error ? error.message : "Request failed."
              ),
          },
        ]}
      />
      <p role="status" className="text-sm text-muted-foreground">
        {status}
      </p>
    </div>
  );
};
export const AsyncActions: Story = {
  argTypes: {
    ...fixedControls,
    align: { control: "select", options: ["start", "center", "end"] },
  },
  render: (args) => <AsyncMenu {...args} />,
};
export const Links: Story = {
  argTypes: {
    ...fixedControls,
    align: { control: "select", options: ["start", "center", "end"] },
  },
  render: ({ animated, disabled, side, align }) => (
    <Dropdown
      animated={animated}
      disabled={disabled}
      contentProps={{ side, align }}
      trigger={
        <button type="button" className={buttonClass}>
          Resources
        </button>
      }
      items={[
        {
          id: "base-ui",
          label: "Base UI documentation",
          link: (
            <a
              href="https://base-ui.com/react/components/menu"
              target="_blank"
              rel="noreferrer"
            />
          ),
        },
      ]}
    />
  ),
};

// Use the declared Base UI dependency so the optional stories item does not
// require installing or overwrite the consumer's Dialog component.
const StoryOverlay = ({
  open,
  onOpenChange,
  finalFocus,
}: DropdownOverlayProps) => (
  <PrimitiveDialog.Root open={open} onOpenChange={onOpenChange}>
    <PrimitiveDialog.Portal>
      <PrimitiveDialog.Backdrop className="fixed inset-0 bg-foreground/20" />
      <PrimitiveDialog.Popup
        finalFocus={finalFocus}
        className="fixed top-1/2 left-1/2 flex w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-lg border border-border bg-background p-6 text-foreground"
      >
        <PrimitiveDialog.Title className="text-base font-medium">
          Project details
        </PrimitiveDialog.Title>
        <PrimitiveDialog.Description className="text-sm text-muted-foreground">
          This component is outside the menu popup. Close it to return to the
          trigger.
        </PrimitiveDialog.Description>
        <PrimitiveDialog.Close className={buttonClass}>
          Close details
        </PrimitiveDialog.Close>
      </PrimitiveDialog.Popup>
    </PrimitiveDialog.Portal>
  </PrimitiveDialog.Root>
);
export const ComponentOverlay: Story = {
  argTypes: {
    ...fixedControls,
    align: { control: "select", options: ["start", "center", "end"] },
  },
  render: ({ animated, disabled, side, align }) => (
    <Dropdown
      animated={animated}
      disabled={disabled}
      contentProps={{ side, align }}
      trigger={
        <button type="button" className={buttonClass}>
          Project actions
        </button>
      }
      items={[
        {
          id: "details",
          label: "Project details",
          renderOverlay: (props) => <StoryOverlay {...props} />,
        },
      ]}
    />
  ),
};
