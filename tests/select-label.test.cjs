const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createAutocompleteFixture } = require("./autocomplete-ui-fixture.cjs");

test("Select static labels target their own trigger with generated and consumer IDs", async () => {
  const f = await createAutocompleteFixture();
  try {
    const { Select } = f.jiti("../registry/new-york/select.tsx");
    await f.render(
      f.React.createElement(
        f.React.Fragment,
        null,
        ...[undefined, "custom-fruit"].map((id, index) =>
          f.React.createElement(Select, {
            data: [{ label: "Apple", value: "apple" }],
            key: index,
            label: "Fruit",
            labelStyle: "static",
            triggerProps: { id },
          })
        )
      )
    );
    const fields = [...document.querySelectorAll("[data-field-outline]")];
    assert.equal(fields.length, 2);
    for (const field of fields) {
      const label = field.querySelector("label");
      const trigger = field.querySelector('[role="combobox"]');
      assert.ok(
        label.control === trigger,
        "Visible label must target its own Select trigger"
      );
      await f.React.act(() => label.click());
      assert.equal(
        trigger.getAttribute("aria-expanded"),
        "true",
        "Clicking the label activates its Select trigger"
      );
      await f.React.act(() =>
        trigger.dispatchEvent(
          new KeyboardEvent("keydown", { bubbles: true, key: "Escape" })
        )
      );
    }
    assert.equal(
      fields[1].querySelector('[role="combobox"]').id,
      "custom-fruit"
    );
  } finally {
    await f.cleanup();
  }
});
