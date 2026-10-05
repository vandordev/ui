const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");
const registry = require("../registry.json");

for (const name of [
  "dialog",
  "drawer",
  "popover",
  "select",
  "drawer-stories",
  "select-stories",
]) {
  test(`${name} artifact preserves its manifest and distributable source`, () => {
    const item = registry.items.find((entry) => entry.name === name);
    const artifact = JSON.parse(readFileSync(`public/r/${name}.json`, "utf-8"));
    assert.equal(artifact.type, item.type);
    assert.deepEqual(artifact.dependencies ?? [], item.dependencies ?? []);
    assert.deepEqual(
      artifact.registryDependencies ?? [],
      item.registryDependencies ?? []
    );
    assert.equal(artifact.files.length, item.files.length);
    if (["dialog", "drawer", "popover", "select"].includes(name)) {
      assert.equal(
        item.files[0].target,
        undefined,
        "component follows the consumer UI alias"
      );
    }
    for (const [index, file] of artifact.files.entries()) {
      const { content, ...metadata } = file;
      assert.deepEqual(metadata, item.files[index]);
      assert.equal(content, readFileSync(file.path, "utf-8"));
    }
    if (name.endsWith("-stories")) {
      assert.equal(artifact.type, "registry:item");
      assert.deepEqual(artifact.dependencies ?? [], []);
      assert.deepEqual(artifact.registryDependencies ?? [], []);
      assert.equal(artifact.files.length, 1);
      assert.equal(artifact.files[0].target, undefined);
    }
  });
}
