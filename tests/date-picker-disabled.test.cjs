const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createAutocompleteFixture } = require("./autocomplete-ui-fixture.cjs");

for (const [name, module] of [
  ["DatePicker", "date-picker"],
  ["DateRangePicker", "date-range-picker"],
  ["DateTimePicker", "date-time-picker"],
  ["DateTimeRangePicker", "date-time-range-picker"],
]) {
  test(`${name} closes an open popup when disabled and blocks controlled opening`, async () => {
    const f = await createAutocompleteFixture();
    try {
      const Component = f.jiti(`../registry/new-york/${module}.tsx`)[name];
      const values = [];
      const render = (disabled, open) =>
        f.render(
          f.React.createElement(Component, {
            clearable: true,
            defaultOpen: true,
            disabled,
            label: "Date",
            motion: false,
            onValueChange: (next) => values.push(next),
            open,
          })
        );
      await render(false);
      assert.ok(
        document.querySelector('[data-slot="calendar"]'),
        "Calendar opens"
      );
      await render(true);
      assert.ok(
        document.querySelector('[data-slot="calendar"]') === null,
        "Disabled calendar closes"
      );
      await render(true, true);
      assert.ok(
        document.querySelector('[data-slot="calendar"]') === null,
        "Controlled open cannot override disabled"
      );
      assert.deepEqual(values, []);
    } finally {
      await f.cleanup();
    }
  });
}
