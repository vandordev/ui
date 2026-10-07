const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createAutocompleteFixture } = require("./autocomplete-ui-fixture.cjs");

test("user scroll near bottom loads once and footer retains options on error", async () => {
  const f = await createAutocompleteFixture();
  try {
    const { Autocomplete } = f.jiti("../registry/new-york/autocomplete.tsx");
    let loads = 0;
    let finish;
    const pagination = { hasNextPage: true, fetchingNextPage: false, onLoadMore: () => { loads += 1; return new Promise((resolve) => { finish = resolve; }); } };
    const render = (page) => f.render(f.React.createElement(Autocomplete, { items: ["Ada", "Grace"], defaultOpen: true, animated: false, pagination: page }));
    await render(pagination);
    assert.equal(loads, 0, "Mount does not drain pages");
    const list = document.querySelector('[data-slot="autocomplete-list"]');
    for (const [name, value] of Object.entries({ clientHeight: 100, scrollHeight: 300, scrollTop: 190 })) { Object.defineProperty(list, name, { configurable: true, value }); }
    await f.React.act(async () => { list.dispatchEvent(new Event("scroll", { bubbles: true })); list.dispatchEvent(new Event("scroll", { bubbles: true })); });
    assert.equal(loads, 1);
    assert.equal(document.querySelectorAll('[data-slot="autocomplete-item"]').length, 2);
    await f.React.act(async () => finish());
    let retries = 0;
    await render({ ...pagination, error: "Page failed", onRetry: () => { retries += 1; } });
    await f.React.act(async () => list.dispatchEvent(new Event("scroll", { bubbles: true })));
    assert.equal(loads, 1, "Error suppresses auto retry");
    const button = document.querySelector('[data-slot="autocomplete-pagination"] button');
    assert.equal(button.type, "button");
    assert.equal(button.textContent, "Retry");
    await f.React.act(async () => button.click());
    assert.equal(retries, 1);
    assert.equal(document.querySelectorAll('[data-slot="autocomplete-item"]').length, 2);
  } finally { await f.cleanup(); }
});
