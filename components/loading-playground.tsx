"use client";

import { ComponentPlayground } from "@/components/component-playground";
import {
  getLoadingCode,
  getLoadingDefaults,
  loadingProps,
} from "@/lib/loading-playground";
import { Loading } from "@/registry/new-york/loading";

export const LoadingPlayground = () => (
  <ComponentPlayground
    title="Loading"
    definitions={loadingProps}
    initialValues={getLoadingDefaults()}
    getCode={getLoadingCode}
    hint="All 47 upstream variants are available. Reduced-motion preferences show a static indicator instead of looping animation."
    renderPreview={(values) => (
      <Loading variant={values.variant} size={values.size} text={values.text} />
    )}
  />
);
