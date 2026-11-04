/* eslint-disable require-await */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createAutocompleteFixture } = require("./autocomplete-ui-fixture.cjs");

const buttonByText = (text) =>
  [...document.querySelectorAll("button")].find(
    (button) => button.textContent.trim() === text
  );
const timeInput = () => document.querySelector('input[type="time"]');
const setTime = async (f, value) => {
  await f.React.act(async () => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    ).set.call(timeInput(), value);
    timeInput().dispatchEvent(new Event("input", { bubbles: true }));
  });
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

test("Apply commits the chosen day with the chosen time and closes", async () => {
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
      await setTime(f, "14:45");
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

test("Cancel discards the draft and a reopen shows the committed value", async () => {
  const changes = [];
  await withPicker(
    {
      defaultOpen: true,
      defaultValue: march,
      onValueChange: (next) => changes.push(next),
    },
    async (f) => {
      await setTime(f, "18:00");
      await f.React.act(async () => buttonByText("Cancel").click());
      assert.deepEqual(changes, []);
      await f.React.act(async () =>
        document.querySelector('[data-slot="popover-trigger"]').click()
      );
      assert.equal(timeInput().value, "09:30");
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
    assert.equal(timeInput().value, "09:30");
  });
  await withPicker(
    { defaultOpen: true, precision: "second", value: march },
    async () => {
      assert.equal(timeInput().value, "09:30:45");
      assert.equal(timeInput().getAttribute("step"), "1");
    }
  );
});

test("an empty time blocks Apply and flags the field invalid", async () => {
  await withPicker({ defaultOpen: true, defaultValue: march }, async (f) => {
    await setTime(f, "");
    assert.equal(buttonByText("Apply").disabled, true);
    assert.equal(timeInput().getAttribute("aria-invalid"), "true");
  });
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
      assert.equal(timeInput().readOnly, true);
      assert.equal(buttonByText("Apply").disabled, true);
      assert.equal(buttonByText("Clear"), undefined);
      assert.equal(
        document.querySelector('button[data-day="2026-03-10"]').disabled,
        true
      );
      await setTime(f, "11:11");
      assert.equal(timeInput().value, "09:30", "time edits are ignored");
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
      await setTime(f, "10:00");
      await f.React.act(async () => buttonByText("Apply").click());
      assert.equal(changes.length, 1);
      assert.match(document.body.textContent, /9:30 AM/);
    }
  );
});
