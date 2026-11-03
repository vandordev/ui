"use client";

import { cn } from "cn";
import type { ComponentProps } from "react";

import { useAutocomplete } from "./autocomplete-root";
import { Loading } from "./loading";

export const AutocompleteFeedback = ({
  children,
  className,
  ...props
}: ComponentProps<"div">) => {
  const a = useAutocomplete();
  const c = a.config;
  const busy = c.loading || c.backgroundLoading;
  let statusMessage = children;
  if (busy) {
    statusMessage = c.loadingMessage ?? "Loading suggestions…";
  } else if (a.options.length === 0) {
    statusMessage = c.emptyMessage ?? "No results found.";
  }
  const message = c.hintMessage ?? c.error ?? statusMessage;
  if (!message && !busy) {
    return null;
  }
  return (
    <div
      {...props}
      role="status"
      aria-live="polite"
      data-slot="autocomplete-feedback"
      className={cn(
        "flex min-w-0 items-center gap-2 px-3 py-2 text-sm text-muted-foreground",
        className
      )}
    >
      {busy && !c.hintMessage && (
        <Loading
          size={16}
          {...c.loadingProps}
          role="presentation"
          aria-hidden="true"
        />
      )}
      <span className="min-w-0 flex-1 break-words">{message}</span>
      {c.error && c.onRetry && (
        <button
          type="button"
          disabled={c.disabled || c.readOnly || c.loading}
          className="shrink-0 rounded-sm px-2 py-1 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={async () => {
            if (a.open && !c.disabled && !c.readOnly) {
              try {
                await c.onRetry?.();
              } catch {
                // The caller owns the error message and retry state.
              }
            }
          }}
        >
          {c.retryLabel ?? "Retry"}
        </button>
      )}
    </div>
  );
};
