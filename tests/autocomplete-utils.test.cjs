const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createJiti } = require("jiti");
const id = (item) => item.id;
const {
  normalizeAutocompleteTag,
  groupAutocompleteItems,
  isAutocompleteItemEqual,
} = createJiti(__filename, { fsCache: false })(
  "../registry/new-york/autocomplete-utils.ts"
);

test("tag normalization trims and rejects empty or exact duplicates", () => {
  assert.equal(normalizeAutocompleteTag("  React  ", []), "React");
  assert.equal(normalizeAutocompleteTag("   ", []), null);
  assert.equal(normalizeAutocompleteTag("React", ["React"]), null);
  assert.equal(normalizeAutocompleteTag("react", ["React"]), "react");
  assert.equal(normalizeAutocompleteTag("a,b", []), "a,b");
  const values = Object.freeze(["Vue"]);
  assert.equal(normalizeAutocompleteTag("React", values), "React");
  assert.deepEqual(values, ["Vue"]);
});

test("stable identity matches refreshed objects without comparing labels", () => {
  assert.ok(
    isAutocompleteItemEqual(
      { id: "a", name: "Ada" },
      { id: "a", name: "New" },
      id
    )
  );
  assert.ok(
    !isAutocompleteItemEqual(
      { id: "a", name: "Ada" },
      { id: "b", name: "Ada" },
      id
    )
  );
  assert.ok(isAutocompleteItemEqual("React", "React"));
});

test("ordered grouping preserves first-seen groups and filtered source order", () => {
  const items = Object.freeze([
    { group: "B", id: "a" },
    { group: "A", id: "b" },
    { group: "B", id: "c" },
  ]);
  assert.deepEqual(
    groupAutocompleteItems(items, (item) => item.group),
    [
      { items: [items[0], items[2]], label: "B" },
      { items: [items[1]], label: "A" },
    ]
  );
  assert.deepEqual(
    groupAutocompleteItems([], (item) => item.group),
    []
  );
  assert.deepEqual(groupAutocompleteItems(items), [{ items: [...items] }]);
});
