const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { test } = require("node:test");
const registry = require("../registry.json");

test("autocomplete artifacts match every support file and isolate optional stories", () => {
  for (const name of ["autocomplete", "autocomplete-query", "autocomplete-stories"]) {
    const manifest = registry.items.find((item) => item.name === name);
    const artifact = JSON.parse(readFileSync(`public/r/${name}.json`, "utf-8"));
    assert.equal(artifact.type, manifest.type);
    assert.deepEqual(artifact.dependencies ?? [], manifest.dependencies ?? []);
    assert.deepEqual(artifact.registryDependencies ?? [], manifest.registryDependencies ?? []);
    assert.equal(artifact.files.length, manifest.files.length);
    for (const file of artifact.files) {
      const { content, ...metadata } = file;
      assert.deepEqual(
        metadata,
        manifest.files.find((entry) => entry.path === file.path)
      );
      assert.equal(content, readFileSync(file.path, "utf-8"));
      assert.ok(file.target.startsWith("components/autocomplete/"));
      assert.doesNotMatch(content, /from ["']@\//);
      assert.doesNotMatch(
        content,
        /@base-ui\/react\/(internals|combobox\/(root|input)\/)/
      );
    }
    if (name === "autocomplete") {
      assert.equal(artifact.files.length, 7);
      assert.ok(artifact.registryDependencies.includes("https://vandor-ui.vercel.app/r/loading.json"));
      assert.ok(!artifact.dependencies.some((entry) => entry.includes("query")));
      assert.doesNotMatch(artifact.files.find((file) => file.target.endsWith("/index.ts")).content, /autocomplete-query|use-autocomplete-query/);
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
    } else if (name === "autocomplete-query") {
      assert.equal(artifact.files.length, 6);
      assert.ok(artifact.dependencies.includes("@tanstack/react-query@^5.104.1"));
    } else {
      assert.equal(artifact.files.length, 1);
      assert.deepEqual(artifact.dependencies ?? [], []);
      assert.match(artifact.files[0].content, /from "\.\/autocomplete"/);
    }
  }
});
