/* eslint-disable require-await, sort-keys */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createAutocompleteFixture } = require("./autocomplete-ui-fixture.cjs");

const run = async (props, check) => {
  const fixture = await createAutocompleteFixture();
  try {
    const api = fixture.jiti("../registry/new-york/autocomplete.tsx");
    const render = (next = props) =>
      fixture.render(
        fixture.React.createElement(api.Autocomplete, {
          animated: false,
          label: "Framework",
          ...next,
        })
      );
    await render();
    await check(fixture, render, api);
  } finally {
    await fixture.cleanup();
  }
};
const input = () => document.querySelector('[role="combobox"]');
const option = (label) =>
  [...document.querySelectorAll('[role="option"]')].find((node) =>
    node.textContent.includes(label)
  );
const users = [
  { id: "a", name: "Ada" },
  { id: "b", name: "Bea" },
];
const identity = {
  getItemLabel: (user) => user.name,
  getItemValue: (user) => user.id,
};

test("free text single edits immediately and suggestion replaces string", async () => {
  const changes = [];
  await run(
    {
      defaultOpen: true,
      items: ["React", "Vue"],
      onValueChange: (value) => changes.push(value),
    },
    async (f) => {
      await f.input("Re");
      assert.deepEqual(changes, ["Re"]);
      await f.React.act(async () => option("React").click());
      assert.equal(input().value, "React");
      assert.deepEqual(changes, ["Re", "React"]);
    }
  );
});

test("selection restores committed label on blur and Escape without value changes", async () => {
  const changes = [];
  await run(
    {
      mode: "selection",
      items: users,
      ...identity,
      defaultValue: users[0],
      onValueChange: (value) => changes.push(value),
    },
    async (f) => {
      assert.equal(input().value, "Ada");
      await f.input("Be");
      assert.deepEqual(changes, []);
      await f.key("Escape");
      assert.equal(input().value, "Ada");
      await f.input("Other");
      await f.React.act(async () => input().blur());
      assert.equal(input().value, "Ada");
      assert.deepEqual(changes, []);
    }
  );
});

test("selection commits original current object and retains absent choice", async () => {
  const changes = [];
  const props = {
    mode: "selection",
    items: users,
    ...identity,
    defaultOpen: true,
    onValueChange: (value) => changes.push(value),
  };
  await run(props, async (f, render) => {
    await f.React.act(async () => option("Bea").click());
    assert.ok(changes[0] === users[1], "Callback returns original source item");
    await render({ ...props, items: [] });
    assert.equal(input().value, "Bea");
    await f.input("Search");
    await f.key("Escape");
    assert.equal(input().value, "Bea");
  });
});

test("tag Enter trims and deduplicates, comma stays intact, draft survives blur", async () => {
  const changes = [];
  const defaults = Object.freeze(["React"]);
  await run(
    {
      defaultValue: defaults,
      items: ["React", "Vue"],
      multiple: true,
      onValueChange: (value) => changes.push(value),
    },
    async (f) => {
      await f.input("  Vue  ");
      assert.ok(await f.key("Enter"));
      assert.deepEqual(changes, [["React", "Vue"]]);
      assert.equal(input().value, "");
      await f.input("React");
      await f.key("Enter");
      assert.equal(changes.length, 1);
      await f.input("a,b");
      await f.React.act(async () => input().blur());
      assert.equal(input().value, "a,b");
      assert.equal(changes.length, 1);
      await f.React.act(async () => input().focus());
      await f.key("Enter");
      assert.deepEqual(changes[1], ["React", "Vue", "a,b"]);
      assert.deepEqual(defaults, ["React"]);
    }
  );
});

test("IME Enter does not create or select a tag", async () => {
  const changes = [];
  await run(
    {
      items: ["React"],
      multiple: true,
      onValueChange: (value) => changes.push(value),
    },
    async (f) => {
      await f.input("Custom");
      await f.React.act(async () =>
        input().dispatchEvent(
          new CompositionEvent("compositionstart", { bubbles: true })
        )
      );
      await f.key("Enter", { isComposing: true, keyCode: 229 });
      assert.deepEqual(changes, []);
      await f.React.act(async () =>
        input().dispatchEvent(
          new CompositionEvent("compositionend", {
            bubbles: true,
            data: "Custom",
          })
        )
      );
      await f.key("Enter");
      assert.deepEqual(changes, []);
      await f.key("Enter");
      assert.deepEqual(changes, [["Custom"]]);
    }
  );
});

test("selection multiple rejects arbitrary draft, keeps insertion order and stable IDs", async () => {
  const changes = [];
  await run(
    {
      mode: "selection",
      multiple: true,
      items: users,
      ...identity,
      defaultValue: [users[0]],
      onValueChange: (value) => changes.push(value),
    },
    async (f) => {
      await f.input("New");
      await f.key("Enter");
      assert.deepEqual(changes, []);
      await f.key("Escape");
      assert.equal(input().value, "");
      await f.input("Be");
      await f.React.act(async () => option("Bea").click());
      assert.ok(
        changes[0][0] === users[0] && changes[0][1] === users[1],
        "Insertion order and original identity"
      );
      assert.equal(input().value, "");
      assert.equal(input().getAttribute("aria-expanded"), "true");
    }
  );
});

test("first Backspace focuses chip, subsequent Delete removes and moves focus", async () => {
  const changes = [];
  await run(
    {
      defaultValue: ["React", "Vue"],
      items: [],
      multiple: true,
      onValueChange: (value) => changes.push(value),
    },
    async (f) => {
      await f.React.act(async () => input().focus());
      await f.key("Backspace");
      const chips = [
        ...document.querySelectorAll('[data-slot="autocomplete-chip"]'),
      ];
      assert.ok(document.activeElement === chips[1], "Focus last chip first");
      assert.deepEqual(changes, []);
      await f.key("Delete");
      assert.deepEqual(changes, [["React"]]);
      assert.ok(document.activeElement === chips[0], "Focus previous chip");
    }
  );
});

test("status gates stale results but free text tags remain editable", async () => {
  const changes = [];
  const props = {
    defaultOpen: true,
    error: "Unavailable",
    items: ["React"],
    loading: true,
    multiple: true,
    onValueChange: (value) => changes.push(value),
  };
  await run(props, async (f, render) => {
    assert.match(
      document.querySelector('[role="status"]').textContent,
      /Unavailable/
    );
    assert.ok(!document.body.textContent.includes("No results"));
    assert.ok(!option("React"));
    await f.input("Custom");
    await f.key("Enter");
    assert.deepEqual(changes, [["Custom"]]);
    await render({ ...props, error: undefined, filter: null, loading: false });
    await f.input("unmatched");
    assert.ok(
      option("React"),
      "External filtering does not refilter server results"
    );
  });
});

test("refs, native handlers, ownership and cancellation are preserved", async () => {
  const changes = [];
  const events = [];
  const a = { current: null },
    b = { current: null };
  await run(
    {
      className: "outer-test",
      inputProps: {
        "aria-describedby": "help",
        className: "input-test",
        onChange: () => events.push("change"),
        onKeyDown: (event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
          }
        },
        ref: b,
      },
      items: ["React"],
      onValueChange: (value) => changes.push(value),
      ref: a,
    },
    async (f) => {
      assert.ok(
        a.current === input() && b.current === input(),
        "Both refs point at input"
      );
      assert.equal(document.querySelector("label").htmlFor, input().id);
      assert.equal(input().getAttribute("aria-describedby"), "help");
      assert.ok(!input().classList.contains("outer-test"));
      assert.ok(input().classList.contains("input-test"));
      await f.input("x");
      assert.deepEqual(events, ["change"]);
      assert.deepEqual(changes, ["x"]);
      await f.key("ArrowDown");
      assert.ok(!input().getAttribute("aria-activedescendant"));
    }
  );
});

test("read only prevents removal and clear", async () => {
  const changes = [];
  await run(
    {
      clearable: true,
      defaultValue: ["React"],
      items: [],
      multiple: true,
      onValueChange: (value) => changes.push(value),
      readOnly: true,
    },
    async (f) => {
      assert.ok(input().readOnly);
      await f.React.act(async () =>
        document.querySelector('[aria-label="Remove React"]').click()
      );
      await f.React.act(async () =>
        document.querySelector('[aria-label="Clear value"]').click()
      );
      await f.React.act(async () => input().focus());
      await f.key("Backspace");
      assert.deepEqual(changes, []);
    }
  );
});

test("choosing an already committed tag does not remove it or emit a change", async () => {
  const changes = [];
  await run(
    {
      defaultOpen: true,
      defaultValue: ["React"],
      items: ["React", "Vue"],
      multiple: true,
      onValueChange: (value) => changes.push(value),
    },
    async (f) => {
      await f.React.act(async () => option("React").click());
      assert.deepEqual(changes, []);
      assert.equal(
        document
          .querySelector('[data-slot="autocomplete-chip"]')
          .getAttribute("aria-label"),
        "React"
      );
    }
  );
});

test("grouped keyboard order commits the highlighted original item without submitting", async () => {
  const items = [
    { id: "a", name: "Ada", team: "B" },
    { id: "b", name: "Bea", team: "A" },
    { id: "c", name: "Cam", team: "B" },
  ];
  const changes = [];
  await run(
    {
      mode: "selection",
      items,
      ...identity,
      groupBy: (item) => item.team,
      defaultOpen: true,
      onValueChange: (value) => changes.push(value),
    },
    async (f) => {
      await f.React.act(async () => input().focus());
      await f.key("ArrowDown");
      await f.key("ArrowDown");
      // Base UI IDs may contain React's selector metacharacters.
      // eslint-disable-next-line unicorn/prefer-query-selector
      const active = document.getElementById(
        input().getAttribute("aria-activedescendant")
      );
      assert.equal(active?.textContent, "Cam");
      assert.ok(
        await f.key("Enter"),
        "Handled selection Enter cancels native submission"
      );
      assert.ok(
        changes[0] === items[2],
        "The highlighted grouped option must be committed"
      );
    }
  );
});

test("highlighted tag Enter commits suggestion, unhighlighted single Enter stays native", async () => {
  const changes = [];
  await run(
    {
      multiple: true,
      items: ["React", "Vue"],
      defaultOpen: true,
      onValueChange: (value) => changes.push(value),
    },
    async (f) => {
      await f.input("Re");
      await f.key("ArrowDown");
      assert.ok(input().getAttribute("aria-activedescendant"));
      assert.ok(await f.key("Enter"), "Suggestion Enter must not submit form");
      assert.deepEqual(changes, [["React"]]);
      assert.equal(input().value, "");
    }
  );
  await run({ items: [] }, async (f) => {
    await f.input("Arbitrary text");
    assert.equal(
      await f.key("Enter"),
      false,
      "Ordinary free-text Enter retains native behavior"
    );
  });
});

test("disabled suggestion cannot commit and custom matching preserves original items", async () => {
  const changes = [];
  await run(
    {
      mode: "selection",
      items: users,
      ...identity,
      filter: (user, query) => user.id === query,
      isItemDisabled: (user) => user.id === "b",
      onValueChange: (value) => changes.push(value),
    },
    async (f) => {
      await f.input("b");
      assert.equal(document.querySelectorAll('[role="option"]').length, 1);
      assert.equal(option("Bea").getAttribute("aria-disabled"), "true");
      await f.React.act(async () => option("Bea").click());
      await f.key("ArrowDown");
      await f.key("Enter");
      assert.deepEqual(changes, []);
    }
  );
});
