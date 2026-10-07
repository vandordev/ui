/* eslint-disable global-require */
/* eslint-disable require-await */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createAutocompleteFixture } = require("./autocomplete-ui-fixture.cjs");

test("public primitive probe supports independent draft, created tags and chip focus", async () => {
  const fixture = await createAutocompleteFixture();
  const { React } = fixture;
  const { Combobox } = require("@base-ui/react/combobox");
  let snapshot;
  const Probe = () => {
    const [value, setValue] = React.useState(["React"]);
    const [draft, setDraft] = React.useState("");
    snapshot = { draft, value };
    return React.createElement(
      Combobox.Root,
      {
        inputValue: draft,
        items: ["React", "Vue"],
        multiple: true,
        onInputValueChange: setDraft,
        onValueChange: setValue,
        value,
      },
      React.createElement(
        Combobox.Chips,
        null,
        ...value.map((tag) =>
          React.createElement(
            Combobox.Chip,
            { key: tag },
            tag,
            React.createElement(
              Combobox.ChipRemove,
              { "aria-label": `Remove ${tag}` },
              "x"
            )
          )
        ),
        React.createElement(Combobox.Input, {
          "aria-label": "Tags",
          onKeyDown(event) {
            if (event.key === "Enter" && draft.trim()) {
              event.preventDefault();
              event.preventBaseUIHandler();
              setValue([...value, draft.trim()]);
              setDraft("");
            }
            if (event.key === "Backspace" && !draft) {
              event.preventDefault();
              event.preventBaseUIHandler();
              const chips = [
                ...document.querySelectorAll('[data-probe] div[tabindex="-1"]'),
              ];
              chips.at(-1)?.focus();
            }
          },
        })
      )
    );
  };
  try {
    await fixture.render(
      React.createElement(
        "div",
        { "data-probe": true },
        React.createElement(Probe)
      )
    );
    await fixture.input("  Custom  ");
    assert.deepEqual(snapshot.value, ["React"]);
    assert.equal(snapshot.draft, "  Custom  ");
    assert.ok(await fixture.key("Enter"));
    assert.deepEqual(snapshot.value, ["React", "Custom"]);
    assert.equal(snapshot.draft, "");
    const chips = [
      ...document.querySelectorAll('[data-probe] [tabindex="-1"]'),
    ].filter((node) => node.tagName === "DIV");
    assert.equal(chips.length, 2);
    await React.act(async () =>
      document.querySelector('[role="combobox"]').focus()
    );
    await fixture.key("Backspace");
    assert.deepEqual(snapshot.value, ["React", "Custom"]);
    assert.ok(document.activeElement === chips[1], "Public chip accepts focus");
    await fixture.key("Backspace");
    assert.deepEqual(snapshot.value, ["React"]);
  } finally {
    await fixture.cleanup();
  }
});
