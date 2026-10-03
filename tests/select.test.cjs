const assert = require("node:assert/strict");
const test = require("node:test");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { createJiti } = require("jiti");

const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});
const el = React.createElement;

test("registry Select preserves labels, selected values, form names, and disabled semantics", () => {
  const { Select, SelectTrigger, SelectValue } = jiti(
    "../registry/new-york/select.tsx"
  );
  const html = renderToStaticMarkup(
    el(
      Select,
      {
        defaultValue: "apple",
        disabled: true,
        items: [{ label: "Apple", value: "apple" }],
        name: "fruit",
      },
      el(SelectTrigger, { "aria-label": "Fruit" }, el(SelectValue))
    )
  );
  assert.match(html, /role="combobox"/);
  assert.match(html, /aria-label="Fruit"/);
  assert.match(html, /disabled=""/);
  assert.match(html, /Apple/);
  assert.match(html, /name="fruit"/);
});

test("Select playground code escapes placeholders and preserves size, animation and disabled settings", () => {
  const { getSelectCode, getSelectDefaults } = jiti(
    "../lib/select-playground.ts"
  );
  const code = getSelectCode({
    ...getSelectDefaults(),
    animated: false,
    disabled: true,
    placeholder: 'Pick "fruit" <now>',
    size: "sm",
  });
  assert.ok(code.includes('placeholder={"Pick \\"fruit\\" <now>"}'));
  assert.ok(code.includes('size="sm"'));
  assert.ok(code.includes("animated={false}"));
  assert.ok(code.includes(" disabled"));
  assert.ok(code.includes("<SelectGroup>"));
});
