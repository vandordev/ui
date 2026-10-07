const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createJiti } = require("jiti");
const { dedupeAutocompleteItems, isAutocompleteQueryEligible, validateAutocompleteQueryConfiguration } = createJiti(__filename, { fsCache: false })("../registry/new-york/autocomplete-query-state.ts");

test("eligibility rejects closed, debounce, disabled and insufficient search", () => {
  const eligible = { debouncedSearch: "ada", enabled: true, minSearchLength: 2, open: true, search: "ada" };
  assert.equal(isAutocompleteQueryEligible(eligible), true);
  for (const override of [{ open: false }, { enabled: false }, { search: "a" }, { debouncedSearch: "ad" }]) {
    assert.equal(isAutocompleteQueryEligible({ ...eligible, ...override }), false);
  }
  validateAutocompleteQueryConfiguration(0, 0);
  for (const invalid of [-1, Infinity, NaN, 2_147_483_648]) {
    assert.throws(() => validateAutocompleteQueryConfiguration(invalid, 0), RangeError);
  }
  assert.throws(() => validateAutocompleteQueryConfiguration(300, 0.5), RangeError);
});

test("dedupe preserves first identity and never mutates cached items", () => {
  const first = Object.freeze({ id: "a", label: "first" });
  const items = Object.freeze([first, { id: "b", label: "second" }, { id: "a", label: "duplicate" }]);
  const result = dedupeAutocompleteItems(items, (item) => item.id);
  assert.equal(result.length, 2);
  assert.ok(result[0] === first, "First item identity retained");
  assert.equal(items.length, 3);
});
