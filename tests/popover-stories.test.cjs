const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");
const { createJiti } = require("jiti");
const { renderToStaticMarkup } = require("react-dom/server");
const registry = require("../registry.json");
const jiti = createJiti(__filename, {
  fsCache: false,
  jsx: { runtime: "automatic" },
});

test("Popover stories are optional, portable, and do not overwrite the component", async () => {
  const item = registry.items.find(({ name }) => name === "popover-stories");
  assert.equal(item.type, "registry:item");
  assert.deepEqual(item.registryDependencies ?? [], []);
  assert.deepEqual(item.dependencies ?? [], []);
  assert.deepEqual(item.files, [
    { path: "registry/new-york/popover.stories.tsx", type: "registry:ui" },
  ]);
  const component = registry.items.find(({ name }) => name === "popover");
  assert.equal(
    component.files[0].target,
    undefined,
    "component and colocated stories follow the same configured UI alias"
  );
  const artifact = JSON.parse(
    readFileSync("public/r/popover-stories.json", "utf-8")
  );
  assert.equal(
    artifact.files[0].content,
    readFileSync(item.files[0].path, "utf-8")
  );
  const { composeStories } = await import("@storybook/react");
  const stories = composeStories(
    jiti("../registry/new-york/popover.stories.tsx")
  );
  for (const name of [
    "Playground",
    "Disabled",
    "InitiallyOpen",
    "WithoutAnimation",
    "LongContent",
    "Controlled",
  ]) {
    assert.equal(typeof stories[name], "function");
    assert.match(
      renderToStaticMarkup(stories[name]()),
      /data-slot="popover-trigger"/
    );
  }
  assert.match(renderToStaticMarkup(stories.Disabled()), /disabled=""/);
});

test("generated Popover artifact matches source and declares Motion without stories packages", () => {
  const artifact = JSON.parse(readFileSync("public/r/popover.json", "utf-8"));
  assert.equal(
    artifact.files[0].content,
    readFileSync("registry/new-york/popover.tsx", "utf-8")
  );
  assert.ok(artifact.dependencies.includes("motion@^12.38.0"));
  assert.equal(artifact.files.length, 1);
  assert.ok(!artifact.dependencies.some((dep) => dep.includes("storybook")));
});
