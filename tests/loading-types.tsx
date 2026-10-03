import { Loading } from "@/registry/new-york/loading";
import type { LoadingProps } from "@/registry/new-york/loading";
import type { LoadingVariant } from "@/registry/new-york/loading-variants";

// Compiled by the repository typecheck, including the negative API contracts.
export const validLoadingProps: LoadingProps = {
  variant: "terminal",
  variantProps: { prompt: "$" },
};

export const loadingTypeExamples = (variant: LoadingVariant) => [
  <Loading key="default" />,
  <Loading key="dynamic" variant={variant} />,
  <Loading key="terminal" {...validLoadingProps} />,
  <Loading
    key="text"
    variant="text-shimmer-wave"
    text="Saving"
    variantProps={{ spread: 2 }}
  />,
  // @ts-expect-error A terminal prompt is not a ring option.
  <Loading key="invalid-props" variant="ring" variantProps={{ prompt: "$" }} />,
  // @ts-expect-error Unknown variants must be rejected.
  <Loading key="invalid-variant" variant="unknown-loader" />,
];
