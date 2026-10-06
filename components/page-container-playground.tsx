"use client";

import { ComponentPlayground } from "@/components/component-playground";
import {
  getPageContainerCode,
  getPageContainerDefaults,
  pageContainerProps,
} from "@/lib/page-container-playground";
import type { PageContainerPlaygroundValues } from "@/lib/page-container-playground";
import { PageContainer } from "@/registry/new-york/page-container";

export const PageContainerPreview = ({
  values,
}: {
  values: PageContainerPlaygroundValues;
}) => (
  <PageContainer size={values.size}>
    <div className="bg-muted py-8 text-sm text-foreground">
      {values.children}
    </div>
  </PageContainer>
);

export const PageContainerPlayground = () => (
  <ComponentPlayground
    title="PageContainer"
    definitions={pageContainerProps}
    initialValues={getPageContainerDefaults()}
    getCode={getPageContainerCode}
    renderPreview={(values) => <PageContainerPreview values={values} />}
    hint="Widths are capped by the preview area. Larger sizes can look identical here; the muted content area shows the horizontal gutters, not a built-in surface."
  />
);
