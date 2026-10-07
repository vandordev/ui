/* eslint-disable require-await, sort-keys */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createAutocompleteFixture } = require("./autocomplete-ui-fixture.cjs");
test("native forms serialize committed values in all modes and reset defaults", async () => {
  const f = await createAutocompleteFixture();
  try {
    const { Autocomplete } = f.jiti("../registry/new-york/autocomplete.tsx");
    const user = { id: "ada", name: "Ada" };
    const identity = {
      getItemLabel: (item) => item.name,
      getItemValue: (item) => item.id,
    };
    const field = (props) =>
      f.React.createElement(Autocomplete, {
        animated: false,
        items: [],
        ...props,
      });
    await f.render(
      f.React.createElement(
        "form",
        { id: "test-form" },
        field({ defaultValue: "React", label: "Text", name: "text" }),
        field({
          defaultInputValue: "draft",
          defaultValue: ["React", "Vue"],
          label: "Tags",
          multiple: true,
          name: "tags",
        }),
        field({
          name: "person",
          label: "Person",
          mode: "selection",
          items: [user],
          ...identity,
          defaultValue: user,
        }),
        field({
          name: "people",
          label: "People",
          mode: "selection",
          multiple: true,
          items: [user],
          ...identity,
          defaultValue: [user],
        }),
        field({
          defaultValue: "Excluded",
          disabled: true,
          label: "Disabled",
          name: "disabled",
        }),
        field({
          defaultValue: "Included",
          label: "Read only",
          name: "readonly",
          readOnly: true,
        }),
        field({
          items: [user],
          label: "Empty",
          mode: "selection",
          name: "empty",
          ...identity,
        }),
        field({ label: "Empty tags", multiple: true, name: "empty-many" })
      )
    );
    const form = document.querySelector("form");
    const data = new FormData(form);
    assert.deepEqual(data.getAll("tags"), ["React", "Vue"]);
    assert.deepEqual(data.getAll("people"), ["ada"]);
    assert.equal(data.get("person"), "ada");
    assert.equal(data.get("text"), "React");
    assert.equal(data.get("readonly"), "Included");
    assert.equal(data.get("disabled"), null);
    assert.equal(data.get("empty"), "");
    assert.deepEqual(data.getAll("empty-many"), []);
    await f.input("Updated");
    assert.equal(new FormData(form).get("text"), "Updated");
    await f.React.act(async () => form.reset());
    assert.equal(new FormData(form).get("text"), "React");
    assert.equal(document.querySelector('[aria-label="Tags"]').value, "draft");
  } finally {
    await f.cleanup();
  }
});

test("required checks committed selection and external form ownership", async () => {
  const f = await createAutocompleteFixture();
  try {
    const { Autocomplete } = f.jiti("../registry/new-york/autocomplete.tsx");
    await f.render(
      f.React.createElement(
        f.React.Fragment,
        null,
        f.React.createElement("form", { id: "external" }),
        f.React.createElement(Autocomplete, {
          animated: false,
          form: "external",
          items: ["React"],
          label: "Framework",
          mode: "selection",
          name: "framework",
          required: true,
        })
      )
    );
    await f.input("Not a selection");
    const input = document.querySelector('[role="combobox"]');
    assert.equal(input.checkValidity(), false);
    assert.equal(
      new FormData(document.querySelector("form")).get("framework"),
      ""
    );
    await f.React.act(async () => document.querySelector("form").reset());
    assert.equal(input.value, "");
  } finally {
    await f.cleanup();
  }
});

test("native reset restores an explicit initial selection query after replacement", async () => {
  const f = await createAutocompleteFixture();
  try {
    const { Autocomplete } = f.jiti("../registry/new-york/autocomplete.tsx");
    await f.render(
      f.React.createElement(
        "form",
        null,
        f.React.createElement(Autocomplete, {
          mode: "selection",
          items: ["Ada", "Bea"],
          defaultValue: "Ada",
          defaultInputValue: "initial search",
          label: "Person",
          animated: false,
        })
      )
    );
    await f.input("Be");
    await f.React.act(async () =>
      document.querySelector('[role="option"]').click()
    );
    assert.equal(document.querySelector('[role="combobox"]').value, "Bea");
    await f.React.act(async () => document.querySelector("form").reset());
    assert.equal(
      document.querySelector('[role="combobox"]').value,
      "initial search"
    );
    assert.equal(
      document.querySelector('[role="combobox"]').getAttribute("aria-expanded"),
      "false"
    );
  } finally {
    await f.cleanup();
  }
});
