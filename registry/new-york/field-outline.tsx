import { cn } from "cn";
import type { ReactNode } from "react";

/** Accessible visual outline shared by labeled registry field triggers. */
export const FieldOutline = ({
  children,
  label,
  labelId,
  raised = false,
  staticLabel = false,
  className,
  htmlFor,
}: {
  children: ReactNode;
  label: string;
  labelId: string;
  raised?: boolean;
  staticLabel?: boolean;
  className?: string;
  htmlFor?: string;
}) => (
  <div
    className={cn("group/outline relative min-w-0", className)}
    data-field-outline=""
    data-raised={raised || staticLabel || undefined}
  >
    {label &&
      (staticLabel ? (
        <label
          htmlFor={htmlFor}
          id={labelId}
          className="mb-1.5 block text-sm font-medium"
        >
          {label}
        </label>
      ) : (
        <>
          <label
            id={labelId}
            htmlFor={htmlFor}
            data-floating={raised}
            className={cn(
              "pointer-events-none absolute z-10 max-w-[calc(100%-1rem)] -translate-y-1/2 truncate px-1 text-muted-foreground transition-[top,font-size] duration-150 motion-reduce:transition-none",
              raised
                ? "top-0 left-3 text-xs"
                : "top-1/2 left-3 text-sm group-focus-within/outline:top-0 group-focus-within/outline:text-xs"
            )}
          >
            {label}
          </label>
          <fieldset
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-1.5 bottom-0 min-w-0 rounded-md border border-input px-2 group-focus-within/outline:border-ring group-has-[[aria-invalid=true]]/outline:border-destructive group-has-[:disabled]/outline:opacity-50"
          >
            <legend
              className={cn(
                "invisible block h-3 max-w-0 overflow-hidden whitespace-nowrap p-0 text-xs leading-3 transition-[max-width] duration-150 group-focus-within/outline:max-w-full motion-reduce:transition-none",
                raised && "max-w-full"
              )}
            >
              <span className="px-1">{label}</span>
            </legend>
          </fieldset>
        </>
      ))}
    {children}
  </div>
);
