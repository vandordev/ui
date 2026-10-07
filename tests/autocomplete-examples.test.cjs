const assert = require("node:assert/strict");
const { setTimeout: delay } = require("node:timers/promises");
const { test } = require("node:test");
const { createAutocompleteFixture } = require("./autocomplete-ui-fixture.cjs");

test("async example rejects stale results and has deterministic error feedback", async () => {
  const f = await createAutocompleteFixture();
  try {
    const { AutocompleteAsyncDemo } = f.jiti(
      "../examples/autocomplete-async-demo.tsx"
    );
    await f.render(f.React.createElement(AutocompleteAsyncDemo));
    await f.input("slow");
    await f.React.act(async () => {
      await delay(320);
    });
    await f.input("bea");
    await f.React.act(async () => {
      await delay(850);
    });
    assert.ok(document.body.textContent.includes("Bea Chen"));
    assert.ok(
      ![...document.querySelectorAll('[role="option"]')].some((node) =>
        node.textContent.includes("Ada")
      )
    );
    await f.input("error");
    await f.React.act(async () => {
      await delay(500);
    });
    assert.match(
      document.querySelector('[role="status"]').textContent,
      /unavailable/i
    );
    assert.ok(!document.body.textContent.includes("No results found"));
  } finally {
    await f.cleanup();
  }
});
