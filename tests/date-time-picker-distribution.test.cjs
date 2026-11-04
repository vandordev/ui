const assert = require("node:assert/strict");
const { existsSync, readFileSync } = require("node:fs");
const test = require("node:test");
const { createJiti } = require("jiti");
const registry = require("../registry.json");

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
  assert.ok(source.includes('from "./date-time-picker"'));
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
    "motion={false}",
    "useState<DateRange>",
    '"@/components/ui/date-time-range-picker"',
  ]) {
    assert.ok(code.includes(expected), `${expected} in generated code`);
  }
});
