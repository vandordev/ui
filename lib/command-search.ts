export interface CommandSearchItem {
  value: string;
  keywords?: string[];
}

export const matchesCommandSearch = (
  item: CommandSearchItem,
  query: string
): boolean =>
  `${item.value} ${item.keywords?.join(" ") ?? ""}`
    .toLowerCase()
    .includes(query.toLowerCase());
