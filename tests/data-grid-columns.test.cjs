const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createJiti } = require("jiti");
const { z } = require("zod");
const jiti = createJiti(__filename, {
  fsCache: false,
  jsx: { runtime: "automatic" },
});

test("columns preserve computed values and reject duplicate stable IDs", async () => {
  const schemas = jiti("../registry/new-york/data-grid-schema.ts");
  const api = await jiti.import("../registry/new-york/data-grid-columns.tsx");
  const contract = schemas.createDataGridContract({
    pagination: "page",
    row: z.object({ id: z.string(), name: z.string(), visits: z.number() }),
    filters: z.object({}),
    sortBy: z.literal("backend_name"),
  });
  const helper = api.createDataGridColumnHelper(contract);
  let observed;
  const computed = helper.accessor((row) => row.visits * 2, {
    id: "score",
    header: "Score",
    cell: ({ value, row }) => {
      observed = { value, name: row.name };
      return value.toFixed();
    },
  });
  const native = {
    getValue: () => 6,
    row: { original: { id: "a", name: "Ada", visits: 3 } },
  };
  assert.equal(computed.cell(native), "6");
  assert.deepEqual(observed, { value: 6, name: "Ada" });
  assert.equal(computed.accessorFn(native.row.original), 6);
  const name = helper.accessor("name", {
    header: "Name",
    sortBy: "backend_name",
  });
  assert.equal(name.id, "name");
  assert.equal(name.meta.dataGrid.sortBy, "backend_name");
  assert.equal(name.enableSorting, true);
  assert.equal(computed.enableSorting, false);
  assert.throws(
    () => api.normalizeDataGridColumns([name, name]),
    /Duplicate column ID/
  );
  assert.deepEqual(
    api.normalizeDataGridColumnOrder(
      ["gone", "score", "score"],
      [name, computed]
    ),
    ["score", "name"]
  );
  assert.throws(
    () => helper.accessor((row) => row.name, { header: "Name" }),
    /stable ID/
  );
  assert.throws(
    () => helper.display({ id: "actions", header: () => "Actions" }),
    /text label/
  );
});
