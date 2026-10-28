const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createJiti } = require("jiti");

test("DataGrid explicit family entry preserves every previous runtime export and exposes the source adapter", () => {
  const jiti = createJiti(__filename, {
    fsCache: false,
    jsx: { runtime: "automatic" },
  });
  const entry = jiti("../registry/new-york/data-grid-index.ts");
  const expected = new Set(["useDataGridSource"]);
  for (const entryName of ["data-grid", "data-grid-columns", "use-data-grid"]) {
    const exports = jiti(`../registry/new-york/${entryName}`);
    for (const name of Object.keys(exports)) {
      expected.add(name);
    }
  }
  assert.deepEqual(Object.keys(entry).toSorted(), [...expected].toSorted());
});
