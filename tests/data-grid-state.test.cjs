const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createJiti } = require("jiti");
const { z } = require("zod");
const jiti = createJiti(__filename, { fsCache: false });
const schemas = jiti("../registry/new-york/data-grid-schema.ts");
const load = () => jiti("../registry/new-york/data-grid-state.ts");
const contract = schemas.createDataGridContract({
  pagination: "page",
  row: z.object({ id: z.string() }),
  filters: z.object({
    search: z.string().default(""),
    active: z.boolean().default(true),
  }),
  sortBy: z.enum(["name", "createdAt"]),
});
const request = () =>
  contract.input.parse({ pagination: { pageIndex: 4 }, filters: {} });

test("filter transition resets page atomically", () => {
  const next = load().transitionDataGridRequest(contract, request(), {
    type: "filters",
    value: { search: "Ada" },
  });
  assert.equal(next.request.pagination.pageIndex, 0);
  assert.equal(next.request.filters.search, "Ada");
  assert.equal(next.filtersChanged, true);
});

test("equivalent filters preserve page while sorting and size reset together", () => {
  const api = load();
  const current = request();
  const same = api.transitionDataGridRequest(contract, current, {
    type: "filters",
    value: { active: true, search: "" },
  });
  assert.equal(same.filtersChanged, false);
  assert.equal(same.request.pagination.pageIndex, 4);
  const sorted = api.transitionDataGridRequest(contract, current, {
    type: "sorting",
    value: [{ id: "name", desc: true }],
  });
  assert.deepEqual(sorted.request.pagination, { pageIndex: 0, pageSize: 25 });
  const sized = api.transitionDataGridRequest(contract, current, {
    type: "pageSize",
    value: 50,
  });
  assert.deepEqual(sized.request.pagination, { pageIndex: 0, pageSize: 50 });
  assert.throws(() =>
    api.transitionDataGridRequest(contract, current, {
      type: "pageSize",
      value: 0,
    })
  );
  assert.throws(() =>
    api.transitionDataGridRequest(contract, current, {
      type: "sorting",
      value: [{ id: "password", desc: false }],
    })
  );
});

test("filter transforms do not reparse unchanged applied values", () => {
  const api = load();
  let calls = 0;
  const transformed = schemas.createDataGridContract({
    pagination: "page",
    row: contract.row,
    filters: z.object({
      search: z.string().transform((value) => {
        calls += 1;
        return `:${value}`;
      }),
    }),
    sortBy: contract.sortBy,
  });
  const current = transformed.input.parse({ filters: { search: "Ada" } });
  const next = api.transitionDataGridRequest(transformed, current, {
    type: "pageIndex",
    value: 2,
  });
  assert.equal(next.request.filters.search, ":Ada");
  assert.equal(calls, 1);
  const filtered = api.transitionDataGridRequest(transformed, next.request, {
    type: "filters",
    value: { search: "Grace" },
  });
  assert.equal(filtered.request.filters.search, ":Grace");
  assert.equal(calls, 2);
});

test("draft validation exposes field and form errors without applying values", () => {
  const api = load();
  const refined = schemas.createDataGridContract({
    pagination: "page",
    row: contract.row,
    filters: z
      .object({ low: z.number(), high: z.number() })
      .refine((value) => value.low <= value.high, "Invalid range"),
    sortBy: contract.sortBy,
  });
  const invalid = api.validateDataGridFilters(refined, { low: 2, high: 1 });
  assert.equal(invalid.success, false);
  assert.deepEqual(invalid.formErrors, ["Invalid range"]);
  const field = api.validateDataGridFilters(refined, { low: "bad", high: 1 });
  assert.equal(field.success, false);
  assert.equal(typeof field.fieldErrors.low, "string");
  assert.equal(
    api.validateDataGridFilters(refined, { low: 1, high: 2 }).success,
    true
  );
  assert.throws(
    () => api.serializeDataGridValue({ date: new Date() }),
    /serializable/
  );
  assert.equal(
    api.serializeDataGridValue({ b: 2, a: 1 }),
    api.serializeDataGridValue({ a: 1, b: 2 })
  );
});

test("cursor history records only successful visits and truncates branches", () => {
  const api = load();
  const cursor = schemas.createDataGridContract({
    pagination: "cursor",
    row: contract.row,
    filters: contract.filters,
    sortBy: contract.sortBy,
  });
  let history = api.createDataGridCursorHistory(null);
  assert.equal(api.getDataGridPreviousCursor(history).available, false);
  // Attempting a request has no history side effect. Only success is committed.
  assert.deepEqual(history.cursors, [null]);
  history = api.commitDataGridCursor(history, "a");
  history = api.commitDataGridCursor(history, "b");
  assert.deepEqual(api.getDataGridPreviousCursor(history), {
    available: true,
    cursor: "a",
  });
  history = api.commitDataGridCursor(history, "a");
  history = api.commitDataGridCursor(history, "branch");
  assert.deepEqual(history, { cursors: [null, "a", "branch"], index: 2 });
  const current = cursor.input.parse({
    pagination: { cursor: "branch" },
    filters: {},
  });
  const next = api.transitionDataGridRequest(cursor, current, {
    type: "pageSize",
    value: 50,
  });
  assert.deepEqual(next.request.pagination, { cursor: null, pageSize: 50 });
  assert.equal(next.resetCursorHistory, true);
  assert.throws(
    () =>
      api.transitionDataGridRequest(cursor, current, {
        type: "pageIndex",
        value: 1,
      }),
    /page mode/
  );
});

test("page correction uses totals including zero without correcting valid pages", () => {
  const api = load();
  assert.equal(
    api.getDataGridPageCorrection({ pageIndex: 4, pageSize: 25 }, 30),
    1
  );
  assert.equal(
    api.getDataGridPageCorrection({ pageIndex: 4, pageSize: 25 }, 0),
    0
  );
  assert.equal(
    api.getDataGridPageCorrection({ pageIndex: 0, pageSize: 25 }, 0),
    null
  );
  assert.equal(
    api.getDataGridPageCorrection({ pageIndex: 1, pageSize: 25 }, 30),
    null
  );
});

test("external filter restoration encodes codecs without double transforms", () => {
  const api = load();
  let decodes = 0;
  const filters = z.object({
    search: z.codec(z.string(), z.string(), {
      decode: (value) => {
        decodes += 1;
        return `:${value}`;
      },
      encode: (value) => value.slice(1),
    }),
  });
  const codec = schemas.createDataGridContract({
    pagination: "page",
    row: contract.row,
    filters,
    sortBy: contract.sortBy,
  });
  const normalized = codec.input.parse({ filters: { search: "Ada" } });
  assert.deepEqual(api.restoreDataGridFilterDraft(codec, normalized.filters), {
    search: "Ada",
  });
  assert.equal(decodes, 1);
  const oneWay = schemas.createDataGridContract({
    pagination: "page",
    row: contract.row,
    filters: z.object({ search: z.string().transform((value) => `:${value}`) }),
    sortBy: contract.sortBy,
  });
  assert.throws(
    () => api.restoreDataGridFilterDraft(oneWay, { search: ":Ada" }),
    /reversible Zod codec/
  );
});

test("cursor branch from the first page does not mistake forward visits for previous", () => {
  const api = load();
  let history = api.createDataGridCursorHistory(null);
  history = api.commitDataGridCursor(history, "a");
  history = api.commitDataGridCursor(history, "b");
  history = api.commitDataGridCursor(history, null);
  history = api.commitDataGridCursor(history, "b");
  assert.deepEqual(history, { cursors: [null, "b"], index: 1 });
});
