export interface StatsCardLayoutCell {
  columns: number;
  lastRow: boolean;
  lastColumn: boolean;
}

export const getStatsCardLayout = (count: number, maxColumns: number) => {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError("count must be a non-negative integer");
  }
  if (!Number.isInteger(maxColumns) || maxColumns < 1 || maxColumns > 12) {
    throw new RangeError("maxColumns must be an integer from 1 to 12");
  }
  if (count === 0) {
    return [] as StatsCardLayoutCell[];
  }
  const rows = Math.ceil(count / maxColumns);
  const base = Math.floor(count / rows);
  const remainder = count % rows;
  const rowSizes = Array.from(
    { length: rows },
    (_, index) => base + Number(index < remainder)
  );
  return rowSizes.flatMap((size, row) =>
    Array.from({ length: size }, (_, column) => ({
      columns: 12 / size,
      lastColumn: column === size - 1,
      lastRow: row === rows - 1,
    }))
  );
};
