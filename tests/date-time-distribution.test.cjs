const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { test } = require("node:test");
const registry = require("../registry.json");

test("DateTime artifacts match their complete family closure and optional stories stay core-free", () => {
  for (const name of ["date-time", "date-time-stories"]) {
    const item = registry.items.find((entry) => entry.name === name);
    const artifact = JSON.parse(readFileSync(`public/r/${name}.json`, "utf-8"));
    assert.equal(artifact.files.length, item.files.length);
    assert.deepEqual(
      artifact.registryDependencies ?? [],
      item.registryDependencies ?? []
    );
    assert.deepEqual(artifact.dependencies ?? [], item.dependencies ?? []);
    for (const file of artifact.files) {
      const { content, ...metadata } = file;
      assert.deepEqual(
        metadata,
        item.files.find((entry) => entry.path === file.path)
      );
      assert.equal(content, readFileSync(file.path, "utf-8"));
      assert.ok(file.target.startsWith("components/date-time/"));
      assert.doesNotMatch(content, /@repo\/|@\/|@tanstack\/|date-fns/);
    }
    if (name.endsWith("-stories")) {
      assert.equal(artifact.files.length, 1);
      assert.deepEqual(artifact.registryDependencies ?? [], []);
      assert.deepEqual(artifact.dependencies ?? [], []);
    } else {
      assert.equal(artifact.files.length, 3);
      assert.ok(
        !artifact.files.some((file) => file.path.endsWith(".stories.tsx"))
      );
      const utils = artifact.files.find((file) =>
        file.path.endsWith("date-time-utils.ts")
      );
      assert.doesNotMatch(utils.content, /from ["']react["']/);
      const component = artifact.files.find((file) =>
        file.path.endsWith("date-time.tsx")
      );
      assert.match(component.content, /^"use client";/);
    }
  }
});
