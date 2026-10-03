import type { ComponentProps } from "react";

const AspectRatio = ({
  ratio = 1,
  style,
  ...props
}: ComponentProps<"div"> & { ratio?: number }) => (
  <div
    data-slot="aspect-ratio"
    style={{ aspectRatio: ratio, ...style }}
    {...props}
  />
);

export { AspectRatio };
