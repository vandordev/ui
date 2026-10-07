"use client";

import { hashKey, skipToken, useInfiniteQuery } from "@tanstack/react-query";
import type {
  InfiniteData,
  QueryKey,
  UseInfiniteQueryOptions,
} from "@tanstack/react-query";
import { useRef } from "react";
import type { ReactNode } from "react";

import { dedupeAutocompleteItems } from "./autocomplete-query-state";
import type {
  AutocompleteQueryBinding,
  AutocompleteQueryStateOptions,
} from "./autocomplete-query-types";
import type {
  AutocompleteMode,
  AutocompletePaginationProps,
} from "./autocomplete-types";
import type { AutocompleteQuerySelected } from "./use-autocomplete-query";
import { useAutocompleteQueryState } from "./use-autocomplete-query-state";

type SelectedInfinite<F> = F extends { select?: (data: never) => infer Data }
  ? Data
  : InfiniteData<AutocompleteQuerySelected<F>>;
type SelectedPage<Data> = Data extends { pages: (infer Page)[] } ? Page : never;

export const useAutocompleteInfiniteQuery = <
  RawPage,
  Item,
  Page = RawPage,
  ErrorType = Error,
  Key extends QueryKey = QueryKey,
  Param = unknown,
  Mode extends AutocompleteMode = "free-text",
  Multiple extends boolean = false,
>(
  options: AutocompleteQueryStateOptions & {
    mode?: Mode;
    multiple?: Multiple;
    queryOptions: (input: {
      search: string;
    }) => UseInfiniteQueryOptions<
      RawPage,
      ErrorType,
      InfiniteData<Page>,
      Key,
      Param
    >;
    getItems: (page: Page) => readonly Item[];
    getItemValue?: (item: NoInfer<Item>) => string;
    formatError?: (error: ErrorType) => ReactNode;
  }
) => {
  type Data = InfiniteData<Page>;
  const state = useAutocompleteQueryState(options);
  const getId = (item: Item) => {
    if (options.getItemValue) {
      return options.getItemValue(item);
    }
    if (typeof item === "string") {
      return item;
    }
    throw new Error("Object autocomplete items require getItemValue");
  };
  const native = options.queryOptions({ search: state.debouncedSearch });
  const nativeEnabled = native.enabled;
  const query = useInfiniteQuery({
    ...native,
    enabled: (q) =>
      state.eligible &&
      native.queryFn !== skipToken &&
      (typeof nativeEnabled === "function"
        ? nativeEnabled(q)
        : nativeEnabled !== false),
  });
  const generation = hashKey(native.queryKey);
  const guard = useRef({ generation, busy: false, failed: false });
  if (guard.current.generation !== generation) {
    guard.current = { generation, busy: false, failed: false };
  }
  const allowed = state.eligible && query.isEnabled;
  const usable =
    state.search === state.debouncedSearch &&
    !state.belowMinimum &&
    !query.isPlaceholderData;
  const pages =
    usable && query.data !== undefined
      ? (query.data as InfiniteData<SelectedPage<Data>>).pages
      : [];
  const items = dedupeAutocompleteItems(
    pages.flatMap((page) => [...options.getItems(page)]),
    getId
  );
  const load = async (retry: boolean) => {
    const operation = guard.current;
    if (
      !allowed ||
      !usable ||
      !query.hasNextPage ||
      query.isFetching ||
      operation.busy ||
      (!retry && (operation.failed || query.isFetchNextPageError))
    ) {
      return;
    }
    operation.busy = true;
    try {
      const result = await query.fetchNextPage({ cancelRefetch: false });
      operation.failed = result.isFetchNextPageError;
    } catch {
      operation.failed = true;
    } finally {
      operation.busy = false;
    }
  };
  const pagination: AutocompletePaginationProps = {
    hasNextPage: Boolean(query.hasNextPage),
    fetchingNextPage: query.isFetchingNextPage,
    disabled:
      !allowed || !usable || (query.isFetching && !query.isFetchingNextPage),
    error:
      query.isFetchNextPageError && query.error
        ? (options.formatError?.(query.error) ??
          "Could not load more suggestions.")
        : undefined,
    onLoadMore: () => load(false),
    onRetry: () => load(true),
  };
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
      (state.open &&
        !state.belowMinimum &&
        state.search !== state.debouncedSearch) ||
      (allowed &&
        query.isFetching &&
        (query.data === undefined || query.isPlaceholderData)),
    backgroundLoading:
      usable &&
      query.data !== undefined &&
      query.isFetching &&
      !query.isFetchingNextPage,
    error:
      usable && query.data === undefined && query.error
        ? (options.formatError?.(query.error) ?? "Could not load suggestions.")
        : undefined,
    onRetry: () => {
      if (allowed) {
        return query.refetch();
      }
    },
    pagination,
  };
  return {
    query,
    pagination,
    search: state.search,
    open: state.open,
    setSearch: state.setSearch,
    setOpen: state.setOpen,
    autocompleteProps: binding as unknown as AutocompleteQueryBinding<
      Item,
      Mode,
      Multiple
    > &
      Pick<
        typeof binding,
        "hintMessage" | "backgroundLoading" | "onRetry" | "pagination"
      >,
  };
};
