const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { renderToStaticMarkup } = require("react-dom/server");
const { createJiti } = require("jiti");
const artifact = require("../public/r/button-stories.json");
const registry = require("../registry.json");

const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});

test("stories install independently without overwriting a customized Button", () => {
  const item = registry.items.find(({ name }) => name === "button-stories");
  assert.ok(item, "optional stories item exists");
  assert.equal(item.type, "registry:item");
  assert.deepEqual(item.registryDependencies ?? [], []);
  assert.deepEqual(item.dependencies ?? [], []);
  assert.deepEqual(item.devDependencies ?? [], []);
  assert.deepEqual(item.files, [
    {
      path: "registry/new-york/button.stories.tsx",
      type: "registry:ui",
    },
  ]);
  const button = registry.items.find(({ name }) => name === "button");
  assert.ok(
    !button.files.some(({ path: filePath }) =>
      filePath.endsWith(".stories.tsx")
    )
  );
});

test("generated stories artifact matches its manifest and distributable source", () => {
  const item = registry.items.find(({ name }) => name === "button-stories");
  assert.equal(artifact.name, item.name);
  assert.equal(artifact.type, item.type);
  assert.equal(artifact.files.length, 1);
  assert.deepEqual(artifact.registryDependencies ?? [], []);
  assert.deepEqual(artifact.dependencies ?? [], []);
  assert.deepEqual(artifact.devDependencies ?? [], []);
  const [file] = artifact.files;
  assert.deepEqual({ path: file.path, type: file.type }, item.files[0]);
  assert.equal(
    file.content,
    readFileSync(path.join(__dirname, "..", file.path), "utf-8")
  );
});

test("portable stories compose real Button states and accept consumer overrides", async () => {
  const { composeStories } = await import("@storybook/react");
  const storyModule = jiti("../registry/new-york/button.stories.tsx");
  const stories = composeStories(storyModule);
  for (const name of [
    "Playground",
    "Variants",
    "Sizes",
    "Disabled",
    "Loading",
    "WithIcon",
    "IconOnly",
    "AsLink",
    "WithoutPressAnimation",
  ]) {
    assert.equal(typeof stories[name], "function", name);
    assert.match(renderToStaticMarkup(stories[name]()), /data-slot="button"/);
  }

  const custom = renderToStaticMarkup(
    stories.Playground({ children: "Publish", size: "lg", variant: "outline" })
  );
  assert.match(custom, /data-size="lg"/);
  assert.match(custom, /data-variant="outline"/);
  assert.match(custom, />Publish<\/button>/);
  assert.match(renderToStaticMarkup(stories.Disabled()), /disabled=""/);
  const loading = renderToStaticMarkup(stories.Loading());
  assert.match(loading, /aria-busy="true"/);
  assert.match(loading, /disabled=""/);
  assert.match(
    renderToStaticMarkup(stories.IconOnly()),
    /aria-label="Add item"/
  );
  const link = renderToStaticMarkup(stories.AsLink());
  assert.equal(
    [
      ...renderToStaticMarkup(stories.Variants()).matchAll(
        /data-slot="button"/g
      ),
    ].length,
    6
  );
  assert.equal(
    [...renderToStaticMarkup(stories.Sizes()).matchAll(/data-slot="button"/g)]
      .length,
    8
  );
  assert.match(link, /<a[^>]*href="#button-story"/);
  assert.doesNotMatch(link, /<button/);
});
