"use client";

import { useEffect, useState } from "react";

import {
  isAutocompleteQueryEligible,
  validateAutocompleteQueryConfiguration,
} from "./autocomplete-query-state";
import type { AutocompleteQueryStateOptions } from "./autocomplete-query-types";

export const useAutocompleteQueryState = (
  options: AutocompleteQueryStateOptions
) => {
  const { debounceMs = 300, minSearchLength = 0 } = options;
  validateAutocompleteQueryConfiguration(debounceMs, minSearchLength);
  const [localSearch, updateSearch] = useState(options.defaultSearch ?? "");
  const [localOpen, updateOpen] = useState(options.defaultOpen ?? false);
  const search = options.search ?? localSearch;
  const open = options.open ?? localOpen;
  const [settled, settle] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => settle(search), debounceMs);
    return () => clearTimeout(timer);
  }, [search, debounceMs]);
  const debouncedSearch = debounceMs === 0 ? search : settled;
  const setSearch = (next: string) => {
    if (options.search === undefined) {
      updateSearch(next);
    }
    if (search !== next) {
      options.onSearchChange?.(next);
    }
  };
  const setOpen = (next: boolean) => {
    if (options.open === undefined) {
      updateOpen(next);
    }
    if (open !== next) {
      options.onOpenChange?.(next);
    }
  };
  return {
    debouncedSearch,
    eligible: isAutocompleteQueryEligible({
      open,
      search,
      debouncedSearch,
      minSearchLength,
      enabled: options.enabled !== false,
    }),
    belowMinimum: search.length < minSearchLength,
    hintMessage:
      options.hintMessage ?? `Enter at least ${minSearchLength} characters.`,
    open,
    search,
    setOpen,
    setSearch,
  };
};
