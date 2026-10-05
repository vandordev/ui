import type { Meta, StoryObj } from "@storybook/react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./empty";

const meta = {
  argTypes: {
    description: { control: "text" },
    outline: { control: "boolean" },
    showAction: { control: "boolean" },
    showMedia: { control: "boolean" },
    title: { control: "text" },
    variant: { control: "select", options: ["default", "icon"] },
  },
  args: {
    description: "Create your first project to get started.",
    outline: false,
    showAction: true,
    showMedia: true,
    title: "No projects yet",
    variant: "icon" as "default" | "icon",
  },
  parameters: { layout: "centered" },
  render: ({ description, outline, showAction, showMedia, title, variant }) => (
    <Empty className={outline ? "border" : undefined}>
      <EmptyHeader>
        {showMedia && (
          <EmptyMedia variant={variant}>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3Z" />
            </svg>
          </EmptyMedia>
        )}
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {showAction && (
        <EmptyContent>
          <a
            href="https://ui.shadcn.com/docs/components/base/empty"
            className="rounded-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4"
          >
            Composition guide
          </a>
        </EmptyContent>
      )}
    </Empty>
  ),
  title: "Vandor UI/Empty",
} satisfies Meta<{
  description: string;
  outline: boolean;
  showAction: boolean;
  showMedia: boolean;
  title: string;
  variant: "default" | "icon";
}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Outline: Story = { args: { outline: true } };
export const WithoutMedia: Story = {
  args: { showAction: false, showMedia: false },
};
export const LongContent: Story = {
  args: {
    description:
      "Try a broader search term, check the selected workspace, or remove filters to find projects created by other members of your team.",
    outline: true,
    title: "No results in this workspace or its archived projects",
  },
};
export const CustomMedia: Story = {
  argTypes: { showMedia: { control: false }, variant: { control: false } },
  render: ({ title, description, outline, showAction }) => (
    <Empty className={outline ? "border" : undefined}>
      <EmptyHeader>
        <EmptyMedia>
          <span
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-full bg-muted text-sm font-medium"
          >
            UI
          </span>
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {showAction && (
        <EmptyContent>
          <a
            href="https://ui.shadcn.com/docs/components/base/empty"
            className="rounded-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4"
          >
            Composition guide
          </a>
        </EmptyContent>
      )}
    </Empty>
  ),
};
