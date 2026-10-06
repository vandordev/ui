// Stories use deterministic delayed operations rather than a network service.
/* eslint-disable avoid-new */
import type { Meta, StoryObj } from "@storybook/react";

import { ToastProvider, Toaster, toast } from "./toast";
import type { ToastPosition } from "./toast";

const ToastStory = ({
  position,
  title,
  description,
  status,
  action,
  duration,
}: {
  position: ToastPosition;
  title: string;
  description: string;
  status: "success" | "error" | "warning" | "info" | "loading";
  action: boolean;
  duration: number;
}) => (
  <ToastProvider>
    <Toaster position={position} />
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className="rounded-md border px-3 py-2 text-sm"
        onClick={() =>
          toast[status](title, {
            description: description || undefined,
            duration: duration < 0 ? undefined : duration,
            ...(action
              ? {
                  actionLabel: "Undo",
                  actionOnClick: () => toast.success("Restored"),
                }
              : {}),
          })
        }
      >
        Show configured notification
      </button>
      <button
        className="rounded-md border px-3 py-2 text-sm"
        onClick={() => toast.success("Changes saved")}
      >
        Title
      </button>
      <button
        className="rounded-md border px-3 py-2 text-sm"
        onClick={() =>
          toast.info("New comment", {
            description: "Mina mentioned you in the project discussion.",
          })
        }
      >
        Description
      </button>
      <button
        className="rounded-md border px-3 py-2 text-sm"
        onClick={() =>
          toast.action("Draft deleted", {
            actionLabel: "Undo",
            actionOnClick: () => toast.success("Draft restored"),
            description: "The draft can still be restored.",
          })
        }
      >
        Action
      </button>
      <button
        className="rounded-md border px-3 py-2 text-sm"
        onClick={() => {
          for (let index = 1; index <= 8; index += 1) {
            toast.info(`Queued notification ${index}`, {
              description: "This notification waits for presentation.",
            });
          }
        }}
      >
        Burst
      </button>
    </div>
  </ToastProvider>
);

const meta = {
  argTypes: {
    action: { control: "boolean" },
    description: { control: "text" },
    duration: {
      control: "number",
      description: "-1 uses defaults; 0 persists.",
    },
    position: {
      control: "select",
      options: [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
    },
    status: {
      control: "select",
      options: ["success", "error", "warning", "info", "loading"],
    },
    title: { control: "text" },
  },
  args: {
    action: false,
    description: "",
    duration: -1,
    position: "top-right",
    status: "success",
    title: "Changes saved",
  },
  component: ToastStory,
  parameters: { layout: "centered" },
  title: "Vandor UI/Toast",
} satisfies Meta<typeof ToastStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Detailed: Story = {
  args: { description: "Your project settings are ready for the team." },
};
export const Error: Story = {
  args: {
    description: "Please try again in a moment.",
    status: "error",
    title: "Could not save",
  },
};
export const Warning: Story = {
  args: { status: "warning", title: "Storage almost full" },
};
export const Loading: Story = { args: { status: "loading", title: "Saving…" } };
export const Action: Story = {
  args: {
    action: true,
    description: "You can restore the draft.",
    title: "Draft deleted",
  },
};
export const LongContent: Story = {
  args: {
    description:
      "Averylongunbrokentextvaluewithoutspacesmustnotcausehorizontaloverflowinthepageorhidetheclosecontrol.",
    title:
      "A longer notification title that must stay readable on a narrow viewport",
  },
};

export const PromiseOutcome: Story = {
  argTypes: {
    action: { control: false },
    description: { control: false },
    duration: { control: false },
    position: { control: false },
    status: { control: false },
    title: { control: false },
  },
  render: () => (
    <ToastProvider>
      <Toaster />
      <button
        className="rounded-md border px-3 py-2 text-sm"
        onClick={() =>
          toast.promise(
            new Promise((resolve) => {
              window.setTimeout(resolve, 900);
            }),
            {
              error: "Could not publish",
              loading: "Publishing…",
              success: "Published",
            }
          )
        }
      >
        Publish
      </button>
    </ToastProvider>
  ),
};
