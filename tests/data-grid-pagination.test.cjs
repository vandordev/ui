const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createFixture } = require("./data-grid-ui-fixture.cjs");

test("page link windows stay bounded for large totals and fill one-page gaps", () => {
  const { createJiti } = require("jiti");
  const jiti = createJiti(__filename, { fsCache: false });
  const { getDataGridPageLinks } = jiti(
    "../registry/new-york/data-grid-state.ts"
  );
  assert.deepEqual(getDataGridPageLinks(1, 1), [1]);
  assert.deepEqual(getDataGridPageLinks(2, 3), [1, 2, 3]);
  assert.deepEqual(getDataGridPageLinks(8, 8), [1, "ellipsis", 6, 7, 8]);
  assert.deepEqual(getDataGridPageLinks(4, 8), [1, 2, 3, 4, 5, "ellipsis", 8]);
  const total = Number.MAX_SAFE_INTEGER;
  assert.deepEqual(getDataGridPageLinks(100, total), [
    1,
    "ellipsis",
    99,
    100,
    101,
    "ellipsis",
    total,
  ]);
});

test("numbered pagination uses bounded endpoints, marks current page and jumps without first/last", async () => {
  const f = await createFixture();
  try {
    await f.mount({
      options: {
        queryOptions: (input) =>
          f.query.queryOptions({
            queryKey: ["numbers", input],
            queryFn: async () => ({
              rows: [{ id: "a", name: "Ada" }],
              rowCount: 200,
            }),
          }),
      },
      children: (grid, { ui }) => f.React.createElement(ui.DataGridPagination),
    });
    const nav = () =>
      f.host.querySelector('[data-slot="data-grid-pagination"]');
    const numbered = () =>
      [...nav().querySelectorAll("button[data-page]")].map(
        (button) => button.textContent
      );
    assert.deepEqual(numbered(), ["1", "2", "3", "8"]);
    assert.equal(nav().querySelector('[aria-current="page"]').textContent, "1");
    assert.equal(
      nav().querySelectorAll(
        '[aria-label="First page"], [aria-label="Last page"]'
      ).length,
      0
    );
    const previous = nav().querySelector('[aria-label="Previous page"]');
    assert.equal(previous.textContent, "");
    assert.ok(Boolean(previous.querySelector('svg[aria-hidden="true"]')));
    assert.equal(previous.disabled, true);
    await f.click(nav().querySelector('[data-page="8"]'));
    assert.equal(f.grid.request.pagination.pageIndex, 7);
    assert.equal(nav().querySelector('[aria-current="page"]').textContent, "8");
    assert.equal(
      nav().querySelector('[aria-label="Next page"]').disabled,
      true
    );
    await f.React.act(async () => f.grid.setPageIndex(3));
    await f.settle();
    assert.deepEqual(numbered(), ["1", "2", "3", "4", "5", "8"]);
    assert.ok(nav().textContent.includes("…"));
  } finally {
    await f.dispose();
  }
});

test("unnumbered pagination shows four labeled icon actions and no number buttons", async () => {
  const f = await createFixture();
  try {
    await f.mount({
      children: (grid, { ui }) =>
        f.React.createElement(ui.DataGridPagination, {
          showPageNumbers: false,
        }),
    });
    const nav = f.host.querySelector('[data-slot="data-grid-pagination"]');
    assert.equal(nav.querySelectorAll("button[data-page]").length, 0);
    for (const label of [
      "First page",
      "Previous page",
      "Next page",
      "Last page",
    ]) {
      const button = nav.querySelector(`[aria-label="${label}"]`);
      assert.ok(Boolean(button), label);
      assert.equal(button.textContent, "");
      assert.equal(button.getAttribute("type"), "button");
    }
    await f.click(nav.querySelector('[aria-label="Last page"]'));
    assert.equal(f.grid.request.pagination.pageIndex, 2);
    await f.click(nav.querySelector('[aria-label="First page"]'));
    assert.equal(f.grid.request.pagination.pageIndex, 0);
  } finally {
    await f.dispose();
  }
});

test("zero results have a single page and placeholder totals never expose stale number links", async () => {
  const f = await createFixture();
  let resolve;
  try {
    await f.mount({
      options: {
        queryOptions: (input) =>
          f.query.queryOptions({
            queryKey: ["placeholder-numbers", input],
            placeholderData: (previous) => previous,
            queryFn: () =>
              input.filters.search
                ? new Promise((done) => {
                    resolve = done;
                  })
                : Promise.resolve({ rows: [], rowCount: 0 }),
          }),
      },
      children: (grid, { ui }) => f.React.createElement(ui.DataGridPagination),
    });
    assert.equal(
      f.host.querySelector('[aria-current="page"]').textContent,
      "1"
    );
    assert.ok(f.host.textContent.includes("0–0 of 0 results"));
    assert.equal(
      f.host.querySelector('[aria-label="Next page"]').disabled,
      true
    );
    await f.React.act(async () => f.grid.setFilter("search", "pending"));
    assert.equal(f.host.querySelectorAll("[data-page]").length, 0);
    assert.equal(
      f.host.querySelector('[aria-label="Next page"]').disabled,
      true
    );
    await f.React.act(async () => resolve({ rows: [], rowCount: 0 }));
    await f.settle();
    assert.equal(
      f.host.querySelector('[aria-current="page"]').textContent,
      "1"
    );
  } finally {
    await f.dispose();
  }
});
