const assert = require("node:assert/strict");
const test = require("node:test");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { createJiti } = require("jiti");
const jiti = createJiti(__filename, {
  fsCache: false,
  jsx: { runtime: "automatic" },
});

test("DateTime portable stories compose representative valid and invalid inputs", async () => {
  const { composeStories } = await import("@storybook/react");
  const stories = composeStories(
    jiti("../registry/new-york/date-time.stories.tsx")
  );
  assert.match(
    renderToStaticMarkup(React.createElement(stories.Default)),
    /<time/
  );
  assert.match(
    renderToStaticMarkup(React.createElement(stories.Invalid)),
    /Invalid timestamp/
  );
  assert.match(
    renderToStaticMarkup(React.createElement(stories.Localized)),
    /—/
  );
});
