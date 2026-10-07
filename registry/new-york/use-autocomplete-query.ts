"use client";

import { skipToken, useQuery } from "@tanstack/react-query";
import type { QueryKey, UseQueryOptions } from "@tanstack/react-query";
import type { ReactNode } from "react";

import type {
  AutocompleteQueryBinding,
  AutocompleteQueryStateOptions,
} from "./autocomplete-query-types";
import type { AutocompleteMode } from "./autocomplete-types";
import { useAutocompleteQueryState } from "./use-autocomplete-query-state";

export type AutocompleteQuerySelected<Options> = Options extends {
  select?: (data: never) => infer Selected;
}
  ? Selected
  : Options extends { queryFn?: (context: never) => infer Raw }
    ? Awaited<Raw>
    : never;

export const useAutocompleteQuery = <
  Raw,
  Item,
  Data = Raw,
  ErrorType = Error,
  Key extends QueryKey = QueryKey,
  Mode extends AutocompleteMode = "free-text",
  Multiple extends boolean = false,
>(
  options: AutocompleteQueryStateOptions & {
    mode?: Mode;
    multiple?: Multiple;
    queryOptions: (input: {
      search: string;
    }) => UseQueryOptions<Raw, ErrorType, Data, Key>;
    getItems: (data: Data) => readonly Item[];
    formatError?: (error: ErrorType) => ReactNode;
  }
) => {
  const state = useAutocompleteQueryState(options);
  // Native options cross a single generic adapter boundary; Query evaluates enabled
  // against its real Query object, not a fabricated policy object.
  const native = options.queryOptions({ search: state.debouncedSearch });
  const nativeEnabled = native.enabled;
  const enabled: typeof native.enabled = (query) =>
    state.eligible &&
    native.queryFn !== skipToken &&
    (typeof nativeEnabled === "function"
      ? nativeEnabled(query)
      : nativeEnabled !== false);
  const query = useQuery({ ...native, enabled });
  const allowed = state.eligible && query.isEnabled;
  const waiting =
    state.open && !state.belowMinimum && state.search !== state.debouncedSearch;
  const usable =
    state.search === state.debouncedSearch &&
    !state.belowMinimum &&
    !query.isPlaceholderData;
  const items =
    usable && query.data !== undefined ? options.getItems(query.data) : [];
  const binding = {
    mode: options.mode ?? "free-text",
    multiple: options.multiple ?? false,
    items,
    filter: null,
    open: state.open,
    onOpenChange: state.setOpen,
    ...(options.mode !== "selection" && !options.multiple
      ? { value: state.search, onValueChange: state.setSearch }
      : { inputValue: state.search, onInputValueChange: state.setSearch }),
    hintMessage: state.belowMinimum ? state.hintMessage : undefined,
    loading:
      waiting ||
      (allowed &&
        query.isFetching &&
        (query.data === undefined || query.isPlaceholderData)),
    backgroundLoading: usable && query.data !== undefined && query.isFetching,
    error:
      usable && query.data === undefined && query.error
        ? (options.formatError?.(query.error) ?? "Could not load suggestions.")
        : undefined,
    onRetry: () => {
      if (allowed) {
        return query.refetch();
      }
    },
  };
  return {
    query,
    search: state.search,
    open: state.open,
    setSearch: state.setSearch,
    setOpen: state.setOpen,
    autocompleteProps: binding as unknown as AutocompleteQueryBinding<
      Item,
      Mode,
      Multiple
    > &
      Pick<typeof binding, "hintMessage" | "backgroundLoading" | "onRetry">,
  };
};
