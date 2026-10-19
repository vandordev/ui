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
    hint="Padding is equal on every side. Capped sizes can add extra horizontal space from centering; use full for equal edge insets. The muted content area is not a built-in surface."
  />
);
