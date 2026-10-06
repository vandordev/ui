const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createFixture } = require("./data-grid-ui-fixture.cjs");

test("localized no-match Empty resets filters with valid minimum feedback span", async () => {
  const f = await createFixture();
  try {
    await f.mount({
      root: { labels: { noMatches: "Tidak ditemukan", reset: "Atur ulang" } },
      options: {
        columns: [],
        queryOptions: (input) =>
          f.query.queryOptions({
            queryKey: ["empty", input],
            queryFn: async () => ({ rows: [], rowCount: 0 }),
          }),
      },
    });
    assert.ok(f.host.textContent.includes("No data yet"));
    await f.React.act(async () => f.grid.setFilter("search", "missing"));
    await f.settle();
    assert.ok(f.host.textContent.includes("Tidak ditemukan"));
    assert.equal(f.host.querySelector("tbody td").getAttribute("colspan"), "1");
    await f.click(f.button("Atur ulang"));
    assert.equal(f.grid.request.filters.search, "");
    assert.ok(f.host.textContent.includes("No data yet"));
  } finally {
    await f.dispose();
  }
});

test("typed feedback override receives reset and retry without invalid table children", async () => {
  const f = await createFixture();
  try {
    let retries = 0;
    await f.mount({
      options: {
        queryOptions: (input) =>
          f.query.queryOptions({
            queryKey: ["override", input],
            queryFn: async () => {
              retries += 1;
              throw new Error("private");
            },
          }),
      },
      table: {
        renderError: ({ error, retry, background, grid }) =>
          f.React.createElement(
            "button",
            {
              type: "button",
              onClick: () => retry(),
              "data-background": String(background),
              "data-mode": grid.contract.mode,
            },
            error instanceof Error ? "Recover" : "Unexpected"
          ),
      },
    });
    assert.equal(
      f.host.querySelector("tbody > tr > td > button").textContent,
      "Recover"
    );
    await f.click(f.button("Recover"));
    assert.equal(retries, 2);
    assert.equal(f.button("Recover").getAttribute("data-background"), "false");
    assert.equal(f.button("Recover").getAttribute("data-mode"), "page");
  } finally {
    await f.dispose();
  }
});

test("ErrorState retry hides private errors and background failure preserves cells", async () => {
  const f = await createFixture();
  let fail = true;
  try {
    await f.mount({
      options: {
        queryOptions: (input) =>
          f.query.queryOptions({
            queryKey: ["error", input],
            queryFn: async () => {
              if (fail) throw new Error("SECRET backend stack");
              return { rows: [{ id: "a", name: "Ada" }], rowCount: 1 };
            },
          }),
      },
    });
    assert.equal(
      f.host.querySelectorAll('[data-slot="error-state"]').length,
      1
    );
    assert.equal(
      f.host
        .querySelector('[data-slot="error-state"]')
        .getAttribute("data-variant"),
      "centered"
    );
    assert.equal(f.host.textContent.includes("SECRET"), false);
    fail = false;
    await f.click(f.button("Try again"));
    assert.ok(f.host.querySelector("tbody").textContent.includes("Ada"));
    fail = true;
    await f.React.act(async () => f.grid.query.refetch());
    await f.settle();
    assert.ok(f.host.querySelector("tbody").textContent.includes("Ada"));
    assert.equal(
      f.host
        .querySelector('[data-slot="error-state"]')
        .getAttribute("data-variant"),
      "inline"
    );
    assert.equal(f.host.textContent.includes("SECRET"), false);
  } finally {
    await f.dispose();
  }
});

test("inactive query is neutral while pending active query renders skeleton rows", async () => {
  const f = await createFixture();
  try {
    await f.mount({
      options: {
        queryOptions: (input) =>
          f.query.queryOptions({
            queryKey: ["inactive", input],
            enabled: false,
            queryFn: async () => ({ rows: [], rowCount: 0 }),
          }),
      },
    });
    assert.ok(f.host.textContent.includes("Results are not active"));
    assert.equal(
      f.host.querySelectorAll('tbody tr[aria-hidden="true"]').length,
      0
    );
    await f.mount({
      options: {
        queryOptions: (input) =>
          f.query.queryOptions({
            queryKey: ["pending", input],
            queryFn: () => new Promise(() => {}),
          }),
      },
    });
    assert.equal(
      f.host.querySelectorAll('tbody tr[aria-hidden="true"]').length,
      5
    );
    assert.equal(
      f.host.querySelector("table").getAttribute("aria-busy"),
      "true"
    );
  } finally {
    await f.dispose();
  }
});

test("async loading, refreshing, updating and paused announcements are screen-reader-only without a status badge", async () => {
  const f = await createFixture();
  const pending = [];
  const rows = { rows: [{ id: "a", name: "Ada" }], rowCount: 1 };
  const wasOnline = f.query.onlineManager.isOnline();
  try {
    await f.mount({
      options: {
        queryOptions: (input) =>
          f.query.queryOptions({
            queryKey: ["quiet-feedback", input],
            placeholderData: (previous) => previous,
            queryFn: () => new Promise((resolve) => pending.push(resolve)),
          }),
      },
    });
    const verify = (text, busy = "true") => {
      const announcement = f.host.querySelector(
        '[role="status"][aria-live="polite"]'
      );
      assert.ok(
        Boolean(announcement),
        "Accessible async announcement remains available"
      );
      assert.equal(announcement.textContent, text);
      assert.ok(
        announcement.classList.contains("sr-only"),
        "Async text must not occupy a visible layout row"
      );
      assert.equal(f.host.querySelectorAll('[data-slot="badge"]').length, 0);
      assert.equal(
        f.host.querySelector("table").getAttribute("aria-busy"),
        busy
      );
    };
    verify("Loading results");
    assert.equal(
      f.host.querySelectorAll('tbody tr[aria-hidden="true"]').length,
      5
    );
    await f.React.act(async () => pending.shift()(rows));
    await f.settle();
    assert.ok(
      f.host.querySelector('[role="status"][aria-live="polite"]') === null,
      "Ready state has no async announcement"
    );
    let refresh;
    await f.React.act(async () => {
      refresh = f.grid.query.refetch();
    });
    await f.settle();
    verify("Refreshing results");
    assert.ok(f.host.querySelector("tbody").textContent.includes("Ada"));
    await f.React.act(async () => {
      pending.shift()(rows);
      await refresh;
    });
    await f.settle();
    await f.React.act(async () => f.grid.setFilter("search", "updated"));
    await f.settle();
    verify("Updating results. Previous rows are shown temporarily.");
    assert.ok(f.host.querySelector("tbody").textContent.includes("Ada"));
    await f.React.act(async () => pending.shift()(rows));
    await f.settle();
    assert.equal(
      f.host.querySelector("table").getAttribute("aria-busy"),
      "false"
    );
    let pausedRefresh;
    await f.React.act(async () => {
      f.query.onlineManager.setOnline(false);
      pausedRefresh = f.grid.query.refetch();
    });
    await f.settle();
    verify("Waiting for a network connection", "false");
    assert.ok(f.host.querySelector("tbody").textContent.includes("Ada"));
    await f.React.act(async () => f.query.onlineManager.setOnline(true));
    await f.settle();
    await f.React.act(async () => {
      pending.shift()(rows);
      await pausedRefresh;
    });
    await f.settle();
  } finally {
    await f.React.act(async () => f.query.onlineManager.setOnline(wasOnline));
    await f.dispose();
  }
});
