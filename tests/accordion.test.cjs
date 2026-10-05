const assert = require("node:assert/strict");
const test = require("node:test");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { createJiti } = require("jiti");
const registry = require("../registry.json");
const { readFileSync } = require("node:fs");
const { composeStories } = require("@storybook/react");
const ts = require("typescript");
const vm = require("node:vm");
const icons = require("lucide-react");
const jsxRuntime = require("react/jsx-runtime");

const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});
const el = React.createElement;

test("Accordion icon controls reproduce the preview and portable stories wire their args", () => {
  const { getAccordionCode, getAccordionDefaults, getAccordionIconProps } =
    jiti("../lib/accordion-playground.ts");
  const component = jiti("../registry/new-york/accordion.tsx");
  const stories = composeStories(
    jiti("../registry/new-york/accordion.stories.tsx")
  );
  for (const iconStyle of ["chevron", "plus-minus", "plus-rotate", "none"]) {
    const props = getAccordionIconProps(iconStyle);
    const code = getAccordionCode({ ...getAccordionDefaults(), iconStyle });
    const compiled = ts.transpileModule(code, {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.CommonJS,
      },
      reportDiagnostics: true,
    });
    assert.equal(compiled.diagnostics.length, 0);
    const exports = {};
    vm.runInNewContext(compiled.outputText, {
      exports,
      require: (name) =>
        ({
          "@/components/ui/accordion": component,
          "lucide-react": icons,
          "react/jsx-runtime": jsxRuntime,
        })[name],
    });
    const generated = renderToStaticMarkup(el(exports.AccordionDemo));
    const story = renderToStaticMarkup(el(stories.Playground, { iconStyle }));
    if (iconStyle === "none") {
      assert.equal(props.icon, null);
      assert.doesNotMatch(generated, /accordion-trigger-icon/);
      assert.doesNotMatch(story, /accordion-trigger-icon/);
    } else {
      const iconName = iconStyle === "chevron" ? "chevron-down" : "plus";
      assert.match(generated, new RegExp(`lucide-${iconName}`));
      assert.match(story, new RegExp(`lucide-${iconName}`));
      if (iconStyle === "plus-minus") {
        assert.ok(props.expandedIcon);
        assert.match(generated, /lucide-minus/);
        assert.match(story, /lucide-minus/);
      }
      if (iconStyle === "plus-rotate") {
        assert.equal(props.iconRotation, 45);
        assert.match(generated, /rotate\(45deg\)/);
        assert.match(story, /rotate\(45deg\)/);
      }
    }
  }
  for (const name of ["accordion", "accordion-stories"]) {
    const artifact = JSON.parse(readFileSync(`public/r/${name}.json`, "utf-8"));
    const item = registry.items.find((entry) => entry.name === name);
    assert.deepEqual(artifact.dependencies ?? [], item.dependencies ?? []);
    assert.deepEqual(artifact.registryDependencies ?? [], []);
    for (const file of artifact.files) {
      assert.equal(file.content, readFileSync(file.path, "utf-8"));
      assert.equal(file.target, undefined);
    }
  }
});

test("Accordion custom icons preserve default rotation, allow swapping, and can be hidden", () => {
  const { Accordion, AccordionItem, AccordionTrigger } = jiti(
    "../registry/new-york/accordion.tsx"
  );
  const render = (triggerProps, open = false) =>
    renderToStaticMarkup(
      el(
        Accordion,
        { defaultValue: open ? ["custom"] : [] },
        el(
          AccordionItem,
          { value: "custom" },
          el(AccordionTrigger, triggerProps, "Details")
        )
      )
    );
  const custom = render(
    { icon: el("svg", { "data-custom-icon": true }), iconRotation: 90 },
    true
  );
  assert.match(custom, /data-custom-icon="true"/);
  assert.match(custom, /rotate\(90deg\)/);
  assert.doesNotMatch(
    render({ icon: null }),
    /data-slot="accordion-trigger-icon"/
  );
  const swapped = render(
    {
      expandedIcon: el("svg", { "data-open-icon": true }),
      icon: el("svg", { "data-closed-icon": true }),
    },
    true
  );
  assert.match(swapped, /data-open-icon="true"/);
  assert.match(swapped, /data-closed-icon="true"/);
  assert.match(
    swapped,
    /data-slot="accordion-trigger-icon"[^>]*aria-hidden="true"|aria-hidden="true"[^>]*data-slot="accordion-trigger-icon"/
  );
  assert.doesNotMatch(swapped, /rotate\(180deg\)/);
});

test("Accordion registry declares Motion and initially open panels do not collapse on first paint", () => {
  assert.ok(
    registry.items
      .find((item) => item.name === "accordion")
      .dependencies.includes("motion")
  );
  const html = renderAccordion({ defaultValue: ["first"] });
  assert.match(html, /rotate\(180deg\)/);
  assert.match(html, /height:auto;opacity:1/);
});

const renderAccordion = (props = {}, itemProps = {}) => {
  const { Accordion, AccordionItem, AccordionTrigger, AccordionContent } = jiti(
    "../registry/new-york/accordion.tsx"
  );
  return renderToStaticMarkup(
    el(
      Accordion,
      props,
      ...["first", "second"].map((value) =>
        el(
          AccordionItem,
          { key: value, value, ...itemProps },
          el(AccordionTrigger, null, value),
          el(AccordionContent, null, `${value} content`)
        )
      )
    )
  );
};

test("Accordion preserves heading, button and labelled panel semantics", () => {
  const html = renderAccordion({ defaultValue: ["first"] });
  assert.match(html, /<h3/);
  assert.match(html, /<button[^>]*aria-expanded="true"/);
  const [, panelId] = html.match(/aria-controls="([^"]+)"/);
  const [, triggerId] = html.match(/aria-labelledby="([^"]+)"/);
  assert.ok(html.includes(`id="${panelId}"`));
  assert.ok(html.includes(`id="${triggerId}"`));
  assert.match(html, /first content/);
  assert.ok(!html.includes("second content"));
});

test("Accordion forwards multiple, controlled values and disabled states", () => {
  const html = renderAccordion({
    disabled: true,
    multiple: true,
    value: ["first", "second"],
  });
  assert.equal((html.match(/aria-expanded="true"/g) ?? []).length, 2);
  assert.equal((html.match(/<button[^>]*disabled=""/g) ?? []).length, 2);
  assert.match(renderAccordion({}, { disabled: true }), /data-disabled/);
});

test("Accordion preserves mounted content settings inherited from its root", () => {
  assert.match(renderAccordion({ keepMounted: true }), /second content/);
  assert.match(renderAccordion({ hiddenUntilFound: true }), /second content/);
  assert.ok(!renderAccordion().includes("second content"));
});

test("Motion wrappers preserve custom trigger and panel render elements", () => {
  const { Accordion, AccordionItem, AccordionTrigger, AccordionContent } = jiti(
    "../registry/new-york/accordion.tsx"
  );
  const html = renderToStaticMarkup(
    el(
      Accordion,
      { defaultValue: ["custom"] },
      el(
        AccordionItem,
        { value: "custom" },
        el(
          AccordionTrigger,
          { render: el("button", { "data-custom-trigger": true }) },
          "Custom heading"
        ),
        el(
          AccordionContent,
          { render: el("section", { "data-custom-panel": true }) },
          "Custom content"
        )
      )
    )
  );
  assert.equal((html.match(/<button/g) ?? []).length, 1);
  assert.match(html, /data-custom-trigger="true"/);
  assert.match(html, /<section[^>]*data-custom-panel="true"/);
  assert.match(html, /Custom heading/);
  assert.match(html, /Custom content/);
});

test("Accordion playground code reflects multiple and disabled controls", () => {
  const { getAccordionCode, getAccordionDefaults } = jiti(
    "../lib/accordion-playground.ts"
  );
  const code = getAccordionCode({
    ...getAccordionDefaults(),
    disabled: true,
    multiple: true,
  });
  assert.ok(code.includes(" multiple"));
  assert.ok(code.includes(" disabled"));
  assert.ok(code.includes('defaultValue={["accessible"]}'));
  assert.ok(code.includes("<AccordionContent>"));
  const defaults = getAccordionCode(getAccordionDefaults());
  const [openingTag] = defaults.match(/<Accordion [^>]+>/);
  assert.ok(!openingTag.includes(" multiple"));
  assert.ok(!openingTag.includes(" disabled"));
});
