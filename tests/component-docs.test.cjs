const assert = require("node:assert/strict");
const test = require("node:test");
const { createJiti } = require("jiti");

const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
});

const headings = (nodes) =>
  nodes
    .filter((node) => node.type === "heading")
    .map((node) => node.children[0].value);

test("component metadata generates ordered sections from registry and shared props", () => {
  const { buildComponentDocSections } = jiti("../lib/component-docs.ts");
  const sections = buildComponentDocSections(
    {
      component: "button",
      credits: [
        {
          contribution: "Original code.",
          name: "shadcn/ui",
          url: "https://ui.shadcn.com",
        },
      ],
    },
    "export const Button = () => null;"
  );
  assert.deepEqual(headings(sections.before), [
    "Playground",
    "Installation",
    "Dependencies",
  ]);
  assert.deepEqual(headings(sections.after), ["Props", "Source", "Credits"]);
  const serialized = JSON.stringify(sections);
  for (const value of [
    "npm install class-variance-authority cn motion radix-ui",
    "https://vandor-ui.vercel.app/r/button.json",
    "whileTap",
    "export const Button",
    "Original code.",
  ]) {
    assert.ok(serialized.includes(value), value);
  }
});

test("optional sections are omitted and non-component pages are unchanged", () => {
  const { buildComponentDocSections } = jiti("../lib/component-docs.ts");
  assert.deepEqual(buildComponentDocSections({}, null), {
    after: [],
    before: [],
  });
  const sections = buildComponentDocSections({ component: "button" }, null);
  assert.ok(!JSON.stringify(sections).includes("Source"));
  assert.ok(!JSON.stringify(sections).includes("Credits"));
  assert.throws(
    () => buildComponentDocSections({ component: "missing" }, null),
    /Unknown registry component/
  );
});

test("documentation frontmatter validates credits and rejects unknown components", () => {
  const { componentFrontmatterSchema } = jiti("../lib/component-docs.ts");
  assert.equal(
    componentFrontmatterSchema.safeParse({ component: "button", credits: [] })
      .success,
    true
  );
  assert.equal(
    componentFrontmatterSchema.safeParse({ component: "missing" }).success,
    false
  );
  assert.equal(
    componentFrontmatterSchema.safeParse({
      component: "button",
      credits: [
        // eslint-disable-next-line no-script-url -- Reject executable attribution URLs.
        { contribution: "Code", name: "Bad", url: "javascript:alert(1)" },
      ],
    }).success,
    false
  );
});

test("remark transformer preserves imports and custom content between standard sections", async () => {
  const { remarkComponentDocs } = jiti("../lib/remark-component-docs.ts");
  const esm = { type: "mdxjsEsm", value: 'import { Demo } from "./demo";' };
  const usage = {
    children: [{ type: "text", value: "Usage" }],
    depth: 2,
    type: "heading",
  };
  const tree = { children: [esm, usage], type: "root" };
  await remarkComponentDocs()(tree, {
    data: { frontmatter: { component: "button" } },
  });
  assert.equal(tree.children[0], esm);
  assert.deepEqual(headings(tree.children), [
    "Playground",
    "Installation",
    "Dependencies",
    "Usage",
    "Props",
    "Source",
  ]);
  const regular = { children: [usage], type: "root" };
  await remarkComponentDocs()(regular, {
    data: { frontmatter: { title: "Introduction" } },
  });
  assert.deepEqual(regular.children, [usage]);
});
