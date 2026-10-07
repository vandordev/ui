const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { test } = require("node:test");
const registry = require("../registry.json");

for (const name of [
  "data-grid",
  "data-grid-schema",
  "data-grid-stories",
  "button",
  "loading",
  "error-state",
]) {
  test(`${name} generated artifact exactly matches source and manifest`, () => {
    const item = registry.items.find((item) => item.name === name);
    const artifact = JSON.parse(readFileSync(`public/r/${name}.json`, "utf8"));
    for (const key of [
      "type",
      "dependencies",
      "registryDependencies",
      "devDependencies",
    ])
      assert.deepEqual(artifact[key] ?? [], item[key] ?? []);
    assert.equal(artifact.files.length, item.files.length);
    for (const [index, file] of artifact.files.entries()) {
      assert.equal(file.path, item.files[index].path);
      assert.equal(file.target, item.files[index].target);
      assert.equal(file.content, readFileSync(file.path, "utf8"));
    }
  });
}

test("DataGrid dependency closure has no feature catalog, stories, cycles or incompatible shared targets", () => {
  const visiting = new Set(),
    visited = new Set(),
    files = new Map();
  function visit(name) {
    assert.equal(visiting.has(name), false, `Cycle at ${name}`);
    if (visited.has(name)) return;
    visiting.add(name);
    const item = registry.items.find((item) => item.name === name);
    assert.ok(Boolean(item), name);
    for (const file of item.files) {
      const target = file.target ?? file.path.split("/").pop();
      const content = readFileSync(file.path, "utf8");
      if (files.has(target))
        assert.equal(files.get(target), content, `Shared target ${target}`);
      files.set(target, content);
      assert.equal(
        content.includes("@/components/"),
        false,
        `Website import ${file.path}`
      );
    }
    for (const url of item.registryDependencies ?? [])
      visit(url.split("/").pop().replace(".json", ""));
    visiting.delete(name);
    visited.add(name);
  }
  visit("data-grid");
  for (const name of [
    "loading",
    "accordion",
    "calendar",
    "date-range-picker",
    "data-grid-stories",
  ])
    assert.equal(visited.has(name), false, name);
  assert.ok(files.size < 25, "Small foundation graph, not a feature catalog");
  const schema = readFileSync("registry/new-york/data-grid-schema.ts", "utf8");
  assert.equal(/from ["'](?:react|@tanstack\/react)/.test(schema), false);
  const stories = registry.items.find(
    (item) => item.name === "data-grid-stories"
  );
  assert.deepEqual(stories.registryDependencies ?? [], []);
  assert.deepEqual(stories.dependencies ?? [], []);
  assert.equal(stories.files.length, 1);
  assert.equal(stories.files[0].target, "components/data-grid/data-grid.stories.tsx");
  for (const name of ["button", "input", "input-search"]) {
    const item = registry.items.find((item) => item.name === name);
    assert.equal(
      item.files[0].target,
      undefined,
      `${name} follows the consumer UI alias`
    );
  }
});
