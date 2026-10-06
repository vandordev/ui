const assert = require("node:assert/strict");
const { existsSync, readFileSync } = require("node:fs");
const test = require("node:test");
const { createJiti } = require("jiti");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const ts = require("typescript");
const vm = require("node:vm");
const icons = require("lucide-react");
const jsxRuntime = require("react/jsx-runtime");
const registry = require("../registry.json");

// React useId reflects null child positions, not visual differences. Keep
// identity/reference relationships while comparing equivalent compositions.
const normalizeIds = (markup) => {
  const ids = new Map();
  return markup.replaceAll(/base-ui-_R_[\w]+_/g, (id) => {
    if (!ids.has(id)) {
      ids.set(id, `base-ui-id-${ids.size}`);
    }
    return ids.get(id);
  });
};

const withDOM = async (run) => {
  const { Window } = await import("happy-dom");
  const dom = new Window();
  // Happy DOM's WAAPI cancellation rejects unlike the browser path expected by
  // Motion. Exercise Motion's real JavaScript fallback for interaction checks.
  dom.Element.prototype.animate = undefined;
  const saved = new Map();
  for (const name of [
    "window",
    "document",
    "navigator",
    "HTMLElement",
    "Element",
    "Node",
    "getComputedStyle",
    "requestAnimationFrame",
    "cancelAnimationFrame",
    "IS_REACT_ACT_ENVIRONMENT",
  ]) {
    saved.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    let value = dom[name];
    if (name === "window") {
      value = dom;
    }
    if (name === "IS_REACT_ACT_ENVIRONMENT") {
      value = true;
    }
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value,
      writable: true,
    });
  }
  const { createRoot } = await import("react-dom/client");
  const host = document.createElement("div");
  document.body.append(host);
  let caught = 0;
  const root = createRoot(host, {
    onCaughtError: () => {
      caught += 1;
    },
  });
  try {
    await run({ getCaught: () => caught, host, root });
  } finally {
    await React.act(() => root.unmount());
    host.remove();
    await dom.happyDOM.abort();
    for (const [name, descriptor] of saved) {
      if (descriptor) {
        Object.defineProperty(globalThis, name, descriptor);
      } else {
        Reflect.deleteProperty(globalThis, name);
      }
    }
  }
};

test("ErrorState boundary example recovers after a rendering failure", async () => {
  assert.ok(
    existsSync("examples/error-state-boundary-demo.tsx"),
    "Boundary example must exist"
  );
  await withDOM(async ({ host, root, getCaught }) => {
    const { ErrorStateBoundaryDemo } = jiti(
      "../examples/error-state-boundary-demo.tsx"
    );
    await React.act(() =>
      root.render(React.createElement(ErrorStateBoundaryDemo))
    );
    assert.match(host.textContent, /Project preview is ready/);
    await React.act(() => host.querySelector("button").click());
    assert.equal(getCaught(), 1);
    assert.match(host.textContent, /Unable to display this preview/);
    assert.ok(
      !host.textContent.includes("Intentional demo failure"),
      "Raw exception must not appear"
    );
    await React.act(() => host.querySelector("button").click());
    assert.match(host.textContent, /Project preview is ready/);
    assert.ok(
      host.querySelector('[data-slot="error-state"]') === null,
      "Fallback must unmount after reset"
    );
  });
});

test("ErrorState playground Reset removes support details and restores hidden media and actions", async () => {
  await withDOM(async ({ host, root }) => {
    const { ErrorStatePlayground } = jiti(
      "../components/error-state-playground.tsx"
    );
    await React.act(() =>
      root.render(React.createElement(ErrorStatePlayground))
    );
    const control = (label) =>
      host.querySelector(`button[aria-label="${label}"]`);
    await React.act(() => control("Show support details").click());
    await React.act(() => control("Show icon").click());
    await React.act(() => control("Show retry").click());
    const preview = () =>
      host.querySelector('[data-slot="playground-preview"]');
    const details = preview().querySelector(
      '[data-slot="error-state-details"]'
    );
    assert.ok(
      details !== null,
      "Details must be included after enabling its control"
    );
    const trigger = details.querySelector("button");
    assert.equal(trigger.getAttribute("aria-expanded"), "false");
    await React.act(() => trigger.click());
    assert.equal(trigger.getAttribute("aria-expanded"), "true");
    assert.ok(
      preview().querySelector('[data-slot="error-state-media"]') === null,
      "Icon control must remove media"
    );
    assert.ok(
      preview().querySelector('[data-slot="error-state-actions"]') === null,
      "Retry control must remove action"
    );
    const reset = [...host.querySelectorAll("button")].find(
      (button) => button.textContent.trim() === "Reset"
    );
    await React.act(() => reset.click());
    assert.ok(
      preview().querySelector('[data-slot="error-state-details"]') === null,
      "Reset must remove transient disclosure"
    );
    assert.ok(
      preview().querySelector('[data-slot="error-state-media"]') !== null,
      "Reset must restore icon"
    );
    assert.match(preview().textContent, /Try again/);
    assert.equal(
      control("Show support details").getAttribute("aria-checked"),
      "false"
    );
    const code = host.querySelector(
      'pre[aria-label="Generated component code"]'
    ).textContent;
    assert.ok(
      !code.includes("<ErrorStateDetails"),
      "Reset code must omit details"
    );
  });
});

const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});

test("ErrorState details stay opt-in and closed while preserving native accessibility hooks", () => {
  assert.ok(
    existsSync("registry/new-york/error-state.tsx"),
    "ErrorState must exist"
  );
  const {
    ErrorState,
    ErrorStateContent,
    ErrorStateHeader,
    ErrorStateTitle,
    ErrorStateDescription,
    ErrorStateDetails,
  } = jiti("../registry/new-york/error-state.tsx");
  const markup = renderToStaticMarkup(
    React.createElement(
      ErrorState,
      { "aria-labelledby": "failure", role: "region", variant: "inline" },
      React.createElement(
        ErrorStateContent,
        null,
        React.createElement(
          ErrorStateHeader,
          null,
          React.createElement(
            ErrorStateTitle,
            { "aria-level": 2, id: "failure", role: "heading" },
            "Unable to load"
          ),
          React.createElement(ErrorStateDescription, null, "Try again.")
        ),
        React.createElement(
          ErrorStateDetails,
          { open: true, summary: "Support details" },
          "Request: <safe>"
        )
      )
    )
  );
  assert.match(markup, /data-variant="inline"/);
  assert.match(markup, /role="region"/);
  assert.match(markup, /aria-labelledby="failure"/);
  assert.match(markup, /<button[^>]*aria-expanded="true"/);
  assert.match(markup, /Support details/);
  assert.match(markup, /Request: &lt;safe&gt;/);
  const closed = renderToStaticMarkup(
    React.createElement(ErrorStateDetails, null, "Safe reference")
  );
  assert.match(closed, /aria-expanded="false"/);
  const initiallyOpen = renderToStaticMarkup(
    React.createElement(
      ErrorStateDetails,
      { defaultOpen: true },
      "Safe reference"
    )
  );
  assert.match(initiallyOpen, /aria-expanded="true"/);
  const withoutDetails = renderToStaticMarkup(
    React.createElement(ErrorState, null, "Failure")
  );
  assert.doesNotMatch(
    withoutDetails,
    /role="alert"|data-slot="error-state-details"/
  );
});

test("every ErrorState control safely serializes the same composition as the preview", () => {
  assert.ok(
    existsSync("lib/error-state-playground.ts"),
    "ErrorState playground must exist"
  );
  const { getErrorStateDefaults, getErrorStateCode } = jiti(
    "../lib/error-state-playground.ts"
  );
  const { ErrorStatePreview } = jiti(
    "../components/error-state-playground.tsx"
  );
  const component = jiti("../registry/new-york/error-state.tsx");
  const defaults = getErrorStateDefaults();
  for (const override of [
    {},
    { variant: "inline" },
    { border: "dashed" },
    { border: "solid" },
    { title: 'A "quoted" <title> {}\n' },
    { description: `A \`description\` \${value} <script>` },
    { showMedia: false },
    { showAction: false },
    { showDetails: true },
    {
      description: "",
      showAction: false,
      showDetails: true,
      showMedia: false,
      title: "",
      variant: "inline",
    },
  ]) {
    const values = { ...defaults, ...override };
    const compiled = ts.transpileModule(getErrorStateCode(values), {
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
          "@/components/ui/button": jiti("../registry/new-york/button.tsx"),
          "@/components/ui/error-state": component,
          "lucide-react": icons,
          "react/jsx-runtime": jsxRuntime,
        })[name],
    });
    const generated = renderToStaticMarkup(
      React.createElement(exports.ErrorStateDemo)
    );
    const preview = renderToStaticMarkup(
      React.createElement(ErrorStatePreview, { values })
    );
    assert.ok(
      normalizeIds(generated) === normalizeIds(preview),
      `Preview/code mismatch: ${JSON.stringify(override)}`
    );
    assert.ok(generated.includes('data-slot="error-state"'));
    assert.equal(
      generated.includes('data-slot="error-state-details"'),
      values.showDetails
    );
    assert.equal(
      generated.includes('data-slot="error-state-actions"'),
      values.showAction
    );
  }
  defaults.title = "Changed";
  assert.equal(getErrorStateDefaults().title, "Unable to load projects");
});

test("ErrorState stories compose meaningful variants and registry artifacts remain self-contained", async () => {
  for (const name of ["error-state", "error-state-stories"]) {
    const item = registry.items.find((entry) => entry.name === name);
    assert.ok(item);
    const artifact = JSON.parse(readFileSync(`public/r/${name}.json`, "utf-8"));
    assert.equal(artifact.files.length, name === "error-state" ? 3 : 1);
    assert.equal(artifact.files[0].target, undefined);
    assert.equal(
      artifact.files[0].content,
      readFileSync(item.files[0].path, "utf-8")
    );
    for (const file of artifact.files) {
      assert.equal(file.content, readFileSync(file.path, "utf-8"));
      assert.equal(file.target, undefined);
    }
    assert.deepEqual(
      artifact.registryDependencies ?? [],
      name === "error-state"
        ? ["https://vandor-ui.vercel.app/r/accordion.json"]
        : []
    );
    assert.deepEqual(
      artifact.dependencies ?? [],
      name === "error-state" ? ["cn", "lucide-react"] : []
    );
  }
  const { composeStories } = await import("@storybook/react");
  const stories = composeStories(
    jiti("../registry/new-york/error-state.stories.tsx")
  );
  for (const name of [
    "Playground",
    "Inline",
    "WithSupportDetails",
    "WithoutMedia",
    "AccessRequired",
    "LongContent",
  ]) {
    assert.match(
      renderToStaticMarkup(React.createElement(stories[name])),
      /data-slot="error-state"/
    );
  }
  const override = renderToStaticMarkup(
    React.createElement(stories.Playground, {
      showAction: false,
      showDetails: true,
      showMedia: false,
      title: "Permission required",
      variant: "inline",
    })
  );
  assert.match(override, /Permission required/);
  assert.match(override, /data-variant="inline"/);
  assert.match(override, /data-slot="error-state-details"/);
  assert.doesNotMatch(
    override,
    /data-slot="error-state-media"|data-slot="error-state-actions"/
  );
});

test("ErrorState Accordion details honor controlled open state and disable interaction", async () => {
  await withDOM(async ({ host, root }) => {
    const { ErrorStateDetails } = jiti("../registry/new-york/error-state.tsx");
    const changes = [];
    const render = (props) =>
      React.act(() =>
        root.render(
          React.createElement(
            ErrorStateDetails,
            { onOpenChange: (open) => changes.push(open), ...props },
            "Safe support reference"
          )
        )
      );
    await render({ open: false });
    let trigger = host.querySelector("button");
    assert.equal(trigger.getAttribute("aria-expanded"), "false");
    await React.act(() => trigger.click());
    assert.deepEqual(changes, [true]);
    assert.equal(trigger.getAttribute("aria-expanded"), "false");
    await render({ open: true });
    trigger = host.querySelector("button");
    assert.equal(trigger.getAttribute("aria-expanded"), "true");
    assert.match(host.textContent, /Safe support reference/);
    await React.act(() => trigger.click());
    assert.deepEqual(changes, [true, false]);
    await render({ disabled: true, open: false });
    await React.act(() => host.querySelector("button").click());
    assert.deepEqual(changes, [true, false]);
  });
});
