// Portable consumer stories must not require a Next.js router.
/* eslint-disable @next/next/no-html-link-for-pages */
import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps } from "react";

import { PageHeader } from "./page-header";

type StoryArgs = Omit<ComponentProps<typeof PageHeader>, "actions"> & {
  showActions: boolean;
};

const meta = {
  argTypes: {
    breadcrumb: { control: "text" },
    className: { control: "text" },
    description: { control: "text" },
    ref: { control: false },
    showActions: {
      control: "boolean",
      description: "Demo composition toggle, not a PageHeader prop.",
    },
    status: { control: "text" },
    title: { control: "text" },
  },
  args: {
    breadcrumb: "",
    description: "Manage your workspace projects.",
    showActions: true,
    status: "",
    title: "Projects",
  },
  component: PageHeader,
  parameters: { layout: "padded" },
  render: ({ showActions, ...args }) => (
    <PageHeader
      {...args}
      actions={
        showActions ? (
          <a
            href="/projects/new"
            className="inline-flex min-h-9 items-center rounded-md border border-border px-3 text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Create project
          </a>
        ) : undefined
      }
    />
  ),
  tags: ["autodocs"],
  title: "Vandor UI/PageHeader",
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Minimal: Story = { args: { description: "", showActions: false } };
export const WithBreadcrumb: Story = {
  argTypes: { breadcrumb: { control: false } },
  args: {
    breadcrumb: (
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap gap-2">
          <li>
            <a href="/workspace" className="underline underline-offset-4">
              Workspace
            </a>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">Projects</li>
        </ol>
      </nav>
    ),
  },
};
export const WithStatus: Story = {
  argTypes: { status: { control: false } },
  args: {
    status: <span className="rounded-md bg-muted px-2 py-1 text-xs">Live</span>,
  },
};
export const MultipleActions: Story = {
  argTypes: { showActions: { control: false } },
  render: ({ showActions: _showActions, ...args }) => (
    <PageHeader
      {...args}
      actions={
        <>
          <a
            href="/projects/export"
            className="inline-flex min-h-9 items-center px-3 text-sm underline underline-offset-4"
          >
            Export
          </a>
          <a
            href="/projects/new"
            className="inline-flex min-h-9 items-center rounded-md border border-border px-3 text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Create project
          </a>
        </>
      }
    />
  ),
};
export const LongContent: Story = {
  args: {
    description:
      "Review project ownership, member permissions, and configuration across the workspace. Supporting copy wraps without truncating important context.",
    status: "Pending review",
    title: "Workspace access and project configuration",
  },
};
