const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createJiti } = require("jiti");
const { z } = require("zod");
const jiti = createJiti(__filename, { fsCache: false });
const load = () => jiti("../registry/new-york/data-grid-schema.ts");

test("schema consumption loads without React Query or Table resolution", () => {
  const { spawnSync } = require("node:child_process");
  const script = `
    const Module = require('node:module');
    const original = Module._load;
    Module._load = function(id, ...rest) {
      if (/^(react|@tanstack\\/)/.test(id)) throw new Error('Forbidden runtime dependency: ' + id);
      return original.call(this, id, ...rest);
    };
    const { createJiti } = require('jiti');
    const api = createJiti(process.cwd() + '/tests/backend.cjs', {fsCache:false})('../registry/new-york/data-grid-schema.ts');
    if (api.createDataGridPagePaginationSchema().parse({}).pageSize !== 25) process.exit(2);
  `;
  const result = spawnSync(process.execPath, ["-e", script], {
    encoding: "utf8",
    timeout: 20_000,
    maxBuffer: 16_384,
  });
  assert.equal(result.status, 0, result.stderr.slice(0, 2000));
});

test("page schema rejects zero size", () => {
  const api = load();
  const schema = api.createDataGridPagePaginationSchema();
  assert.equal(schema.safeParse({ pageIndex: 0, pageSize: 0 }).success, false);
  assert.deepEqual(schema.parse({ pageIndex: 0 }), {
    pageIndex: 0,
    pageSize: 25,
  });
});

test("pagination validates safe integers and configured boundaries", () => {
  const api = load();
  const page = api.createDataGridPagePaginationSchema({
    pageSize: 10,
    maxPageSize: 50,
  });
  for (const pageIndex of [-1, 0.5, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(page.safeParse({ pageIndex }).success, false);
  }
  for (const pageSize of [-1, 0.5, 51, Infinity]) {
    assert.equal(page.safeParse({ pageSize }).success, false);
  }
  assert.deepEqual(page.parse({}), { pageIndex: 0, pageSize: 10 });
  assert.throws(() =>
    api.createDataGridPagePaginationSchema({ pageSize: 101 })
  );
  const cursor = api.createDataGridCursorPaginationSchema();
  assert.deepEqual(cursor.parse({}), { cursor: null, pageSize: 25 });
  assert.equal(cursor.safeParse({ cursor: 42 }).success, false);
  assert.equal(cursor.parse({ cursor: "opaque:token" }).cursor, "opaque:token");
});

test("sorting rejects unknown and duplicate backend keys", () => {
  const api = load();
  const sorting = api.createDataGridSortingSchema(
    z.enum(["backend_name", "createdAt"])
  );
  assert.deepEqual(sorting.parse(undefined), []);
  assert.equal(sorting.safeParse([{ id: "name", desc: false }]).success, false);
  assert.equal(
    sorting.safeParse([
      { id: "backend_name", desc: false },
      { id: "backend_name", desc: true },
    ]).success,
    false
  );
  assert.deepEqual(sorting.parse([{ id: "createdAt", desc: true }]), [
    { id: "createdAt", desc: true },
  ]);
});

test("contracts expose reusable schemas and apply transforms once per parse", () => {
  const api = load();
  let calls = 0;
  const filters = z.object({
    search: z
      .string()
      .default("")
      .transform((value) => {
        calls += 1;
        return `:${value}`;
      }),
  });
  const row = z.object({ id: z.string(), count: z.string().transform(Number) });
  const contract = api.createDataGridContract({
    pagination: "page",
    row,
    filters,
    sortBy: z.literal("count"),
  });
  assert.deepEqual(contract.input.parse({ filters: {} }), {
    pagination: { pageIndex: 0, pageSize: 25 },
    sorting: [],
    filters: { search: ":" },
  });
  assert.equal(calls, 1);
  assert.deepEqual(
    contract.output.parse({ rows: [{ id: "a", count: "2" }], rowCount: 0 }),
    { rows: [{ id: "a", count: 2 }], rowCount: 0 }
  );
  assert.equal(
    contract.input
      .extend({ tenant: z.string() })
      .safeParse({ filters: {}, tenant: "a" }).success,
    true
  );
  for (const rowCount of [-1, 0.1, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(
      contract.output.safeParse({ rows: [], rowCount }).success,
      false
    );
  }
  const cursor = api.createDataGridContract({
    pagination: "cursor",
    row,
    filters: z.object({}),
    sortBy: z.literal("count"),
  });
  assert.deepEqual(cursor.output.parse({ rows: [], nextCursor: null }), {
    rows: [],
    nextCursor: null,
  });
  assert.equal(
    cursor.output.safeParse({ rows: [], rowCount: 0 }).success,
    false
  );
  const required = api.createDataGridContract({
    pagination: "page",
    row,
    filters: z.object({ status: z.string() }),
    sortBy: z.literal("count"),
  });
  assert.equal(required.input.safeParse({ filters: {} }).success, false);
});

test("selection schema validates domain IDs and deduplicates descriptors", () => {
  const api = load();
  const selection = api.createDataGridSelectionSchema({
    filters: z.object({ active: z.boolean().default(true) }),
    id: z.string().min(1),
  });
  assert.deepEqual(
    selection.parse({ mode: "explicit", ids: ["a", "a", "b"] }),
    { mode: "explicit", ids: ["a", "b"] }
  );
  assert.deepEqual(
    selection.parse({
      mode: "allMatching",
      filters: {},
      excludedIds: ["a", "a"],
    }),
    { mode: "allMatching", filters: { active: true }, excludedIds: ["a"] }
  );
  assert.equal(
    selection.safeParse({ mode: "explicit", ids: [""] }).success,
    false
  );
  assert.equal(
    selection.safeParse({
      mode: "allMatching",
      filters: { active: "yes" },
      excludedIds: [],
    }).success,
    false
  );
});
