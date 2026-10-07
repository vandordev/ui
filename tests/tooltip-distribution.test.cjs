const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");
const { createJiti } = require("jiti");
const registry = require("../registry.json");

test("Tooltip artifacts preserve the source, consumer dependencies, alias targets, and optional stories isolation", () => {
  for (const name of ["tooltip", "tooltip-stories"]) {
    const item = registry.items.find((entry) => entry.name === name);
    const artifact = JSON.parse(readFileSync(`public/r/${name}.json`, "utf-8"));
    assert.equal(artifact.type, item.type);
    assert.deepEqual(artifact.dependencies ?? [], item.dependencies ?? []);
    assert.deepEqual(artifact.registryDependencies ?? [], []);
    assert.equal(artifact.files.length, 1);
    const [{ content, ...metadata }] = artifact.files;
    assert.deepEqual(metadata, item.files[0]);
    assert.equal(metadata.target, undefined);
    assert.equal(content, readFileSync(metadata.path, "utf-8"));
    if (name === "tooltip") {
      assert.ok(artifact.dependencies.includes("motion@^12.38.0"));
      assert.match(content, /^"use client";/);
      assert.match(content, /Copyright \(c\) 2023 shadcn/);
      assert.doesNotMatch(content, /from ["']@\//);
      assert.ok(
        !artifact.dependencies.some((dep) => dep.includes("storybook"))
      );
    } else {
      assert.equal(artifact.type, "registry:item");
      assert.deepEqual(artifact.dependencies ?? [], []);
      assert.deepEqual(artifact.devDependencies ?? [], []);
    }
  }
});

test("Tooltip portable stories compose against public imports and expose meaningful args", async () => {
  const { composeStories } = await import("@storybook/react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const jiti = createJiti(__filename, {
    fsCache: false,
    jsx: { runtime: "automatic" },
  });
  const stories = composeStories(
    jiti("../registry/new-york/tooltip.stories.tsx")
  );
  for (const name of [
    "Playground",
    "InitiallyOpen",
    "DisabledTooltip",
    "WithoutAnimation",
    "WithoutArrow",
    "LongContent",
    "SharedDelay",
    "Controlled",
    "IconOnly",
  ]) {
    assert.equal(typeof stories[name], "function");
    assert.match(
      renderToStaticMarkup(stories[name]()),
      /data-slot="tooltip-trigger"/
    );
  }
  assert.match(
    renderToStaticMarkup(stories.IconOnly()),
    /aria-label="Save changes"/
  );
  assert.doesNotMatch(
    renderToStaticMarkup(stories.DisabledTooltip()),
    /disabled=""/
  );
});
