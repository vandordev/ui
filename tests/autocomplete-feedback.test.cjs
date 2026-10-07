const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createAutocompleteFixture } = require("./autocomplete-ui-fixture.cjs");

test("compact feedback uses public Loading and hint blocks old options", async () => {
  const f = await createAutocompleteFixture();
  try {
    const { Autocomplete } = f.jiti("../registry/new-york/autocomplete.tsx");
    await f.render(
      f.React.createElement(Autocomplete, {
        items: ["Ada"],
        defaultOpen: true,
        loading: true,
        animated: false,
        loadingProps: { variant: "dots", size: 16 },
        label: "People",
      })
    );
    assert.ok(
      document.querySelector('[data-slot="loading"]') !== null,
      "Public Loading renders"
    );
    assert.equal(
      document.querySelectorAll('[data-slot="autocomplete-item"]').length,
      0
    );
    await f.render(
      f.React.createElement(Autocomplete, {
        items: ["Ada"],
        defaultOpen: true,
        hintMessage: "Enter two characters",
        animated: false,
        label: "People",
      })
    );
    assert.match(
      document.querySelector('[data-slot="autocomplete-feedback"]').textContent,
      /Enter two/
    );
    assert.equal(
      document.querySelectorAll('[data-slot="autocomplete-item"]').length,
      0
    );
    await f.render(
      f.React.createElement(Autocomplete, {
        items: ["Ada"],
        defaultOpen: true,
        backgroundLoading: true,
        animated: false,
        label: "People",
      })
    );
    assert.equal(
      document.querySelectorAll('[data-slot="autocomplete-item"]').length,
      1
    );
  } finally {
    await f.cleanup();
  }
});
