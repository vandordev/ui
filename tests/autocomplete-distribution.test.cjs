const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { test } = require("node:test");
const registry = require("../registry.json");

test("autocomplete artifacts match every support file and isolate optional stories", () => {
  for (const name of ["autocomplete", "autocomplete-stories"]) {
    const manifest = registry.items.find((item) => item.name === name);
    const artifact = JSON.parse(readFileSync(`public/r/${name}.json`, "utf-8"));
    assert.equal(artifact.type, manifest.type);
    assert.deepEqual(artifact.dependencies ?? [], manifest.dependencies ?? []);
    assert.deepEqual(artifact.registryDependencies ?? [], []);
    assert.equal(artifact.files.length, manifest.files.length);
    for (const file of artifact.files) {
      const { content, ...metadata } = file;
      assert.deepEqual(
        metadata,
        manifest.files.find((entry) => entry.path === file.path)
      );
      assert.equal(content, readFileSync(file.path, "utf-8"));
      assert.equal(file.target, undefined);
      assert.doesNotMatch(content, /from ["']@\//);
      assert.doesNotMatch(
        content,
        /@base-ui\/react\/(internals|combobox\/(root|input)\/)/
      );
    }
    if (name === "autocomplete") {
      assert.equal(artifact.files.length, 4);
      assert.ok(artifact.dependencies.includes("@base-ui/react@^1.8.0"));
      assert.ok(artifact.dependencies.includes("motion@^12.38.0"));
      assert.ok(
        !artifact.dependencies.some((entry) => entry.includes("storybook"))
      );
      for (const file of artifact.files.filter((entry) =>
        entry.path.endsWith(".tsx")
      )) {
        assert.match(file.content, /^"use client";/);
      }
    } else {
      assert.equal(artifact.files.length, 1);
      assert.deepEqual(artifact.dependencies ?? [], []);
      assert.match(artifact.files[0].content, /from "\.\/autocomplete"/);
    }
  }
});
