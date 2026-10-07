/* eslint-disable require-await, global-require, no-nested-ternary */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createJiti } = require("jiti");
const { createAutocompleteFixture } = require("./autocomplete-ui-fixture.cjs");
const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});
const p = jiti("../lib/autocomplete-playground.ts");

test("every playground control changes typed preview and reproducible generated code", () => {
  const defaults = p.getAutocompleteDefaults();
  const alternatives = {
    animated: false,
    autoHighlight: true,
    clearable: true,
    disabled: true,
    grouping: true,
    invalid: true,
    label: 'Quoted "label"\n<safe>',
    labelStyle: "floating",
    mode: "selection",
    multiple: true,
    placeholder: 'Search "x"\n<y>',
    readOnly: true,
    scenario: "loading",
    showTrigger: true,
    size: "sm",
  };
  const original = p.getAutocompleteCode(defaults);
  for (const [key, next] of Object.entries(alternatives)) {
    const values = { ...defaults, [key]: next };
    const config = p.getAutocompletePreviewConfig(values);
    const code = p.getAutocompleteCode(values);
    assert.notEqual(code, original, `${key} changes generated code`);
    if (key === "grouping") {
      assert.equal(config.groupBy(config.items[0]), "Libraries");
    } else if (key === "scenario") {
      assert.equal(config.loading, true);
    } else {
      assert.equal(config[key], next, `${key} changes preview props`);
    }
  }
  for (const mode of ["free-text", "selection"]) {
    for (const multiple of [false, true]) {
      for (const scenario of ["ready", "empty", "loading", "error"]) {
        const values = { ...defaults, mode, multiple, scenario };
        const config = p.getAutocompletePreviewConfig(values);
        assert.equal(config.mode, mode);
        assert.equal(config.multiple, multiple);
        assert.equal(config.items.length, scenario === "empty" ? 0 : 3);
      }
    }
  }
});

test("real preview uses typed config and shared playground Reset clears transient state", async () => {
  const f = await createAutocompleteFixture();
  try {
    const { AutocompletePreview, AutocompletePlayground } = f.jiti(
      "../components/autocomplete-playground.tsx"
    );
    const { renderToStaticMarkup } = require("react-dom/server");
    const defaults = p.getAutocompleteDefaults();
    for (const [name, definition] of Object.entries(p.autocompleteProps)) {
      if (!definition.control) {
        continue;
      }
      const { control } = definition;
      const next =
        control.kind === "boolean"
          ? !defaults[name]
          : control.kind === "select"
            ? control.options.find((value) => value !== defaults[name])
            : `Changed ${name}`;
      const values = { ...defaults, [name]: next };
      const element = AutocompletePreview({ values });
      const expected = p.getAutocompletePreviewConfig(values);
      for (const key of [
        "mode",
        "multiple",
        "label",
        "labelStyle",
        "placeholder",
        "size",
        "disabled",
        "readOnly",
        "invalid",
        "clearable",
        "showTrigger",
        "animated",
        "autoHighlight",
        "loading",
        "error",
      ]) {
        assert.equal(
          element.props[key],
          expected[key],
          `${name}: ${key} wired to actual preview`
        );
      }
      const html = renderToStaticMarkup(element);
      assert.match(html, /role="combobox"/);
    }
    await f.render(f.React.createElement(AutocompletePlayground));
    await f.input("Transient");
    const clearable = document.querySelector(
      '[role="switch"][aria-label="Clearable"]'
    );
    await f.React.act(async () => clearable.click());
    assert.equal(clearable.getAttribute("aria-checked"), "true");
    assert.ok(document.querySelector('[aria-label="Clear value"]'));
    assert.match(
      document.querySelector('[aria-label="Generated component code"]')
        .textContent,
      /clearable=\{true\}/
    );
    const reset = [...document.querySelectorAll("button")].find(
      (button) => button.textContent.trim() === "Reset"
    );
    await f.React.act(async () => reset.click());
    assert.equal(document.querySelector('[role="combobox"]').value, "");
    assert.equal(
      document
        .querySelector('[role="switch"][aria-label="Clearable"]')
        .getAttribute("aria-checked"),
      "false"
    );
    assert.equal(
      document.querySelector('[aria-label="Generated component code"]')
        .textContent,
      p.getAutocompleteCode(defaults)
    );
  } finally {
    await f.cleanup();
  }
});
