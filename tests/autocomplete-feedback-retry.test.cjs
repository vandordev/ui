const assert = require("node:assert/strict");
const { setImmediate } = require("node:timers/promises");
const { test } = require("node:test");
const { createAutocompleteFixture } = require("./autocomplete-ui-fixture.cjs");

test("feedback handles rejected retry promises while retaining caller error", async () => {
  const f = await createAutocompleteFixture();
  try {
    const { Autocomplete } = f.jiti("../registry/new-york/autocomplete.tsx");
    let retries = 0;
    await f.render(
      f.React.createElement(Autocomplete, {
        animated: false,
        defaultOpen: true,
        error: "Unable to load",
        items: [],
        label: "People",
        onRetry: async () => {
          await setImmediate();
          retries += 1;
          throw new Error("Retry failed");
        },
      })
    );
    const retry = [...document.querySelectorAll("button")].find(
      (b) => b.textContent === "Retry"
    );
    assert.ok(retry);
    await f.React.act(async () => {
      retry.click();
      await setImmediate();
    });
    assert.equal(retries, 1);
    assert.match(
      document.querySelector('[data-slot="autocomplete-feedback"]').textContent,
      /Unable to load/
    );
  } finally {
    await f.cleanup();
  }
});
