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

test("SelectInput resolves flat and grouped labels without leaking wrapper props to the trigger", () => {
  const { SelectInput } = jiti("../registry/new-york/select.tsx");
  assert.equal(typeof SelectInput, "function");
  const data = [
    { label: "Apple", value: "apple" },
    { items: [{ label: "Mango", value: "mango" }], label: "Tropical" },
    { label: "Pear", value: "pear" },
  ];
  for (const [value, label] of [
    ["apple", "Apple"],
    ["mango", "Mango"],
    ["pear", "Pear"],
  ]) {
    const html = renderToStaticMarkup(
      el(SelectInput, {
        "aria-label": "Fruit",
        className: "w-56",
        data,
        defaultValue: value,
        disabled: true,
        name: "fruit",
        size: "sm",
        triggerProps: { "aria-describedby": "fruit-help" },
      })
    );
    assert.match(html, new RegExp(label));
    assert.match(html, /aria-label="Fruit"/);
    assert.match(html, /aria-describedby="fruit-help"/);
    assert.match(html, /data-size="sm"/);
    assert.match(html, /class="[^"]*w-56/);
    assert.match(html, /disabled=""/);
    assert.match(html, /name="fruit"/);
    assert.ok(!html.includes('data="'));
  }
});

test("SelectInput preserves empty placeholders, numeric values and multiple labels", () => {
  const { SelectInput } = jiti("../registry/new-york/select.tsx");
  assert.equal(typeof SelectInput, "function");
  assert.match(
    renderToStaticMarkup(
      el(SelectInput, {
        "aria-label": "Fruit",
        data: [],
        placeholder: "Pick a fruit",
      })
    ),
    /Pick a fruit/
  );
  const data = [
    { label: "Zero", value: 0 },
    { label: "One", value: 1 },
  ];
  assert.match(
    renderToStaticMarkup(el(SelectInput, { data, value: 0 })),
    /Zero/
  );
  const html = renderToStaticMarkup(
    el(SelectInput, { data, multiple: true, value: [0, 1] })
  );
  assert.match(html, /Zero/);
  assert.match(html, /One/);
});

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
  assert.ok(code.includes("<SelectInput"));
  assert.ok(code.includes("data={items}"));
});
