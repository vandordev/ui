export const normalizeAutocompleteTag = (
  draft: string,
  values: readonly string[]
): string | null => {
  const tag = draft.trim();
  return tag && !values.includes(tag) ? tag : null;
};

export const isAutocompleteItemEqual = <Item>(
  item: Item,
  value: Item,
  getItemValue?: (item: Item) => string
): boolean =>
  getItemValue
    ? getItemValue(item) === getItemValue(value)
    : Object.is(item, value);

export const groupAutocompleteItems = <Item>(
  items: readonly Item[],
  groupBy?: (item: Item) => string
): { label?: string; items: Item[] }[] => {
  if (!groupBy) {
    return items.length ? [{ items: [...items] }] : [];
  }
  const groups = new Map<string, { label: string; items: Item[] }>();
  for (const item of items) {
    const label = groupBy(item);
    const group = groups.get(label) ?? { items: [], label };
    group.items.push(item);
    groups.set(label, group);
  }
  return [...groups.values()];
};
