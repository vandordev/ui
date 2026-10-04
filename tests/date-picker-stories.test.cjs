const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { createJiti } = require("jiti");
const registry = require("../registry.json");

const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});

test("picker generated code preserves explicit motion opt-out", () => {
  const { getInputPlaygroundCode, getInputPlaygroundDefaults } = jiti(
    "../lib/input-component-props.ts"
  );
  for (const name of ["date-picker", "date-range-picker"]) {
    const code = getInputPlaygroundCode(name, {
      ...getInputPlaygroundDefaults(name),
      motion: false,
    });
    assert.ok(code.includes("motion={false}"));
  }
});

test("date picker portable stories compose and Controls affect public props", async () => {
  const { composeStories } = await import("@storybook/react");
  for (const name of ["date-picker", "date-range-picker"]) {
    const stories = composeStories(
      jiti(`../registry/new-york/${name}.stories.tsx`)
    );
    for (const story of Object.values(stories)) {
      assert.match(
        renderToStaticMarkup(React.createElement(story)),
        /data-slot="popover-trigger"/
      );
    }
    const html = renderToStaticMarkup(
      React.createElement(stories.Playground, {
        disabled: true,
        label: "Custom period",
        motion: false,
        placeholder: "Choose",
      })
    );
    assert.match(html, /Custom period/);
    assert.match(html, /Choose/);
    assert.match(html, /disabled=""/);
  }
});

test("picker artifacts match source and stories install separately", () => {
  for (const name of [
    "date-picker",
    "date-range-picker",
    "date-picker-stories",
    "date-range-picker-stories",
  ]) {
    const item = registry.items.find((entry) => entry.name === name);
    const artifact = JSON.parse(readFileSync(`public/r/${name}.json`, "utf-8"));
    for (const file of artifact.files) {
      assert.equal(file.content, readFileSync(file.path, "utf-8"));
    }
    if (name.endsWith("-stories")) {
      assert.deepEqual(item.dependencies ?? [], []);
      assert.deepEqual(item.registryDependencies ?? [], []);
      assert.equal(item.files[0].target, undefined);
    } else {
      assert.ok(!item.files.some((file) => file.path.endsWith(".stories.tsx")));
      assert.ok(
        item.registryDependencies.some((dependency) =>
          dependency.endsWith("/popover.json")
        )
      );
    }
  }
});
