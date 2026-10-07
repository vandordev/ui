/* eslint-disable require-await */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createAutocompleteFixture } = require("./autocomplete-ui-fixture.cjs");

test("compound multiple parts commit, focus and remove using same contract", async () => {
  const f = await createAutocompleteFixture();
  try {
    const a = f.jiti("../registry/new-york/autocomplete.tsx");
    const changes = [];
    const Demo = () => {
      const [tags, setTags] = f.React.useState([]);
      return f.React.createElement(
        a.AutocompleteRoot,
        {
          animated: false,
          defaultOpen: true,
          items: ["React", "Vue"],
          multiple: true,
          onValueChange: (next) => {
            changes.push(next);
            setTags(next);
          },
          value: tags,
        },
        f.React.createElement(
          a.AutocompleteChips,
          null,
          ...tags.map((tag) =>
            f.React.createElement(
              a.AutocompleteChip,
              { key: tag, label: tag },
              tag,
              f.React.createElement(a.AutocompleteChipRemove)
            )
          ),
          f.React.createElement(a.AutocompleteInput, { "aria-label": "Tags" })
        ),
        f.React.createElement(
          a.AutocompleteContent,
          null,
          f.React.createElement(
            a.AutocompleteList,
            null,
            f.React.createElement(
              a.AutocompleteItem,
              { value: "React" },
              "React"
            ),
            f.React.createElement(
              a.AutocompleteItem,
              { disabled: true, value: "Vue" },
              "Vue"
            )
          )
        )
      );
    };
    await f.render(f.React.createElement(Demo));
    await f.React.act(async () =>
      document.querySelector('[role="option"]').click()
    );
    assert.deepEqual(changes, [["React"]]);
    await f.input("Custom");
    await f.key("Enter");
    assert.deepEqual(changes[1], ["React", "Custom"]);
    await f.React.act(async () =>
      document.querySelector('[role="combobox"]').focus()
    );
    await f.key("Backspace");
    assert.equal(document.activeElement.getAttribute("aria-label"), "Custom");
    await f.key("Delete");
    assert.deepEqual(changes[2], ["React"]);
  } finally {
    await f.cleanup();
  }
});

test("controlled values stay authoritative and controlled query cleanup is requested", async () => {
  const f = await createAutocompleteFixture();
  try {
    const { Autocomplete } = f.jiti("../registry/new-york/autocomplete.tsx");
    const queries = [];
    const values = [];
    const user = { id: "a", name: "Ada" };
    await f.render(
      f.React.createElement(
        "form",
        null,
        f.React.createElement(Autocomplete, {
          animated: false,
          clearable: true,
          getItemLabel: (item) => item.name,
          getItemValue: (item) => item.id,
          inputValue: "Search",
          items: [user],
          label: "Person",
          mode: "selection",
          onInputValueChange: (text) => queries.push(text),
          onValueChange: (value) => values.push(value),
          value: user,
        })
      )
    );
    await f.React.act(async () =>
      document.querySelector('[role="combobox"]').focus()
    );
    await f.key("Escape");
    assert.deepEqual(queries, ["Ada"]);
    assert.deepEqual(values, []);
    assert.equal(document.querySelector('[role="combobox"]').value, "Search");
    await f.React.act(async () =>
      document.querySelector('[aria-label="Clear value"]').click()
    );
    assert.deepEqual(values, [null]);
    assert.deepEqual(queries, ["Ada", ""]);
    await f.React.act(async () => document.querySelector("form").reset());
    assert.equal(document.querySelector('[role="combobox"]').value, "Search");
    assert.deepEqual(values, [null]);
  } finally {
    await f.cleanup();
  }
});

test("compound items honor root filtering and resolve refreshed objects by stable ID", async () => {
  const f = await createAutocompleteFixture();
  try {
    const a = f.jiti("../registry/new-york/autocomplete.tsx");
    const users = [
      { id: "a", name: "Ada" },
      { id: "b", name: "Bea" },
    ];
    const changes = [];
    await f.render(
      f.React.createElement(
        a.AutocompleteRoot,
        {
          animated: false,
          defaultOpen: true,
          getItemLabel: (item) => item.name,
          getItemValue: (item) => item.id,
          items: users,
          mode: "selection",
          onValueChange: (value) => changes.push(value),
        },
        f.React.createElement(a.AutocompleteInput, { "aria-label": "Person" }),
        f.React.createElement(
          a.AutocompleteContent,
          null,
          f.React.createElement(
            a.AutocompleteList,
            null,
            ...users.map((user) =>
              f.React.createElement(
                a.AutocompleteItem,
                { key: user.id, value: { ...user } },
                user.name
              )
            )
          )
        )
      )
    );
    await f.input("Be");
    const options = [...document.querySelectorAll('[role="option"]')];
    assert.deepEqual(
      options.map((node) => node.textContent),
      ["Bea"]
    );
    await f.React.act(async () => options[0].click());
    assert.ok(
      changes[0] === users[1],
      "Stable ID must resolve the original current source object"
    );
  } finally {
    await f.cleanup();
  }
});
