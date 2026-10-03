const assert = require("node:assert/strict");
const test = require("node:test");
const { createJiti } = require("jiti");
const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
});

test("command search matches labels and URL keywords case-insensitively", () => {
  const { matchesCommandSearch } = jiti("../lib/command-search.ts");
  const item = {
    keywords: ["component", "/docs/components/button"],
    value: "Components Button",
  };
  assert.equal(matchesCommandSearch(item, "BUTTON"), true);
  assert.equal(matchesCommandSearch(item, "/docs/components"), true);
  assert.equal(matchesCommandSearch(item, ""), true);
  assert.equal(matchesCommandSearch(item, "unknown-component"), false);
  assert.equal(matchesCommandSearch({ value: "Introduction" }, "intro"), true);
});
