const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createAutocompleteFixture } = require("./autocomplete-ui-fixture.cjs");
const raised = () =>
  document.querySelector("[data-field-outline]").dataset.raised;

test("Autocomplete real notch tracks input-group focus without an opaque label patch", async () => {
  const f = await createAutocompleteFixture();
  try {
    const { Autocomplete } = f.jiti("../registry/new-york/autocomplete.tsx");
    await f.render(
      f.React.createElement(Autocomplete, {
        items: ["Alpha", "Beta"],
        label: "Project",
        labelStyle: "floating",
        showTrigger: true,
      })
    );
    const outline = document.querySelector("[data-field-outline]");
    assert.ok(
      outline !== null,
      "Autocomplete distributes and uses the shared real-notch helper"
    );
    assert.ok(
      outline.querySelector('fieldset[aria-hidden="true"] legend') !== null,
      "Outline uses a real legend gap"
    );
    const label = outline.querySelector("label");
    assert.ok(
      !label.className.includes("bg-background"),
      "Label is transparent over gradient surfaces"
    );
    await f.React.act(() =>
      document.querySelector('[role="combobox"]').focus()
    );
    assert.equal(outline.dataset.raised, "true");
    const trigger = document.querySelector(
      '[data-slot="autocomplete-trigger"]'
    );
    await f.React.act(() => trigger.focus());
    assert.equal(
      outline.dataset.raised,
      "true",
      "Focus within group keeps label raised"
    );
    const outside = document.createElement("button");
    document.body.append(outside);
    await f.React.act(() => outside.focus());
    assert.equal(
      Object.hasOwn(outline.dataset, "raised"),
      false,
      "Outside blur lowers an empty label"
    );
    outside.remove();
  } finally {
    await f.cleanup();
  }
});

test("Autocomplete multiple keeps notch raised across chips, remove, clear and trigger focus", async () => {
  const f = await createAutocompleteFixture();
  try {
    const { Autocomplete } = f.jiti("../registry/new-york/autocomplete.tsx");
    await f.render(
      f.React.createElement(Autocomplete, {
        clearable: true,
        defaultValue: ["Alpha", "Beta"],
        items: ["Alpha", "Beta"],
        label: "Projects",
        labelStyle: "floating",
        mode: "selection",
        multiple: true,
        showTrigger: true,
      })
    );
    for (const slot of [
      "autocomplete-chip",
      "autocomplete-chip-remove",
      "autocomplete-clear",
      "autocomplete-trigger",
    ]) {
      const target = document.querySelector(`[data-slot="${slot}"]`);
      assert.ok(Boolean(target), `${slot} is interactive`);
      await f.React.act(() => target.focus());
      assert.equal(raised(), "true", `${slot} keeps label raised`);
    }
    await f.React.act(() =>
      document.querySelector('[data-slot="autocomplete-clear"]').click()
    );
    assert.equal(
      document.querySelectorAll('[data-slot="autocomplete-chip"]').length,
      0
    );
    assert.equal(raised(), "true", "Focused empty group keeps notch raised");
    const outside = document.createElement("button");
    document.body.append(outside);
    try {
      await f.React.act(() => outside.focus());
      assert.equal(raised(), undefined, "Cleared outside group lowers label");
    } finally {
      outside.remove();
    }
  } finally {
    await f.cleanup();
  }
});

for (const kind of ["Drawer", "Dialog"]) {
  test(`Autocomplete suggestions select inside real ${kind}`, async () => {
    const f = await createAutocompleteFixture();
    try {
      delete f.dom.Element.prototype.animate;
      const { Autocomplete } = f.jiti("../registry/new-york/autocomplete.tsx");
      const { [kind]: Overlay } = f.jiti(
        `../registry/new-york/${kind.toLowerCase()}.tsx`
      );
      const changes = [];
      await f.render(
        f.React.createElement(
          Overlay,
          { defaultOpen: true, title: "Choose project" },
          f.React.createElement(Autocomplete, {
            items: ["Alpha", "Beta"],
            label: "Project",
            mode: "selection",
            onValueChange: (value) => changes.push(value),
            showTrigger: true,
          })
        )
      );
      assert.ok(document.querySelector('[role="dialog"]') !== null);
      await f.React.act(() =>
        document.querySelector('[data-slot="autocomplete-trigger"]').click()
      );
      const option = [...document.querySelectorAll('[role="option"]')].find(
        (item) => item.textContent.includes("Beta")
      );
      assert.ok(
        option !== undefined,
        "Suggestions are mounted inside overlay composition"
      );
      assert.ok(
        option.closest(".isolate")?.classList.contains("z-50"),
        "Popup has the required isolated layer"
      );
      await f.React.act(() => option.click());
      assert.equal(document.querySelector('[role="combobox"]').value, "Beta");
      assert.equal(changes.at(-1), "Beta");
      assert.ok(
        document.querySelector('[role="dialog"]') !== null,
        "Selection does not dismiss parent overlay"
      );
    } finally {
      await f.cleanup();
    }
  });
}
