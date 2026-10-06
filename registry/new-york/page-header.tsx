import { cn } from "cn";
import type { ComponentProps, ReactNode } from "react";

export type PageHeaderProps = Omit<
  ComponentProps<"header">,
  "title" | "children"
> & {
  title: string;
  description?: ReactNode;
  breadcrumb?: ReactNode;
  status?: ReactNode;
  actions?: ReactNode;
};

const hasContent = (value: ReactNode) =>
  value !== null &&
  value !== undefined &&
  typeof value !== "boolean" &&
  value !== "";

export const PageHeader = ({
  title,
  description,
  breadcrumb,
  status,
  actions,
  className,
  ...props
}: PageHeaderProps) => (
  <header
    data-slot="page-header"
    className={cn(
      "flex min-w-0 flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between md:gap-6",
      className
    )}
    {...props}
  >
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      {hasContent(breadcrumb) ? (
        <div
          data-slot="page-header-breadcrumb"
          className="min-w-0 text-sm text-muted-foreground"
        >
          {breadcrumb}
        </div>
      ) : null}
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <h1 className="min-w-0 text-2xl font-semibold tracking-tight wrap-break-word">
          {title}
        </h1>
        {hasContent(status) ? (
          <div data-slot="page-header-status" className="min-w-0 text-sm">
            {status}
          </div>
        ) : null}
      </div>
      {hasContent(description) ? (
        <div
          data-slot="page-header-description"
          className="max-w-[65ch] text-sm leading-relaxed text-muted-foreground wrap-break-word"
        >
          {description}
        </div>
      ) : null}
    </div>
    {hasContent(actions) ? (
      <div
        data-slot="page-header-actions"
        className="flex min-w-0 max-w-full flex-wrap items-center gap-2 md:justify-end"
      >
        {actions}
      </div>
    ) : null}
  </header>
);
