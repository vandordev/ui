/* eslint-disable require-await */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createAutocompleteFixture } = require("./autocomplete-ui-fixture.cjs");

const buttonByText = (text) =>
  [...document.querySelectorAll("button")].find(
    (button) => button.textContent.trim() === text
  );
const column = (name) =>
  document.querySelector(`[role="listbox"][aria-label="${name}"]`);
const chosen = (name) =>
  column(name).querySelector('[aria-selected="true"]').textContent;
const choose = async (f, name, label) => {
  const option = [...column(name).querySelectorAll('[role="option"]')].find(
    (item) => item.textContent === label
  );
  await f.React.act(async () => option.click());
};
const march = new Date(2026, 2, 5, 9, 30, 45, 123);
const withPicker = async (props, run) => {
  const f = await createAutocompleteFixture();
  try {
    const { DateTimePicker } = f.jiti(
      "../registry/new-york/date-time-picker.tsx"
    );
    await f.render(
      f.React.createElement(DateTimePicker, {
        label: "Starts at",
        motion: false,
        ...props,
      })
    );
    await run(f);
  } finally {
    await f.cleanup();
  }
};

test("Apply commits the chosen day with the chosen 12-hour time and closes", async () => {
  const changes = [];
  await withPicker(
    {
      defaultOpen: true,
      defaultValue: march,
      onValueChange: (next) => changes.push(next),
    },
    async (f) => {
      await f.React.act(async () =>
        document.querySelector('button[data-day="2026-03-10"]').click()
      );
      await choose(f, "Hours", "02");
      await choose(f, "Minutes", "45");
      await choose(f, "AM/PM", "PM");
      assert.deepEqual(changes, [], "editing the draft does not commit");
      await f.React.act(async () => buttonByText("Apply").click());
      assert.equal(changes.length, 1);
      assert.equal(
        changes[0].getTime(),
        new Date(2026, 2, 10, 14, 45, 0, 0).getTime(),
        "seconds and milliseconds are zero at minute precision"
      );
      assert.ok(
        document.querySelector('[data-slot="calendar"]') === null,
        "popup closes"
      );
      assert.match(document.body.textContent, /March 10th, 2026/);
    }
  );
});

test("midnight and noon map correctly between 12-hour and 24-hour", async () => {
  const changes = [];
  await withPicker(
    {
      defaultOpen: true,
      defaultValue: march,
      onValueChange: (next) => changes.push(next),
    },
    async (f) => {
      await choose(f, "Hours", "12");
      await choose(f, "AM/PM", "AM");
      await f.React.act(async () => buttonByText("Apply").click());
      assert.equal(changes[0].getHours(), 0, "12 AM is hour 0");
      await f.React.act(async () =>
        document.querySelector('[data-slot="popover-trigger"]').click()
      );
      await choose(f, "AM/PM", "PM");
      await f.React.act(async () => buttonByText("Apply").click());
      assert.equal(changes[1].getHours(), 12, "12 PM is hour 12");
    }
  );
});

test("Cancel discards the draft and a reopen shows the committed value", async () => {
  const changes = [];
  await withPicker(
    {
      defaultOpen: true,
      defaultValue: march,
      onValueChange: (next) => changes.push(next),
    },
    async (f) => {
      await choose(f, "Hours", "06");
      await f.React.act(async () => buttonByText("Cancel").click());
      assert.deepEqual(changes, []);
      await f.React.act(async () =>
        document.querySelector('[data-slot="popover-trigger"]').click()
      );
      assert.equal(chosen("Hours"), "09");
      assert.equal(chosen("Minutes"), "30");
      assert.equal(chosen("AM/PM"), "AM");
    }
  );
});

test("Clear commits undefined immediately and closes", async () => {
  const changes = [];
  await withPicker(
    {
      clearable: true,
      defaultOpen: true,
      defaultValue: march,
      onValueChange: (next) => changes.push(next),
    },
    async (f) => {
      await f.React.act(async () => buttonByText("Clear").click());
      assert.deepEqual(changes, [undefined]);
      assert.match(document.body.textContent, /Select date and time/);
    }
  );
});

test("a controlled value with seconds is shown at the configured precision", async () => {
  await withPicker({ defaultOpen: true, value: march }, async () => {
    assert.equal(
      column("Seconds"),
      null,
      "no seconds column at minute precision"
    );
    assert.equal(chosen("Minutes"), "30");
  });
  await withPicker(
    { defaultOpen: true, precision: "second", value: march },
    async () => {
      assert.equal(chosen("Seconds"), "45");
    }
  );
});

test("the 24-hour cycle drops the period column and keeps hours as given", async () => {
  const changes = [];
  await withPicker(
    {
      defaultOpen: true,
      defaultValue: march,
      hourCycle: 24,
      onValueChange: (next) => changes.push(next),
    },
    async (f) => {
      assert.equal(column("AM/PM"), null);
      assert.equal(chosen("Hours"), "09");
      await choose(f, "Hours", "18");
      await f.React.act(async () => buttonByText("Apply").click());
      assert.equal(
        changes[0].getTime(),
        new Date(2026, 2, 5, 18, 30, 0, 0).getTime()
      );
    }
  );
});

test("the locale decides the hour cycle when none is given", async () => {
  const f = await createAutocompleteFixture();
  try {
    const { id } = f.jiti("date-fns/locale");
    const { DateTimePicker } = f.jiti(
      "../registry/new-york/date-time-picker.tsx"
    );
    await f.render(
      f.React.createElement(DateTimePicker, {
        defaultOpen: true,
        defaultValue: march,
        label: "Mulai",
        locale: id,
        motion: false,
      })
    );
    assert.equal(column("AM/PM"), null, "Indonesian uses 24 hours");
  } finally {
    await f.cleanup();
  }
});

test("arrow keys move the selection and Enter applies", async () => {
  const changes = [];
  await withPicker(
    {
      defaultOpen: true,
      defaultValue: march,
      onValueChange: (next) => changes.push(next),
    },
    async (f) => {
      await f.React.act(async () => column("Hours").focus());
      await f.key("ArrowDown");
      assert.equal(chosen("Hours"), "10");
      await f.key("ArrowUp");
      await f.key("ArrowUp");
      assert.equal(chosen("Hours"), "08");
      await f.key("End");
      assert.equal(chosen("Hours"), "11");
      await f.key("Home");
      assert.equal(chosen("Hours"), "12");
      await f.key("Enter");
      assert.equal(changes.length, 1);
      assert.equal(changes[0].getHours(), 0);
    }
  );
});

test("readOnly shows the value but blocks every mutating control", async () => {
  const changes = [];
  await withPicker(
    {
      clearable: true,
      defaultOpen: true,
      defaultValue: march,
      onValueChange: (next) => changes.push(next),
      readOnly: true,
    },
    async (f) => {
      assert.equal(column("Hours").getAttribute("aria-readonly"), "true");
      assert.equal(buttonByText("Apply").disabled, true);
      assert.equal(buttonByText("Clear"), undefined);
      assert.equal(
        document.querySelector('button[data-day="2026-03-10"]').disabled,
        true
      );
      await choose(f, "Hours", "11");
      await f.key("ArrowDown");
      assert.equal(chosen("Hours"), "09", "time edits are ignored");
      assert.deepEqual(changes, []);
    }
  );
});

test("a controlled parent that rejects the change keeps the committed value", async () => {
  const changes = [];
  await withPicker(
    {
      defaultOpen: true,
      onValueChange: (next) => changes.push(next),
      value: march,
    },
    async (f) => {
      await choose(f, "Hours", "10");
      await f.React.act(async () => buttonByText("Apply").click());
      assert.equal(changes.length, 1);
      assert.match(document.body.textContent, /9:30 AM/);
    }
  );
});
