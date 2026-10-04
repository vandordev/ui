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
  <div
    className="mt-6 min-w-0 overflow-hidden rounded-lg border"
    data-slot="component-preview"
  >
    <div
      data-slot="component-preview-demo"
      className="flex min-h-56 min-w-0 items-center justify-center overflow-x-auto p-6 sm:p-8 [&>div]:max-w-full"
    >
      {children}
    </div>
    <div data-slot="component-preview-source" className="min-w-0 border-t">
      <ComponentSource
        name={name}
        src={src}
        title={title}
        className="flow-root mt-0! mx-0! [&_figure]:m-0! [&_figure]:rounded-none! [&_figcaption]:pr-36 [&>div:last-child]:bottom-0 [&>div:last-child]:rounded-none [&_[data-slot=code-expand-navigation]]:group-data-[state=closed]/collapsible:hidden"
        expandLabel="Expand code"
        collapseLabel="Collapse code"
      />
    </div>
  </div>
);
