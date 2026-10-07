export const validateAutocompleteQueryConfiguration = (
  debounceMs: number,
  minSearchLength: number
) => {
  if (
    !Number.isFinite(debounceMs) ||
    debounceMs < 0 ||
    debounceMs > 2_147_483_647 ||
    !Number.isSafeInteger(minSearchLength) ||
    minSearchLength < 0
  ) {
    throw new RangeError(
      "Invalid autocomplete debounce or minimum search length"
    );
  }
};

export const isAutocompleteQueryEligible = ({
  open,
  search,
  debouncedSearch,
  minSearchLength,
  enabled,
}: {
  open: boolean;
  search: string;
  debouncedSearch: string;
  minSearchLength: number;
  enabled: boolean;
}) =>
  open &&
  enabled &&
  search.length >= minSearchLength &&
  search === debouncedSearch;

export const dedupeAutocompleteItems = <Item>(
  items: readonly Item[],
  getItemValue: (item: Item) => string
): Item[] => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const id = getItemValue(item);
    if (seen.has(id)) {
      return false;
    }
    seen.add(id);
    return true;
  });
};
