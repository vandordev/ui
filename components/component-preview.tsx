import type { ReactNode } from "react";

import { ComponentSource } from "@/components/component-source";

export const ComponentPreview = ({
  name,
  src,
  title,
  children,
}: {
  name?: string;
  src?: string;
  title?: string;
  children?: ReactNode;
}) => (
  <div className="mt-6" data-slot="component-preview">
    {children}
    <ComponentSource
      name={name}
      src={src}
      title={title}
      className="flow-root"
    />
  </div>
);
