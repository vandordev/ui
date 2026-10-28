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

test("Select portable stories compose the controlled field and Drawer fixture", async () => {
  const { composeStories } = await import("@storybook/react");
  const stories = composeStories(
    jiti("../registry/new-york/select.stories.tsx")
  );
  const controlled = renderToStaticMarkup(el(stories.Controlled));
  assert.match(controlled, /aria-label="Fruit"/);
  assert.match(controlled, /Selected: None/);
  const drawer = renderToStaticMarkup(el(stories.InsideDrawer));
  assert.match(drawer, /Open selection drawer/);
});

test("Select tolerates empty unlabeled groups from untyped consumers during SSR", () => {
  const { Select } = jiti("../registry/new-york/select.tsx");
  for (const data of [
    [{ items: [] }],
    [{ items: [] }, { items: [] }, { label: "Apple", value: "apple" }],
  ]) {
    const html = renderToStaticMarkup(
      el(Select, { "aria-label": "Fruit", data, placeholder: "Choose fruit" })
    );
    assert.match(html, /role="combobox"/);
    assert.match(html, /Choose fruit/);
  }
});

test("Select resolves flat and grouped labels without leaking wrapper props to the trigger", () => {
  const { Select } = jiti("../registry/new-york/select.tsx");
  assert.equal(typeof Select, "function");
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
      el(Select, {
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

test("Select preserves empty placeholders, numeric values and multiple labels", () => {
  const { Select } = jiti("../registry/new-york/select.tsx");
  assert.equal(typeof Select, "function");
  assert.match(
    renderToStaticMarkup(
      el(Select, {
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
  assert.match(renderToStaticMarkup(el(Select, { data, value: 0 })), /Zero/);
  const html = renderToStaticMarkup(
    el(Select, { data, multiple: true, value: [0, 1] })
  );
  assert.match(html, /Zero/);
  assert.match(html, /One/);
});

test("Select visible labels support floating and static modes without overriding caller naming", () => {
  const { Select } = jiti("../registry/new-york/select.tsx");
  const props = {
    data: [{ label: "Pear", value: "pear" }],
    label: "Fruit",
    placeholder: "Choose",
  };
  const floating = renderToStaticMarkup(el(Select, props));
  assert.match(floating, /<label[^>]*id="[^"]+"[^>]*>Fruit<\/label>/);
  assert.match(floating, /aria-labelledby="[^"]+"/);
  assert.match(floating, /<fieldset aria-hidden="true"/);
  const staticMarkup = renderToStaticMarkup(
    el(Select, { ...props, labelStyle: "static" })
  );
  assert.match(staticMarkup, /<label[^>]*>Fruit<\/label>/);
  assert.doesNotMatch(staticMarkup, /<fieldset aria-hidden="true"/);
  const explicit = renderToStaticMarkup(
    el(Select, { ...props, "aria-label": "Produce selector" })
  );
  assert.match(explicit, /aria-label="Produce selector"/);
  assert.doesNotMatch(explicit, /aria-labelledby="[^"]+"/);
});

test("registry SelectRoot preserves labels, selected values, form names, and disabled semantics", () => {
  const { SelectRoot, SelectTrigger, SelectValue } = jiti(
    "../registry/new-york/select.tsx"
  );
  const html = renderToStaticMarkup(
    el(
      SelectRoot,
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
  assert.ok(code.includes("<Select"));
  assert.ok(code.includes("data={items}"));
});
