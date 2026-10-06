export const dataGridLabels = {
  allMatching: "All matching results selected",
  apply: "Apply filters",
  clearSearch: "Clear search",
  clearSelection: "Clear selection",
  columns: "Columns",
  error: "Could not load results",
  errorDescription: "Try again. Your changes have been kept.",
  first: "First page",
  inactive: "Results are not active",
  last: "Last page",
  loading: "Loading results",
  next: "Next page",
  noData: "No data yet",
  noDataDescription: "Results will appear here when available.",
  noMatches: "No matching results",
  noMatchesDescription: "Try changing or resetting your filters.",
  page: (index: number, count?: number) =>
    count === undefined ? `Page ${index}` : `Page ${index} of ${count}`,
  pageSize: "Rows per page",
  paused: "Waiting for a network connection",
  previous: "Previous page",
  range: (from: number, to: number, count: number) =>
    `${from}–${to} of ${count} results`,
  refreshing: "Refreshing results",
  reset: "Reset filters",
  retry: "Try again",
  search: "Search results",
  selectAllMatching: (count?: number) =>
    count === undefined
      ? "Select all matching results"
      : `Select all ${count} matching results`,
  selectPage: "Select this page",
  selectRow: (id: string) => `Select row ${id}`,
  selected: (count: number) =>
    `${count} ${count === 1 ? "row" : "rows"} selected`,
  sort: (label: string, next: "asc" | "desc" | false) =>
    next
      ? `Sort ${label} ${next === "asc" ? "ascending" : "descending"}`
      : `Clear sorting for ${label}`,
  updating: "Updating results. Previous rows are shown temporarily.",
};
export type DataGridLabels = typeof dataGridLabels;
