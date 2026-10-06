const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createJiti } = require("jiti");
const jiti = createJiti(__filename, { fsCache: false });
const load = () => jiti("../registry/new-york/data-grid-selection.ts");

test("all matching page deselection adds exclusions", () => {
  const api = load();
  const before = {
    mode: "allMatching",
    filters: { search: "Ada" },
    excludedIds: [],
  };
  const after = api.toggleDataGridPage(before, ["a", "b"], false);
  assert.deepEqual(after.excludedIds, ["a", "b"]);
  assert.equal(api.isDataGridRowSelected(after, "c"), true);
  assert.deepEqual(before.excludedIds, []);
  assert.deepEqual(
    api.toggleDataGridPage(after, ["a", "b"], true).excludedIds,
    []
  );
});

test("explicit selection preserves off-page IDs and reports visible membership", () => {
  const api = load();
  let selection = { mode: "explicit", ids: [] };
  selection = api.toggleDataGridPage(selection, ["a", "a", "b"], true);
  selection = api.toggleDataGridRow(selection, "c", true);
  assert.deepEqual(selection.ids, ["a", "b", "c"]);
  assert.deepEqual(api.getDataGridPageSelection(selection, ["a", "b"]), {
    checked: true,
    indeterminate: false,
    selected: 2,
    total: 2,
  });
  selection = api.toggleDataGridRow(selection, "b", false);
  assert.deepEqual(api.getDataGridPageSelection(selection, ["a", "b"]), {
    checked: false,
    indeterminate: true,
    selected: 1,
    total: 2,
  });
  selection = api.toggleDataGridPage(selection, ["a", "b"], false);
  assert.deepEqual(selection.ids, ["c"]);
  assert.deepEqual(api.getDataGridPageSelection(selection, []), {
    checked: false,
    indeterminate: false,
    selected: 0,
    total: 0,
  });
});

test("all matching filters are an independent execution-time snapshot", () => {
  const api = load();
  const filters = { range: { from: "2026-10-01" }, status: "active" };
  const selection = api.createDataGridAllMatchingSelection(filters);
  filters.range.from = "2026-10-07";
  assert.equal(selection.filters.range.from, "2026-10-01");
  assert.equal("rowCount" in selection, false);
  assert.equal(
    api.canToggleDataGridSelection({
      enabled: true,
      placeholder: true,
      current: true,
    }),
    false
  );
  assert.equal(
    api.canToggleDataGridSelection({
      enabled: false,
      placeholder: false,
      current: true,
    }),
    false
  );
  assert.equal(
    api.canToggleDataGridSelection({
      enabled: true,
      placeholder: false,
      current: false,
    }),
    false
  );
  assert.equal(
    api.canToggleDataGridSelection({
      enabled: true,
      placeholder: false,
      current: true,
    }),
    true
  );
});
