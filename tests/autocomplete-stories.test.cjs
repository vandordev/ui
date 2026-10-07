/* eslint-disable global-require */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createAutocompleteFixture } = require("./autocomplete-ui-fixture.cjs");
test("portable stories compose and args affect real field states and multiple behavior", async () => {
  const f = await createAutocompleteFixture();
  try {
    const { composeStories } = await import("@storybook/react");
    const { renderToStaticMarkup } = require("react-dom/server");
    const stories = composeStories(
      f.jiti("../registry/new-york/autocomplete.stories.tsx")
    );
    for (const name of [
      "Playground",
      "FreeTextTags",
      "SingleSelection",
      "MultipleSelection",
      "Grouped",
      "Disabled",
      "ReadOnly",
      "Invalid",
      "Loading",
      "Error",
      "FloatingLabel",
      "RichItems",
      "LongContent",
      "Controlled",
      "Composition",
    ]) {
      assert.equal(typeof stories[name], "function");
      assert.match(renderToStaticMarkup(stories[name]()), /role="combobox"/);
    }
    const html = renderToStaticMarkup(
      stories.Playground({ disabled: true, label: "Framework" })
    );
    assert.match(html, /Framework/);
    assert.match(html, /disabled=""/);
    await f.render(
      f.React.createElement(stories.FreeTextTags, { animated: false })
    );
    await f.input("Custom");
    await f.key("Enter");
    assert.equal(
      document
        .querySelector('[data-slot="autocomplete-chip"]')
        .getAttribute("aria-label"),
      "Custom"
    );
    await f.render(
      f.React.createElement(stories.Playground, {
        animated: false,
        mode: "free-text",
        multiple: false,
      })
    );
    await f.input("Transient");
    await f.render(
      f.React.createElement(stories.Playground, {
        animated: false,
        mode: "selection",
        multiple: true,
      })
    );
    assert.equal(document.querySelector('[role="combobox"]').value, "");
  } finally {
    await f.cleanup();
  }
});
