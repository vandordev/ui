/* eslint-disable global-require -- Generated snippets resolve real components in the scoped VM. */
const assert = require("node:assert/strict");
const test = require("node:test");
const ts = require("typescript");
const { createJiti } = require("jiti");
const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
});

test("DateTime playground presets serialize valid typed JSX and reset to fixed defaults", () => {
  const { getDateTimeCode, getDateTimeDefaults } = jiti(
    "../lib/date-time-playground.ts"
  );
  const defaults = getDateTimeDefaults();
  const hostile = {
    ...defaults,
    display: "date",
    fallback: 'A "quoted" <label> {value}\nnext',
    locale: "id-ID",
    timeZone: "Asia/Jakarta",
  };
  const code = getDateTimeCode(hostile);
  assert.ok(
    code.includes(JSON.stringify(hostile.fallback)),
    "Hostile fallback is safely serialized"
  );
  assert.match(code, /format=\{\{"dateStyle":"medium"\}\}/);
  const output = ts.transpileModule(code, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext },
    reportDiagnostics: true,
  });
  assert.deepEqual(output.diagnostics, []);
  assert.equal(getDateTimeDefaults().value, "2026-10-24T08:00:00Z");
});

test("DateTime generated JSX safely renders hostile fallback like its real preview", async () => {
  const {
    createAutocompleteFixture,
  } = require("./autocomplete-ui-fixture.cjs");
  const f = await createAutocompleteFixture();
  try {
    const { getDateTimeCode, getDateTimeDefaults } = f.jiti(
      "../lib/date-time-playground.ts"
    );
    const { DateTime } = f.jiti("../registry/new-york/date-time.tsx");
    const { DateTimePreview } = f.jiti(
      "../components/date-time-playground.tsx"
    );
    const { runInNewContext } = require("node:vm");
    for (const override of [
      {},
      { display: "date", locale: "id-ID", timeZone: "Asia/Jakarta" },
      { display: "time", timeZone: "America/New_York" },
      { fallback: 'A "quoted" <label> {value}\nnext', value: "invalid" },
    ]) {
      const values = { ...getDateTimeDefaults(), ...override };
      const compiled = ts.transpileModule(getDateTimeCode(values), {
        compilerOptions: {
          jsx: ts.JsxEmit.ReactJSX,
          module: ts.ModuleKind.CommonJS,
        },
        reportDiagnostics: true,
      });
      assert.equal(
        compiled.diagnostics.length,
        0,
        "Generated JSX parses safely"
      );
      const exports = {};
      runInNewContext(compiled.outputText, {
        exports,
        require: (name) =>
          name === "@/components/date-time" ? { DateTime } : require(name),
      });
      await f.render(f.React.createElement(DateTimePreview, { values }));
      const preview = document.querySelector("time");
      const expected = {
        dateTime: preview.getAttribute("datetime"),
        text: preview.textContent,
      };
      await f.render(f.React.createElement(exports.DateTimeDemo));
      const generated = document.querySelector("time");
      assert.deepEqual(
        {
          dateTime: generated.getAttribute("datetime"),
          text: generated.textContent,
        },
        expected
      );
    }
  } finally {
    await f.cleanup();
  }
});

test("DateTime docs register the standard playground and optional stories item", () => {
  const registry = require("../registry.json");
  assert.ok(registry.items.some((item) => item.name === "date-time"));
  assert.ok(registry.items.some((item) => item.name === "date-time-stories"));
  assert.ok(
    !registry.items.find((item) => item.name === "date-time-stories")
      .registryDependencies
  );
});
