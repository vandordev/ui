import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import {
  ErrorState,
  ErrorStateActions,
  ErrorStateContent,
  ErrorStateDescription,
  ErrorStateDetails,
  ErrorStateHeader,
  ErrorStateMedia,
  ErrorStateTitle,
} from "./error-state";

interface Args {
  border: "none" | "solid" | "dashed";
  variant: "centered" | "inline";
  title: string;
  description: string;
  showMedia: boolean;
  showAction: boolean;
  showDetails: boolean;
}

const StoryContent = ({
  border,
  variant,
  title,
  description,
  showMedia,
  showAction,
  showDetails,
}: Args) => {
  const [recovered, setRecovered] = useState(false);
  const actionClass =
    "min-h-9 rounded-md border bg-background px-3 text-sm font-medium hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4";
  if (recovered) {
    return (
      <div className="flex flex-col items-center gap-3">
        <p role="status">Preview recovered.</p>
        <button
          type="button"
          className={actionClass}
          onClick={() => setRecovered(false)}
        >
          Show error again
        </button>
      </div>
    );
  }
  return (
    <ErrorState variant={variant} border={border}>
      {showMedia && (
        <ErrorStateMedia>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v6m0 3v1" />
          </svg>
        </ErrorStateMedia>
      )}
      <ErrorStateContent>
        <ErrorStateHeader>
          <ErrorStateTitle>{title}</ErrorStateTitle>
          <ErrorStateDescription>{description}</ErrorStateDescription>
        </ErrorStateHeader>
        {showAction && (
          <ErrorStateActions>
            <button
              type="button"
              className={actionClass}
              onClick={() => setRecovered(true)}
            >
              Try again
            </button>
          </ErrorStateActions>
        )}
        {showDetails && (
          <ErrorStateDetails>Reference: DEMO-1042</ErrorStateDetails>
        )}
      </ErrorStateContent>
    </ErrorState>
  );
};

const meta = {
  argTypes: {
    border: { control: "select", options: ["none", "solid", "dashed"] },
    description: { control: "text" },
    showAction: { control: "boolean" },
    showDetails: { control: "boolean" },
    showMedia: { control: "boolean" },
    title: { control: "text" },
    variant: { control: "select", options: ["centered", "inline"] },
  },
  args: {
    border: "none",
    description: "Check your connection and try again.",
    showAction: true,
    showDetails: false,
    showMedia: true,
    title: "Unable to load projects",
    variant: "centered",
  },
  parameters: { layout: "centered" },
  render: (args) => <StoryContent {...args} />,
  title: "Vandor UI/Error State",
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Inline: Story = { args: { variant: "inline" } };
export const DashedBorder: Story = {
  args: { border: "dashed", showDetails: true },
};
export const SolidBorder: Story = { args: { border: "solid" } };
export const WithSupportDetails: Story = { args: { showDetails: true } };
export const WithoutMedia: Story = { args: { showMedia: false } };
export const AccessRequired: Story = {
  args: {
    description:
      "Ask your workspace administrator to grant access to this project.",
    showAction: false,
    title: "Access permissions needed",
  },
};
export const LongContent: Story = {
  args: {
    description:
      "Your other workspaces are still available. Check your connection before trying again, or contact your workspace administrator with the support reference below.",
    showDetails: true,
    title:
      "Unable to retrieve the latest changes for this workspace and its archived projects",
    variant: "inline",
  },
};
