"use client";

// Match the framework-independent native link emitted by the code generator.
/* eslint-disable @next/next/no-html-link-for-pages */

import { ComponentPlayground } from "@/components/component-playground";
import {
  getPageHeaderCode,
  getPageHeaderDefaults,
  getPageHeaderPreviewProps,
  pageHeaderPlaygroundDefinitions,
} from "@/lib/page-header-playground";
import type { PageHeaderPlaygroundValues } from "@/lib/page-header-playground";
import { PageHeader } from "@/registry/new-york/page-header";

export const PageHeaderPreview = ({
  values,
}: {
  values: PageHeaderPlaygroundValues;
}) => (
  <PageHeader
    {...getPageHeaderPreviewProps(values)}
    actions={
      values.showActions ? (
        <a
          href="/projects/new"
          className="inline-flex min-h-9 items-center rounded-md border border-border px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Create project
        </a>
      ) : undefined
    }
  />
);

export const PageHeaderPlayground = () => (
  <ComponentPlayground
    title="PageHeader"
    definitions={pageHeaderPlaygroundDefinitions}
    initialValues={getPageHeaderDefaults()}
    getCode={getPageHeaderCode}
    renderPreview={(values) => (
      <div className="w-full min-w-0">
        <PageHeaderPreview values={values} />
      </div>
    )}
    hint="Breadcrumb and status controls use plain text. Supply your own navigation or badge in an app. Create project is a sample link; replace /projects/new with your route. Show actions changes demo composition, not a public prop."
  />
);
