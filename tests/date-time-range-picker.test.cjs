/* eslint-disable require-await */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createAutocompleteFixture } = require("./autocomplete-ui-fixture.cjs");

const buttonByText = (text) =>
  [...document.querySelectorAll("button")].find(
    (button) => button.textContent.trim() === text
  );
const timeInputs = () => [...document.querySelectorAll('input[type="time"]')];
const setTime = async (f, index, value) => {
  await f.React.act(async () => {
    const input = timeInputs()[index];
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    ).set.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
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
      await setTime(f, 0, "08:15");
      await setTime(f, 1, "18:45");
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
      await setTime(f, 0, "09:00");
      await setTime(f, 1, "17:30");
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
      await setTime(f, 0, "17:00");
      await setTime(f, 1, "09:00");
      assert.equal(buttonByText("Apply").disabled, true);
      const error = rangeError();
      assert.match(error.textContent, /must not be before the start/);
      for (const input of timeInputs()) {
        assert.equal(input.getAttribute("aria-invalid"), "true");
        assert.equal(input.getAttribute("aria-describedby"), error.id);
      }
      await setTime(f, 1, "18:00");
      assert.equal(buttonByText("Apply").disabled, false);
      assert.equal(rangeError().textContent, "");
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
      await setTime(f, 0, "01:00");
      await f.React.act(async () => buttonByText("Cancel").click());
      assert.deepEqual(changes, []);
      await f.React.act(async () =>
        document.querySelector('[data-slot="popover-trigger"]').click()
      );
      assert.equal(timeInputs()[0].value, "09:30");
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

test("empty range defaults to a full-day window at each precision", async () => {
  await withPicker({ defaultOpen: true }, async () => {
    assert.deepEqual(
      timeInputs().map((input) => input.value),
      ["00:00", "23:59"]
    );
  });
  await withPicker({ defaultOpen: true, precision: "second" }, async () => {
    const [start, end] = timeInputs().map((input) => input.value);
    // The DOM may serialize a zero seconds part away ("00:00:00" -> "00:00").
    assert.match(start, /^00:00(:00)?$/);
    assert.equal(end, "23:59:59");
    assert.equal(timeInputs()[0].getAttribute("step"), "1");
  });
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
      assert.ok(timeInputs().every((input) => input.readOnly));
      assert.equal(buttonByText("Apply").disabled, true);
      assert.equal(buttonByText("Clear"), undefined);
      assert.equal(day("2026-03-10").disabled, true);
      await setTime(f, 0, "11:11");
      assert.equal(timeInputs()[0].value, "09:30", "time edits are ignored");
      assert.deepEqual(changes, []);
    }
  );
});
