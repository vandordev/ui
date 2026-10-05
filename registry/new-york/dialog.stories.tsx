import type { Meta, StoryObj } from "@storybook/react";
import { useId, useRef, useState } from "react";

import { Dialog, DialogBody, DialogFooter, useDialogControl } from "./dialog";
import type { DialogContentProps } from "./dialog";

const buttonClass =
  "inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const StoryDialog = ({
  title,
  description,
  size,
  showCloseButton,
  keepMounted,
  modal,
  longContent,
}: {
  title: string;
  description: string;
  size: DialogContentProps["size"];
  showCloseButton: boolean;
  keepMounted: boolean;
  modal: boolean;
  longContent: boolean;
}) => (
  <Dialog
    title={title}
    description={description || undefined}
    trigger={
      <button type="button" className={buttonClass}>
        Open dialog
      </button>
    }
    modal={modal}
    contentProps={{ keepMounted, showCloseButton, size }}
  >
    {({ close }) => (
      <>
        <DialogBody>
          {longContent
            ? Array.from({ length: 30 }, (_, index) => (
                <p className="mb-4" key={index}>
                  Setting {index + 1}: Configure your project preferences.
                </p>
              ))
            : "Your settings form"}
        </DialogBody>
        <DialogFooter>
          <button className={buttonClass} type="button" onClick={close}>
            Done
          </button>
        </DialogFooter>
      </>
    )}
  </Dialog>
);
const meta = {
  argTypes: {
    description: { control: "text" },
    keepMounted: { control: "boolean" },
    longContent: { control: "boolean" },
    modal: { control: "boolean" },
    showCloseButton: { control: "boolean" },
    size: { control: "select", options: ["sm", "md", "lg", "xl"] },
    title: { control: "text" },
  },
  args: {
    description: "Manage project preferences.",
    keepMounted: false,
    longContent: false,
    modal: true,
    showCloseButton: true,
    size: "md",
    title: "Project settings",
  },
  component: StoryDialog,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Vandor UI/Dialog",
} satisfies Meta<typeof StoryDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const LongContent: Story = { args: { longContent: true, size: "lg" } };
export const WithoutCloseButton: Story = { args: { showCloseButton: false } };
export const NonModal: Story = { args: { modal: false } };
export const PersistentContent: Story = { args: { keepMounted: true } };

const ExternalExample = () => {
  const control = useDialogControl();
  const opener = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        className={buttonClass}
        ref={opener}
        type="button"
        onClick={control.open}
      >
        Open externally
      </button>
      <Dialog
        control={control}
        title="External control"
        contentProps={{ finalFocus: opener }}
      >
        <DialogBody>Focus returns to the external opener.</DialogBody>
        <DialogFooter>
          <button className={buttonClass} type="button" onClick={control.close}>
            Done
          </button>
        </DialogFooter>
      </Dialog>
    </>
  );
};
export const ExternalControl: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ExternalExample />,
};

const FormExample = () => {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <Dialog
      title="Edit project"
      trigger={
        <button className={buttonClass} type="button">
          Edit
        </button>
      }
      open={open}
      onOpenChange={setOpen}
    >
      {({ close }) => (
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            close();
          }}
        >
          <DialogBody className="flex flex-col gap-2">
            <label htmlFor={id}>Project name</label>
            <input
              id={id}
              name="name"
              defaultValue="Vandor UI"
              required
              className="h-9 rounded-md border border-input bg-background px-3"
            />
          </DialogBody>
          <DialogFooter>
            <button className={buttonClass} type="button" onClick={close}>
              Cancel
            </button>
            <button className={buttonClass} type="submit">
              Submit demo
            </button>
          </DialogFooter>
        </form>
      )}
    </Dialog>
  );
};
export const ControlledForm: Story = {
  parameters: { controls: { disable: true } },
  render: () => <FormExample />,
};
export const Nested: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Dialog
      title="Outer dialog"
      trigger={
        <button className={buttonClass} type="button">
          Open outer
        </button>
      }
    >
      <DialogBody>
        <Dialog
          title="Inner dialog"
          trigger={
            <button className={buttonClass} type="button">
              Open inner
            </button>
          }
        >
          <DialogBody>Escape closes the topmost dialog.</DialogBody>
        </Dialog>
      </DialogBody>
    </Dialog>
  ),
};
export const CustomHeader: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Dialog
      title="Project settings"
      description="Header composition"
      trigger={
        <button className={buttonClass} type="button">
          Open custom header
        </button>
      }
      renderHeader={({ title, description }) => (
        <>
          {description}
          {title}
        </>
      )}
    >
      <DialogBody>Semantic elements retain their associations.</DialogBody>
    </Dialog>
  ),
};
