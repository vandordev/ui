const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createJiti } = require("jiti");
const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});

test("simulated backend returns deterministic remote pages and filtered totals", async () => {
  const api = jiti("../examples/data-grid-demo-data.ts");
  const input = api.usersGrid.input.parse({
    filters: { status: "active" },
    sorting: [{ id: "visits", desc: true }],
  });
  const first = await api.listDemoUsers(input);
  const second = await api.listDemoUsers({
    ...input,
    pagination: { pageIndex: 1, pageSize: 25 },
  });
  assert.equal(first.rowCount, 52);
  assert.equal(first.rows.length, 25);
  assert.equal(second.rows.length, 25);
  assert.equal(
    first.rows.some((row) => second.rows.some((other) => other.id === row.id)),
    false
  );
  assert.equal(
    first.rows.every(
      (row, index, rows) => index === 0 || rows[index - 1].visits >= row.visits
    ),
    true
  );
  const repeated = await api.listDemoUsers(input);
  assert.deepEqual(
    first.rows.map((row) => row.id),
    repeated.rows.map((row) => row.id)
  );
});

test("simulated cursor uses backend tokens and cancellation rejects without completing", async () => {
  const api = jiti("../examples/data-grid-demo-data.ts");
  const input = api.cursorUsersGrid.input.parse({ filters: {} });
  const first = await api.listCursorDemoUsers(input);
  const second = await api.listCursorDemoUsers({
    ...input,
    pagination: { ...input.pagination, cursor: first.nextCursor },
  });
  assert.equal(first.rows.length, 25);
  assert.equal(
    first.rows.some((row) => second.rows.some((other) => other.id === row.id)),
    false
  );
  const controller = new AbortController();
  const pending = api.listDemoUsers(
    api.usersGrid.input.parse({ filters: {} }),
    controller.signal
  );
  controller.abort();
  await assert.rejects(pending, { name: "AbortError" });
});
