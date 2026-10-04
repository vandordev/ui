const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { test } = require("node:test");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { createJiti } = require("jiti");
const registry = require("../registry.json");

const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});

test("Calendar renders distinct range endpoints and the connecting middle", () => {
  const { Calendar } = jiti("../registry/new-york/calendar.tsx");
  const html = renderToStaticMarkup(
    React.createElement(Calendar, {
      defaultMonth: new Date(2026, 9, 1),
      mode: "range",
      selected: { from: new Date(2026, 9, 5), to: new Date(2026, 9, 8) },
    })
  );
  assert.match(html, /data-range-start="true"/);
  assert.match(html, /data-range-middle="true"/);
  assert.match(html, /data-range-end="true"/);
  assert.match(html, /data-slot="calendar-selection"/);
});

test("Calendar playground generates every configured option", () => {
  const { getInputPlaygroundCode } = jiti("../lib/input-component-props.ts");
  const code = getInputPlaygroundCode("calendar", {
    buttonVariant: "outline",
    captionLayout: "dropdown",
    mode: "range",
    motion: false,
    numberOfMonths: "2",
    showOutsideDays: false,
    showWeekNumber: true,
    weekStartsOn: "1",
  });
  for (const expected of [
    'captionLayout="dropdown"',
    'buttonVariant="outline"',
    "showOutsideDays={false}",
    "showWeekNumber={true}",
    "numberOfMonths={2}",
    "weekStartsOn={1}",
    "motion={false}",
  ]) {
    assert.ok(code.includes(expected), expected);
  }
});

test("Calendar portable stories compose representative states and wire Controls", async () => {
  const { composeStories } = await import("@storybook/react");
  const stories = composeStories(
    jiti("../registry/new-york/calendar.stories.tsx")
  );
  for (const name of [
    "Playground",
    "Multiple",
    "Range",
    "Dropdowns",
    "DisabledDates",
    "Indonesian",
    "WithoutMotion",
    "SelectedRange",
  ]) {
    assert.match(
      renderToStaticMarkup(React.createElement(stories[name])),
      /data-slot="calendar"/
    );
  }
  const html = renderToStaticMarkup(
    React.createElement(stories.Playground, {
      captionLayout: "dropdown",
      mode: "range",
      numberOfMonths: 2,
      showWeekNumber: true,
      weekStartsOn: 1,
    })
  );
  assert.equal([...html.matchAll(/role="grid"/g)].length, 2);
  assert.match(html, /<select/);
  assert.match(html, /rdp-week_number/);
  assert.match(html, /data-mode="range"/);
});

test("Calendar artifacts match source and stories stay optional", () => {
  for (const name of ["calendar", "calendar-stories"]) {
    const item = registry.items.find((entry) => entry.name === name);
    const artifact = JSON.parse(readFileSync(`public/r/${name}.json`, "utf-8"));
    for (const file of artifact.files) {
      assert.equal(file.content, readFileSync(file.path, "utf-8"));
    }
    assert.deepEqual(artifact.dependencies ?? [], item.dependencies ?? []);
    if (name === "calendar-stories") {
      assert.deepEqual(item.registryDependencies ?? [], []);
      assert.deepEqual(item.dependencies ?? [], []);
      assert.equal(item.files[0].target, undefined);
    } else {
      assert.ok(!item.files.some((file) => file.path.endsWith(".stories.tsx")));
      assert.deepEqual(item.registryDependencies ?? [], []);
      assert.equal(item.files[0].target, undefined);
      assert.ok(item.dependencies.includes("motion"));
      assert.ok(item.dependencies.includes("react-day-picker@^10.0.2"));
    }
  }
});
