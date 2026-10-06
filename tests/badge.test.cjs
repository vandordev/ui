const assert = require("node:assert/strict");
const { existsSync } = require("node:fs");
const { test } = require("node:test");
const { createJiti } = require("jiti");

test("Badge preserves native refs/link handlers and playground Customize, Reset and Copy wiring", async () => {
  assert.ok(
    existsSync("registry/new-york/badge.tsx"),
    "Registry Badge implementation must exist"
  );
  const { Window } = await import("happy-dom");
  const dom = new Window();
  // Happy DOM's WAAPI cancellation rejects on teardown; use Motion's JS fallback.
  // This test covers DOM wiring, not browser animation rendering.
  delete dom.Element.prototype.animate;
  const previous = new Map();
  for (const name of [
    "window",
    "document",
    "navigator",
    "HTMLElement",
    "HTMLInputElement",
    "HTMLButtonElement",
    "SVGElement",
    "Element",
    "Node",
    "NodeFilter",
    "Event",
    "MouseEvent",
    "KeyboardEvent",
    "MutationObserver",
    "ResizeObserver",
    "requestAnimationFrame",
    "cancelAnimationFrame",
    "getComputedStyle",
  ]) {
    previous.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value: name === "window" ? dom : dom[name],
    });
  }
  previous.set(
    "IS_REACT_ACT_ENVIRONMENT",
    Object.getOwnPropertyDescriptor(globalThis, "IS_REACT_ACT_ENVIRONMENT")
  );
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const React = require("react");
  const { createRoot } = require("react-dom/client");
  const jiti = createJiti(__filename, {
    alias: { "@": process.cwd() },
    fsCache: false,
    jsx: { runtime: "automatic" },
  });
  const { Badge } = jiti("../registry/new-york/badge.tsx");
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    const ref = React.createRef();
    await React.act(async () =>
      root.render(
        React.createElement(
          Badge,
          {
            ref,
            id: "ready",
            role: "status",
            "aria-live": "polite",
            className: "rounded-none",
          },
          "Ready"
        )
      )
    );
    assert.equal(host.firstElementChild.tagName, "SPAN");
    assert.equal(host.firstElementChild.getAttribute("aria-live"), "polite");
    assert.ok(
      ref.current === host.firstElementChild,
      "Native ref reaches badge span"
    );
    assert.equal(
      host.firstElementChild.className.includes("rounded-md"),
      false
    );
    let consumer = 0,
      child = 0;
    const linkRef = React.createRef();
    await React.act(async () =>
      root.render(
        React.createElement(
          Badge,
          {
            ref,
            variant: "success-light",
            size: "sm",
            radius: "full",
            onClick: () => {
              consumer += 1;
            },
            render: React.createElement("a", {
              ref: linkRef,
              href: "#ready",
              onClick: (event) => {
                event.preventDefault();
                child += 1;
              },
            }),
          },
          "Ready"
        )
      )
    );
    const link = host.querySelector("a");
    assert.equal(link.getAttribute("href"), "#ready");
    assert.equal(link.getAttribute("data-variant"), "success-light");
    assert.ok(
      ref.current === link && linkRef.current === link,
      "Both public and render refs reach link"
    );
    await React.act(async () => link.click());
    assert.equal(consumer, 1);
    assert.equal(child, 1);
    assert.equal(host.querySelectorAll("span").length, 0);
    const { BadgePlayground } = jiti("../components/badge-playground.tsx");
    await React.act(async () =>
      root.render(React.createElement(BadgePlayground))
    );
    const label = host.querySelector('input[id$="-children"]');
    await React.act(async () => {
      Object.getOwnPropertyDescriptor(
        dom.HTMLInputElement.prototype,
        "value"
      ).set.call(label, "Changed status");
      label.dispatchEvent(new dom.Event("input", { bubbles: true }));
    });
    assert.equal(
      host.querySelector('[data-slot="badge"]').textContent,
      "Changed status"
    );
    assert.ok(host.querySelector("pre").textContent.includes("Changed status"));
    for (const [field, value] of [
      ["variant", "warning-light"],
      ["size", "xl"],
      ["radius", "full"],
      ["indicator", "spinner"],
    ]) {
      await React.act(async () =>
        host.querySelector(`[id$="-${field}"]`).click()
      );
      await React.act(
        async () => new Promise((resolve) => setTimeout(resolve, 30))
      );
      const option = [...document.querySelectorAll('[role="option"]')].find(
        (option) => option.textContent.trim() === value
      );
      assert.ok(Boolean(option), `Real ${field} control exposes ${value}`);
      await React.act(async () => option.click());
      await React.act(
        async () => new Promise((resolve) => setTimeout(resolve, 30))
      );
      const badge = host.querySelector('[data-slot="badge"]');
      if (field === "indicator")
        assert.ok(
          badge
            .querySelector("svg")
            .classList.contains("motion-safe:animate-spin")
        );
      else assert.equal(badge.getAttribute(`data-${field}`), value);
      assert.ok(
        host
          .querySelector("pre")
          .textContent.includes(
            field === "indicator" ? "LoaderCircle" : `${field}="${value}"`
          )
      );
    }
    let copied = "";
    Object.defineProperty(dom.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value) => {
          copied = value;
        },
      },
    });
    await React.act(async () =>
      host.querySelector('[aria-label="Copy playground code"]').click()
    );
    assert.equal(copied, host.querySelector("pre").textContent);
    await React.act(
      async () => new Promise((resolve) => setTimeout(resolve, 1050))
    );
    const reset = [...host.querySelectorAll("button")].find((button) =>
      button.textContent.includes("Reset")
    );
    await React.act(async () => reset.click());
    assert.equal(
      host.querySelector('[data-slot="badge"]').textContent,
      "Ready"
    );
    assert.equal(label.value, "Ready");
    assert.equal(
      host.querySelector('[data-slot="badge"]').getAttribute("data-variant"),
      "default"
    );
    assert.equal(
      host.querySelector('[data-slot="badge"]').getAttribute("data-size"),
      "default"
    );
    assert.equal(
      host.querySelector('[data-slot="badge"]').getAttribute("data-radius"),
      "default"
    );
    assert.equal(
      host.querySelector('[data-slot="badge"]').querySelectorAll("svg").length,
      0
    );
    assert.equal(
      host.querySelector("pre").textContent.includes("Changed status"),
      false
    );
  } finally {
    await React.act(async () => root.unmount());
    host.remove();
    await dom.happyDOM.abort();
    for (const [name, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  }
});

test("Badge preview and generated TSX agree for all variants, sizes, radii and indicators", () => {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const jiti = createJiti(__filename, {
    alias: { "@": process.cwd() },
    fsCache: false,
    jsx: { runtime: "automatic" },
  });
  const { getBadgeDefaults, getBadgeCode, badgePlaygroundDefinitions } = jiti(
    "../lib/badge-playground.ts"
  );
  const { BadgePlaygroundPreview } = jiti("../components/badge-playground.tsx");
  const ts = require("typescript");
  for (const field of ["variant", "size", "radius", "indicator", "children"]) {
    const definition = badgePlaygroundDefinitions[field].control;
    for (const value of definition.options ?? [
      'A "quoted" <status> & \\ path\nnext',
    ]) {
      const values = { ...getBadgeDefaults(), [field]: value };
      const markup = renderToStaticMarkup(
        React.createElement(BadgePlaygroundPreview, { values })
      );
      const source = getBadgeCode(values);
      if (["variant", "size", "radius"].includes(field)) {
        assert.ok(markup.includes(`data-${field}="${value}"`));
        assert.ok(source.includes(`${field}="${value}"`));
      } else if (field === "indicator") {
        assert.equal(markup.includes("aria-hidden"), value !== "none");
        assert.equal(source.includes("aria-hidden"), value !== "none");
        assert.equal(markup.includes("animate-spin"), value === "spinner");
        assert.equal(source.includes("animate-spin"), value === "spinner");
      } else {
        assert.ok(markup.includes("&lt;status&gt;"));
        assert.ok(source.includes(JSON.stringify(value)));
      }
      assert.deepEqual(
        (
          ts.transpileModule(source, {
            compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
            reportDiagnostics: true,
          }).diagnostics ?? []
        ).map((d) => d.code),
        []
      );
    }
  }
});

test("portable Badge stories compose real controls and representative children", async () => {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const { composeStories } = await import("@storybook/react");
  const jiti = createJiti(__filename, {
    fsCache: false,
    jsx: { runtime: "automatic" },
  });
  const stories = composeStories(
    jiti("../registry/new-york/badge.stories.tsx")
  );
  const markup = renderToStaticMarkup(
    React.createElement(stories.Playground, {
      variant: "warning-outline",
      size: "xl",
      radius: "full",
      children: "Needs review",
    })
  );
  for (const attribute of [
    'data-variant="warning-outline"',
    'data-size="xl"',
    'data-radius="full"',
    "Needs review",
  ])
    assert.ok(markup.includes(attribute));
  assert.equal(
    (
      renderToStaticMarkup(React.createElement(stories.Variants)).match(
        /data-slot="badge"/g
      ) ?? []
    ).length,
    23
  );
  assert.equal(
    (
      renderToStaticMarkup(React.createElement(stories.Sizes)).match(
        /data-slot="badge"/g
      ) ?? []
    ).length,
    5
  );
  for (const name of [
    "Pill",
    "WithDot",
    "WithIcon",
    "WithSpinner",
    "Link",
    "LongLabel",
  ]) {
    const output = renderToStaticMarkup(React.createElement(stories[name]));
    assert.ok(output.includes('data-slot="badge"'));
    if (name === "WithSpinner")
      assert.ok(
        output.includes('role="status"') &&
          output.includes("motion-safe:animate-spin")
      );
    if (name === "Link")
      assert.ok(output.includes("<a ") && output.includes("href="));
  }
});
