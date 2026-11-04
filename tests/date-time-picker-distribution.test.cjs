const assert = require("node:assert/strict");
const { existsSync, readFileSync } = require("node:fs");
const test = require("node:test");
const { createJiti } = require("jiti");
const registry = require("../registry.json");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { createAutocompleteFixture } = require("./autocomplete-ui-fixture.cjs");

const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});
const item = (name) => registry.items.find((entry) => entry.name === name);

test("DateTimePicker registry items defer targets to the consumer alias and list real files", () => {
  for (const name of [
    "date-time-picker",
    "date-time-picker-stories",
    "date-time-range-picker",
    "date-time-range-picker-stories",
  ]) {
    assert.ok(item(name), name);
    for (const file of item(name).files) {
      assert.equal(file.target, undefined, `${file.path} has a fixed target`);
      assert.ok(existsSync(file.path), `${file.path} exists`);
    }
  }
});

test("DateTimePicker dependencies are versioned and its imports are all declared", () => {
  const entry = item("date-time-picker");
  assert.ok(
    entry.files.some((file) =>
      file.path.endsWith("/date-time-picker-parts.tsx")
    ),
    "shared time columns are distributed"
  );
  for (const dependency of entry.dependencies) {
    assert.match(dependency, /@[\^\d]/, `${dependency} must carry a version`);
  }
  const names = new Set(
    entry.dependencies.map((dependency) => dependency.replace(/@[^@/]+$/, ""))
  );
  const source = entry.files
    .map((file) => readFileSync(file.path, "utf-8"))
    .join("\n");
  for (const match of source.matchAll(/from "([^".][^"]*)"/g)) {
    const pkg = match[1].startsWith("@")
      ? match[1].split("/").slice(0, 2).join("/")
      : match[1].split("/")[0];
    // react is a peer dependency, like in every other registry item.
    assert.ok(
      pkg === "react" || names.has(pkg),
      `${pkg} is imported but not declared`
    );
  }
  assert.ok(!source.includes("@/"), "no website-only imports");
});

test("DateTimePicker stories import only installed pieces", () => {
  const stories = readFileSync(
    "registry/new-york/date-time-picker.stories.tsx",
    "utf-8"
  );
  const local = [...stories.matchAll(/from "(\.[^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(local, ["./date-time-picker"]);
});

test("DateTimePicker playground code reproduces every control", () => {
  const { getInputPlaygroundCode, getInputPlaygroundDefaults } = jiti(
    "../lib/input-component-props.ts"
  );
  const code = getInputPlaygroundCode("date-time-picker", {
    ...getInputPlaygroundDefaults("date-time-picker"),
    clearable: true,
    dateFormat: "yyyy-MM-dd HH:mm",
    hourCycle: "24",
    motion: false,
    placeholder: "Pick a moment",
    precision: "second",
    readOnly: true,
  });
  for (const expected of [
    "<DateTimePicker",
    'precision={"second"}',
    'dateFormat={"yyyy-MM-dd HH:mm"}',
    'placeholder={"Pick a moment"}',
    "clearable",
    "hourCycle={24}",
    "readOnly",
    "motion={false}",
    '"@/components/ui/date-time-picker"',
  ]) {
    assert.ok(code.includes(expected), `${expected} in generated code`);
  }
});

test("DateTimeRangePicker installs its shared pieces through registry dependencies", () => {
  const entry = item("date-time-range-picker");
  assert.ok(
    entry.registryDependencies.some((url) =>
      url.endsWith("/date-time-picker.json")
    ),
    "depends on date-time-picker"
  );
  const source = readFileSync(entry.files[0].path, "utf-8");
  assert.ok(source.includes('from "./date-time-picker-parts"'));
  assert.ok(source.includes('from "./date-time-picker-utils"'));
  assert.ok(!source.includes("@/"), "no website-only imports");
  const stories = readFileSync(
    "registry/new-york/date-time-range-picker.stories.tsx",
    "utf-8"
  );
  assert.deepEqual(
    [...stories.matchAll(/from "(\.[^"]+)"/g)].map((m) => m[1]),
    ["./date-time-range-picker"]
  );
});

test("DateTimeRangePicker playground code reproduces every control", () => {
  const { getInputPlaygroundCode, getInputPlaygroundDefaults } = jiti(
    "../lib/input-component-props.ts"
  );
  const code = getInputPlaygroundCode("date-time-range-picker", {
    ...getInputPlaygroundDefaults("date-time-range-picker"),
    clearable: true,
    dateFormat: "PPP HH:mm",
    hourCycle: "24",
    motion: false,
    placeholder: "Pick a window",
    precision: "second",
  });
  for (const expected of [
    "<DateTimeRangePicker",
    'precision={"second"}',
    'dateFormat={"PPP HH:mm"}',
    'placeholder={"Pick a window"}',
    "clearable",
    "hourCycle={24}",
    "motion={false}",
    "useState<DateRange>",
    '"@/components/ui/date-time-range-picker"',
  ]) {
    assert.ok(code.includes(expected), `${expected} in generated code`);
  }
});

test("picker artifacts include every source file and stories remain optional", () => {
  for (const name of ["date-time-picker", "date-time-range-picker"]) {
    for (const suffix of ["", "-stories"]) {
      const entry = item(`${name}${suffix}`);
      const artifact = JSON.parse(
        readFileSync(`public/r/${name}${suffix}.json`, "utf-8")
      );
      assert.equal(artifact.files.length, entry.files.length);
      for (const file of artifact.files) {
        assert.equal(file.content, readFileSync(file.path, "utf-8"), file.path);
      }
      if (suffix) {
        assert.deepEqual(artifact.registryDependencies ?? [], []);
        assert.deepEqual(artifact.dependencies ?? [], []);
      }
    }
  }
});

test("picker playground hour cycle changes preview and code, and Reset restores both", async () => {
  for (const name of ["date-time-picker", "date-time-range-picker"]) {
    const f = await createAutocompleteFixture();
    try {
      const { InputFamilyPlayground } = f.jiti(
        "../components/input-family-playground.tsx"
      );
      await f.render(
        f.React.createElement(InputFamilyPlayground, { component: name })
      );
      const initialCode = document.querySelector("pre code").textContent;
      const control = document.querySelector(
        '[id$="-hourCycle"][role="combobox"]'
      );
      await f.React.act(() => control.click());
      const option = [...document.querySelectorAll('[role="option"]')].find(
        (el) => el.textContent.trim() === "24"
      );
      await f.React.act(() => option.click());
      assert.ok(
        document
          .querySelector("pre code")
          .textContent.includes("hourCycle={24}")
      );
      const trigger = document.querySelector(
        '[data-slot="playground-preview"] button'
      );
      await f.React.act(() => trigger.click());
      assert.equal(
        document.querySelectorAll(
          '[data-slot="time-column"][aria-label="AM/PM"]'
        ).length,
        0
      );
      assert.equal(
        document.querySelector('[data-slot="time-column"][aria-label="Hours"]')
          .children.length,
        24
      );
      await f.React.act(() =>
        document.dispatchEvent(
          new KeyboardEvent("keydown", { bubbles: true, key: "Escape" })
        )
      );
      const reset = [...document.querySelectorAll("button")].find(
        (el) => el.textContent.trim() === "Reset"
      );
      await f.React.act(() => reset.click());
      assert.equal(document.querySelector("pre code").textContent, initialCode);
      assert.ok(
        document.querySelector('[role="dialog"]') === null,
        "Reset closes the picker"
      );
      await f.React.act(() =>
        document
          .querySelector('[data-slot="playground-preview"] button')
          .click()
      );
      assert.equal(
        document.querySelector('[data-slot="time-column"][aria-label="Hours"]')
          .children.length,
        12
      );
      assert.ok(
        document.querySelector(
          '[data-slot="time-column"][aria-label="AM/PM"]'
        ) !== null,
        "Reset restores 12-hour columns"
      );
    } finally {
      await f.cleanup();
    }
  }
});

test("picker portable stories compose and accept public control overrides", async () => {
  const { composeStories } = await import("@storybook/react");
  for (const name of ["date-time-picker", "date-time-range-picker"]) {
    const stories = composeStories(
      jiti(`../registry/new-york/${name}.stories.tsx`)
    );
    for (const story of Object.values(stories)) {
      assert.match(
        renderToStaticMarkup(React.createElement(story)),
        /data-slot="popover-trigger"/
      );
    }
    const html = renderToStaticMarkup(
      React.createElement(stories.Playground, {
        disabled: true,
        label: "Custom time",
        placeholder: "Choose time",
      })
    );
    assert.match(html, /Custom time/);
    assert.match(html, /Choose time/);
    assert.match(html, /disabled=""/);
  }
});
