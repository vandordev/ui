"use client";

import { cn } from "cn";
import type { ComponentProps } from "react";

import { useAutocomplete } from "./autocomplete-root";
import { Loading } from "./loading";

export const AutocompletePagination = ({
  className,
  ...props
}: ComponentProps<"div">) => {
  const a = useAutocomplete();
  const c = a.config;
  const page = c.pagination;
  if (
    !page ||
    (!page.hasNextPage && !page.error && !page.fetchingNextPage && !a.pageBusy)
  ) {
    return null;
  }
  const busy = page.fetchingNextPage || a.pageBusy;
  return (
    <div
      {...props}
      data-slot="autocomplete-pagination"
      className={cn(
        "flex min-w-0 items-center gap-2 border-t px-3 py-2 text-sm",
        className
      )}
    >
      <span
        role="status"
        aria-live="polite"
        className="flex min-w-0 flex-1 items-center gap-2 break-words text-muted-foreground"
      >
        {busy && (
          <Loading
            size={16}
            {...c.loadingProps}
            role="presentation"
            aria-hidden="true"
          />
        )}
        {busy ? (page.loadingMessage ?? "Loading more…") : page.error}
      </span>
      <button
        type="button"
        disabled={
          busy ||
          !a.open ||
          page.disabled ||
          c.disabled ||
          c.readOnly ||
          c.loading ||
          Boolean(c.error || c.hintMessage)
        }
        className="shrink-0 rounded-sm px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        onClick={() => {
          void a.loadPage(Boolean(page.error)).catch(() => undefined);
        }}
      >
        {page.error
          ? (page.retryLabel ?? "Retry")
          : (page.loadMoreLabel ?? "Load more")}
      </button>
    </div>
  );
};
