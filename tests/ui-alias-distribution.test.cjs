const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");
const registry = require("../registry.json");

test("ordinary UI files and their supporting modules defer targets to the consumer alias", () => {
  for (const item of registry.items) {
    const artifact = JSON.parse(
      readFileSync(`public/r/${item.name}.json`, "utf-8")
    );
    for (const file of item.files.filter(
      (entry) => entry.type === "registry:ui"
    )) {
      assert.equal(file.target, undefined, `${item.name}: ${file.path}`);
      assert.equal(
        artifact.files.find((entry) => entry.path === file.path).target,
        undefined
      );
    }
  }
  const loading = registry.items.find((item) => item.name === "loading");
  assert.ok(
    loading.files.some(
      (file) => file.target === "components/loading-ui/LICENSE.md"
    )
  );
});

test("Select stories only import their installed component and declared packages", () => {
  const artifact = JSON.parse(
    readFileSync("public/r/select-stories.json", "utf-8")
  );
  const imports = [
    ...artifact.files[0].content.matchAll(/from ["']([^"']+)["']/g),
  ].map((match) => match[1]);
  assert.deepEqual(
    imports.filter((name) => name.startsWith(".")),
    ["./select"]
  );
  assert.ok(imports.includes("@base-ui/react/drawer"));
});
