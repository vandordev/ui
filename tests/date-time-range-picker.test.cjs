/* eslint-disable require-await */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createAutocompleteFixture } = require("./autocomplete-ui-fixture.cjs");

const buttonByText = (text) =>
  [...document.querySelectorAll("button")].find(
    (button) => button.textContent.trim() === text
  );
const fields = () => [...document.querySelectorAll('[data-slot="time-field"]')];
// Field 0 is the start time, field 1 the end time.
const column = (field, name) =>
  fields()[field].querySelector(`[role="listbox"][aria-label="${name}"]`);
const chosen = (field, name) =>
  column(field, name).querySelector('[aria-selected="true"]').textContent;
const choose = async (f, field, name, label) => {
  const option = [
    ...column(field, name).querySelectorAll('[role="option"]'),
  ].find((item) => item.textContent === label);
  await f.React.act(async () => option.click());
};
const rangeError = () => document.querySelector('[id$="-range-error"]');
const day = (iso) => document.querySelector(`button[data-day="${iso}"]`);
const withPicker = async (props, run) => {
  const f = await createAutocompleteFixture();
  try {
    const { DateTimeRangePicker } = f.jiti(
      "../registry/new-york/date-time-range-picker.tsx"
    );
    await f.render(
      f.React.createElement(DateTimeRangePicker, {
        label: "Maintenance window",
        motion: false,
        ...props,
      })
    );
    await run(f);
  } finally {
    await f.cleanup();
  }
};
const fifth = new Date(2026, 2, 5, 9, 30, 45, 123);

test("Apply commits the range with both times at minute precision", async () => {
  const changes = [];
  await withPicker(
    {
      defaultOpen: true,
      defaultValue: { from: fifth, to: fifth },
      onValueChange: (next) => changes.push(next),
    },
    async (f) => {
      await f.React.act(async () => day("2026-03-10").click());
      await choose(f, 0, "Hours", "08");
      await choose(f, 0, "Minutes", "15");
      await choose(f, 1, "Hours", "06");
      await choose(f, 1, "Minutes", "45");
      await choose(f, 1, "AM/PM", "PM");
      assert.deepEqual(changes, [], "editing the draft does not commit");
      await f.React.act(async () => buttonByText("Apply").click());
      assert.equal(changes.length, 1);
      assert.equal(
        changes[0].from.getTime(),
        new Date(2026, 2, 5, 8, 15, 0, 0).getTime()
      );
      assert.equal(
        changes[0].to.getTime(),
        new Date(2026, 2, 10, 18, 45, 0, 0).getTime()
      );
      assert.ok(
        document.querySelector('[data-slot="calendar"]') === null,
        "popup closes"
      );
    }
  );
});

test("a single clicked day is a same-day time window", async () => {
  const changes = [];
  await withPicker(
    {
      defaultOpen: true,
      defaultValue: { from: new Date(2026, 2, 5) },
      onValueChange: (next) => changes.push(next),
    },
    async (f) => {
      await choose(f, 0, "Hours", "09");
      await choose(f, 1, "Hours", "05");
      await choose(f, 1, "Minutes", "30");
      await f.React.act(async () => buttonByText("Apply").click());
      assert.equal(changes.length, 1);
      assert.equal(
        changes[0].from.getTime(),
        new Date(2026, 2, 5, 9, 0).getTime()
      );
      assert.equal(
        changes[0].to.getTime(),
        new Date(2026, 2, 5, 17, 30).getTime()
      );
    }
  );
});

test("an end before the start blocks Apply, flags both fields and explains why", async () => {
  await withPicker(
    { defaultOpen: true, defaultValue: { from: fifth, to: fifth } },
    async (f) => {
      await choose(f, 0, "AM/PM", "PM");
      assert.equal(buttonByText("Apply").disabled, true);
      const error = rangeError();
      assert.match(error.textContent, /must not be before the start/);
      for (const index of [0, 1]) {
        for (const name of ["Hours", "Minutes", "AM/PM"]) {
          const list = column(index, name);
          assert.equal(list.getAttribute("aria-invalid"), "true");
          assert.equal(list.getAttribute("aria-describedby"), error.id);
        }
      }
      await choose(f, 1, "AM/PM", "PM");
      assert.equal(buttonByText("Apply").disabled, false);
      assert.equal(rangeError().textContent, "");
      assert.equal(column(0, "Hours").getAttribute("aria-invalid"), null);
    }
  );
});

test("Cancel discards the draft and a reopen shows the committed times", async () => {
  const changes = [];
  await withPicker(
    {
      defaultOpen: true,
      defaultValue: { from: fifth, to: fifth },
      onValueChange: (next) => changes.push(next),
    },
    async (f) => {
      await choose(f, 0, "Hours", "01");
      await f.React.act(async () => buttonByText("Cancel").click());
      assert.deepEqual(changes, []);
      await f.React.act(async () =>
        document.querySelector('[data-slot="popover-trigger"]').click()
      );
      assert.equal(chosen(0, "Hours"), "09");
      assert.equal(chosen(0, "Minutes"), "30");
    }
  );
});

test("Clear commits undefined immediately and closes", async () => {
  const changes = [];
  await withPicker(
    {
      clearable: true,
      defaultOpen: true,
      defaultValue: { from: fifth, to: fifth },
      onValueChange: (next) => changes.push(next),
    },
    async (f) => {
      await f.React.act(async () => buttonByText("Clear").click());
      assert.deepEqual(changes, [undefined]);
      assert.match(document.body.textContent, /Select date and time range/);
    }
  );
});

test("an empty range defaults to a full-day window at each cycle and precision", async () => {
  await withPicker({ defaultOpen: true }, async () => {
    assert.deepEqual(
      ["Hours", "Minutes", "AM/PM"].map((name) => chosen(0, name)),
      ["12", "00", "AM"]
    );
    assert.deepEqual(
      ["Hours", "Minutes", "AM/PM"].map((name) => chosen(1, name)),
      ["11", "59", "PM"]
    );
  });
  await withPicker(
    { defaultOpen: true, hourCycle: 24, precision: "second" },
    async () => {
      assert.deepEqual(
        ["Hours", "Minutes", "Seconds"].map((name) => chosen(0, name)),
        ["00", "00", "00"]
      );
      assert.deepEqual(
        ["Hours", "Minutes", "Seconds"].map((name) => chosen(1, name)),
        ["23", "59", "59"]
      );
      assert.equal(column(0, "AM/PM"), null);
    }
  );
});

test("readOnly shows the range but blocks every mutating control", async () => {
  const changes = [];
  await withPicker(
    {
      clearable: true,
      defaultOpen: true,
      defaultValue: { from: fifth, to: fifth },
      onValueChange: (next) => changes.push(next),
      readOnly: true,
    },
    async (f) => {
      assert.equal(column(0, "Hours").getAttribute("aria-readonly"), "true");
      assert.equal(buttonByText("Apply").disabled, true);
      assert.equal(buttonByText("Clear"), undefined);
      assert.equal(day("2026-03-10").disabled, true);
      await choose(f, 0, "Hours", "11");
      assert.equal(chosen(0, "Hours"), "09", "time edits are ignored");
      assert.deepEqual(changes, []);
    }
  );
});
