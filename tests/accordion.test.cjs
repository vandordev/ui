const assert = require("node:assert/strict");
const test = require("node:test");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { createJiti } = require("jiti");
const registry = require("../registry.json");

const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});
const el = React.createElement;

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
