const assert = require("node:assert/strict");
const test = require("node:test");
const { createJiti } = require("jiti");

const jiti = createJiti(__filename, { fsCache: false });
const { getStatsCardLayout } = jiti(
  "../registry/new-york/stats-card-layout.ts"
);

test("StatsCard balanced rows fill the grid and preserve row/column ends", () => {
  assert.deepEqual(
    getStatsCardLayout(5, 4).map((cell) => cell.columns),
    [4, 4, 4, 6, 6]
  );
  assert.deepEqual(
    getStatsCardLayout(6, 4).map((cell) => cell.columns),
    [4, 4, 4, 4, 4, 4]
  );
  assert.deepEqual(
    getStatsCardLayout(7, 4).map((cell) => cell.columns),
    [3, 3, 3, 3, 4, 4, 4]
  );
  assert.deepEqual(getStatsCardLayout(0, 4), []);
  assert.equal(getStatsCardLayout(1, 4)[0].columns, 12);
  for (let count = 0; count <= 17; count += 1) {
    for (const maxColumns of [2, 3, 4]) {
      const cells = getStatsCardLayout(count, maxColumns);
      let row = [];
      const rowSizes = [];
      for (const cell of cells) {
        row.push(cell);
        if (cell.lastColumn) {
          assert.equal(
            row.reduce((sum, entry) => sum + entry.columns, 0),
            12
          );
          assert.equal(row.filter((entry) => entry.lastColumn).length, 1);
          rowSizes.push(row.length);
          row = [];
        }
      }
      assert.ok(rowSizes.every((size) => size <= maxColumns));
    }
  }
});
