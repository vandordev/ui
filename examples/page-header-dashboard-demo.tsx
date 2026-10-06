import Link from "next/link";

import { PageContainer } from "@/registry/new-york/page-container";
import { PageHeader } from "@/registry/new-york/page-header";

export const PageHeaderDashboardDemo = () => (
  <PageContainer className="flex flex-col gap-6">
    <PageHeader
      title="Projects"
      description="Manage access and review your active projects."
      breadcrumb={
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/workspace" className="underline underline-offset-4">
                Workspace
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Projects</li>
          </ol>
        </nav>
      }
      status={
        <span className="rounded-md bg-muted px-2 py-1 text-xs">3 active</span>
      }
      actions={
        <>
          <Link
            href="/projects/export"
            className="inline-flex min-h-9 items-center rounded-md border border-border px-3 text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Export
          </Link>
          <Link
            href="/projects/new"
            className="inline-flex min-h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Create project
          </Link>
        </>
      }
    />
    <p className="text-sm text-muted-foreground">
      Your project list belongs here, outside the header.
    </p>
  </PageContainer>
);
