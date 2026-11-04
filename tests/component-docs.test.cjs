const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
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

test("DataGrid documentation retains standard sections and native contract ownership", () => {
  const { buildComponentDocSections, componentFrontmatterSchema } = jiti(
    "../lib/component-docs.ts"
  );
  const sections = buildComponentDocSections(
    { component: "data-grid" },
    "export function DataGrid() {}"
  );
  assert.equal(
    componentFrontmatterSchema.safeParse({ component: "data-grid" }).success,
    true
  );
  assert.deepEqual(headings(sections.before), [
    "Playground",
    "Installation",
    "Dependencies",
  ]);
  assert.deepEqual(headings(sections.after), ["Props", "Source"]);
  const text = JSON.stringify(sections);
  for (const value of [
    "node scripts/install-component-family.cjs data-grid /absolute/path/to/consumer",
    "@tanstack/react-table@^9.2.6",
    "QueryClientProvider",
    "renderEmpty",
    "columnVisibility",
    "DataGridFilter",
  ]) {
    assert.ok(text.includes(value), value);
  }
  const mdx = readFileSync("content/docs/components/data-grid.mdx", "utf-8");
  assert.ok(mdx.includes("Copying the Source block alone is insufficient"));
  assert.ok(mdx.includes("data-grid-schema.json"));
  assert.ok(
    mdx.includes(
      "node scripts/install-component-family.cjs data-grid-stories /absolute/path/to/consumer"
    )
  );
  assert.ok(
    !mdx.includes(
      "npx shadcn@latest add https://vandor-ui.vercel.app/r/data-grid-stories.json"
    ),
    "Stories must resolve the configured family alias through the wrapper"
  );
});

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
    "npm install class-variance-authority cn motion @base-ui/react",
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
  assert.ok(!headings(sections.after).includes("Source"));
  assert.ok(!headings(sections.after).includes("Credits"));
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

test("Source selects each public implementation instead of its helpers", async () => {
  const { remarkComponentDocs } = jiti("../lib/remark-component-docs.ts");
  for (const name of ["autocomplete", "data-grid", "date-time"]) {
    const tree = { children: [], type: "root" };
    await remarkComponentDocs()(tree, {
      data: { frontmatter: { component: name } },
    });
    const source = tree.children.find((node) =>
      node.attributes?.some(
        (attribute) =>
          attribute.name === "section" && attribute.value === "source"
      )
    );
    assert.ok(source, `${name} has Source`);
    assert.ok(
      source.children[0].value ===
        readFileSync(`registry/new-york/${name}.tsx`, "utf-8"),
      `${name} implementation matches Source`
    );
  }
});

test("processed installation guidance discloses registry dependencies and supporting files", async () => {
  const { remarkComponentDocs } = jiti("../lib/remark-component-docs.ts");
  for (const [name, requirements] of [
    ["input-password", ["input.json", "button.json"]],
    ["toast", ["toast-utils.ts"]],
    [
      "loading",
      [
        "node scripts/install-component-family.cjs loading /absolute/path/to/consumer",
        "components/loading-ui/LICENSE.md",
      ],
    ],
  ]) {
    const tree = { children: [], type: "root" };
    await remarkComponentDocs()(tree, {
      data: { frontmatter: { component: name } },
    });
    const output = JSON.stringify(tree);
    assert.ok(
      output.includes("Copying the Source block alone is insufficient")
    );
    for (const requirement of requirements) {
      assert.ok(output.includes(requirement), requirement);
    }
  }
});

test("date picker props describe their restricted native API", () => {
  const { buildComponentDocSections } = jiti("../lib/component-docs.ts");
  for (const component of [
    "date-picker",
    "date-range-picker",
    "date-time-picker",
    "date-time-range-picker",
  ]) {
    const output = JSON.stringify(
      buildComponentDocSections({ component }, null)
    );
    assert.ok(
      output.includes("does not forward arbitrary native attributes"),
      component
    );
    assert.ok(
      !output.includes("Other native attributes are forwarded"),
      component
    );
  }
});
