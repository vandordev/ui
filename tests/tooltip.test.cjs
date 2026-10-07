/* eslint-disable require-await, global-require */
const assert = require("node:assert/strict");
const { existsSync } = require("node:fs");
const { setTimeout: delay } = require("node:timers/promises");
const { after, afterEach, test } = require("node:test");
const { runInNewContext } = require("node:vm");
const { createJiti } = require("jiti");

const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});
let React, createRoot, dom, host, root, tooltip;
const ready = (async () => {
  const { Window } = await import("happy-dom");
  dom = new Window({ url: "http://localhost" });
  for (const name of [
    "window",
    "document",
    "navigator",
    "HTMLElement",
    "HTMLInputElement",
    "HTMLButtonElement",
    "Element",
    "Node",
    "NodeFilter",
    "MouseEvent",
    "PointerEvent",
    "KeyboardEvent",
    "MutationObserver",
    "ResizeObserver",
    "Event",
    "CustomEvent",
    "getComputedStyle",
    "requestAnimationFrame",
    "cancelAnimationFrame",
    "SVGElement",
  ]) {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value: name === "window" ? dom : dom[name],
      writable: true,
    });
  }
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  React = require("react");
  ({ createRoot } = require("react-dom/client"));
})();
const setup = async () => {
  await ready;
  assert.ok(
    existsSync("registry/new-york/tooltip.tsx"),
    "Registry Tooltip must exist"
  );
  tooltip = jiti("../registry/new-york/tooltip.tsx");
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
};
afterEach(async () => {
  if (root) {
    await React.act(async () => root.unmount());
    root = null;
    host.remove();
  }
});
after(async () => {
  await ready;
  await dom.happyDOM.abort();
});

test("Tooltip playground configuration produces matching preview props and safe runnable JSX", () => {
  assert.ok(
    existsSync("lib/tooltip-playground.ts"),
    "Tooltip playground metadata must exist"
  );
  const { getTooltipDefaults, getTooltipPreviewProps, getTooltipCode } = jiti(
    "../lib/tooltip-playground.ts"
  );
  const values = {
    ...getTooltipDefaults(),
    align: "end",
    animated: false,
    content: 'Save "A" <draft>\nnow',
    defaultOpen: true,
    delay: 300,
    disabled: true,
    showArrow: false,
    side: "right",
    sideOffset: 12,
  };
  assert.deepEqual(getTooltipPreviewProps(values), {
    content: {
      align: "end",
      animated: false,
      children: values.content,
      showArrow: false,
      side: "right",
      sideOffset: 12,
    },
    provider: { delay: 300 },
    root: {
      defaultOpen: true,
      defaultTriggerId: "tooltip-preview",
      disabled: true,
    },
  });
  const code = getTooltipCode(values);
  const ts = require("typescript");
  const js = ts.transpileModule(code, {
    compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const stubs = Object.fromEntries(
    ["TooltipProvider", "Tooltip", "TooltipTrigger", "TooltipContent"].map(
      (name) => [name, name]
    )
  );
  const output = { exports: {} };
  runInNewContext(
    js,
    {
      React: require("react"),
      exports: output.exports,
      module: output,
      require: (name) =>
        name.endsWith("/tooltip") ? stubs : { Button: "Button" },
    },
    { timeout: 1000 }
  );
  const tree = output.exports.TooltipDemo();
  assert.equal(tree.props.delay, 300);
  const tooltipRoot = tree.props.children;
  assert.equal(tooltipRoot.props.defaultOpen, true);
  assert.equal(tooltipRoot.props.defaultTriggerId, "tooltip-preview");
  assert.equal(tooltipRoot.props.disabled, true);
  const [, content] = tooltipRoot.props.children;
  assert.equal(content.props.side, "right");
  assert.equal(content.props.align, "end");
  assert.equal(content.props.sideOffset, 12);
  assert.equal(content.props.animated, false);
  assert.equal(content.props.showArrow, false);
  assert.equal(content.props.children, values.content);
});

test("Tooltip Motion enters from its resolved side and settles without an offset", async () => {
  await setup();
  const el = React.createElement;
  const ref = React.createRef();
  const { Tooltip, TooltipTrigger, TooltipContent } = tooltip;
  const currentRoot = root;
  for (const [side, axis, direction] of [
    ["top", "Y", 1],
    ["bottom", "Y", -1],
    ["left", "X", 1],
    ["right", "X", -1],
  ]) {
    await React.act(async () =>
      currentRoot.render(
        el(
          Tooltip,
          { key: side, open: true, triggerId: "motion-trigger" },
          el(TooltipTrigger, { id: "motion-trigger" }, "Save"),
          el(TooltipContent, { ref, side }, "Save changes")
        )
      )
    );
    assert.ok(ref.current, "Tooltip must mount for each placement");
    const translation = ref.current.style.transform.match(
      new RegExp(`translate${axis}\\((-?[\\d.]+)px\\)`)
    );
    assert.ok(
      translation && Number(translation[1]) * direction > 0,
      `${side} entrance must start toward the anchor (resolved=${ref.current.dataset.side}, transform=${ref.current.style.transform})`
    );
    await React.act(async () => delay(300));
    assert.equal(Number(ref.current.style.opacity), 1);
    assert.ok(
      !/translate[XY]\(/.test(ref.current.style.transform),
      "Settled tooltip must not retain a directional offset"
    );
  }
});

test("Tooltip Motion retains exit, survives reopening, and releases its portal", async () => {
  await setup();
  const el = React.createElement;
  const ref = React.createRef();
  const app = (open) =>
    el(
      tooltip.TooltipProvider,
      null,
      el(
        tooltip.Tooltip,
        { open, triggerId: "save" },
        el(
          tooltip.TooltipTrigger,
          { "aria-label": "Save", id: "save" },
          "Save"
        ),
        el(tooltip.TooltipContent, { ref }, "Save changes")
      )
    );
  await React.act(async () => root.render(app(true)));
  await React.act(async () => delay(240));
  const popup = ref.current;
  assert.ok(popup, "Controlled tooltip must mount");
  assert.equal(Number(popup.style.opacity), 1);
  await React.act(async () => root.render(app(false)));
  assert.ok(ref.current === popup, "Closing must retain the animated popup");
  await React.act(async () => root.render(app(true)));
  await React.act(async () => delay(240));
  assert.ok(
    ref.current === popup,
    "Interrupted exit must not unmount a reopened popup"
  );
  await React.act(async () => root.render(app(false)));
  await React.act(async () => delay(200));
  assert.ok(ref.current === null, "Finished exit must release the popup");
});

test("Tooltip hover honors provider timing, uses Motion, and skips touch hover", async () => {
  await setup();
  const el = React.createElement;
  const ref = React.createRef();
  await React.act(async () =>
    root.render(
      el(
        tooltip.TooltipProvider,
        { delay: 100 },
        el(
          tooltip.Tooltip,
          { disableHoverablePopup: true },
          el(tooltip.TooltipTrigger, { id: "hover-trigger" }, "Save"),
          el(tooltip.TooltipContent, { ref }, "Save changes")
        )
      )
    )
  );
  const trigger = host.querySelector("#hover-trigger");
  await React.act(async () => {
    trigger.dispatchEvent(
      new PointerEvent("pointerover", { bubbles: true, pointerType: "touch" })
    );
    trigger.dispatchEvent(new MouseEvent("mouseenter"));
    trigger.dispatchEvent(new MouseEvent("mousemove", { bubbles: true }));
  });
  await React.act(async () => delay(140));
  assert.ok(ref.current === null, "Touch must not reveal a hover-only tooltip");
  await React.act(async () => {
    trigger.dispatchEvent(
      new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" })
    );
    trigger.dispatchEvent(new MouseEvent("mouseenter"));
    trigger.dispatchEvent(new MouseEvent("mousemove", { bubbles: true }));
  });
  assert.ok(ref.current === null, "Hover delay must not open immediately");
  await React.act(async () => delay(140));
  assert.ok(ref.current, "Mouse hover must reveal the tooltip after its delay");
  await React.act(async () => delay(220));
  assert.equal(Number(ref.current.style.opacity), 1);
  await React.act(async () =>
    trigger.dispatchEvent(new MouseEvent("mouseleave"))
  );
  assert.ok(
    ref.current,
    "Hover exit must retain the popup for Motion dismissal"
  );
  await React.act(async () => delay(180));
  assert.ok(
    ref.current === null,
    "Hover exit must release its portal after animation"
  );
});

test("Tooltip composed Storybook Controls change actual public content and placement", async () => {
  await setup();
  const { composeStories } = await import("@storybook/react");
  const stories = composeStories(
    jiti("../registry/new-york/tooltip.stories.tsx")
  );
  await React.act(async () =>
    root.render(
      React.createElement(stories.Playground, {
        align: "end",
        animated: false,
        content: "Custom hint",
        defaultOpen: true,
        showArrow: false,
        side: "right",
      })
    )
  );
  const popup = document.querySelector('[data-slot="tooltip-content"]');
  assert.ok(popup, "Story defaultOpen control must show content");
  assert.equal(popup.textContent, "Custom hint");
  assert.equal(popup.dataset.side, "right");
  assert.equal(popup.dataset.align, "end");
  assert.ok(
    popup.querySelector('[data-slot="tooltip-arrow"]') === null,
    "Story arrow control must affect the public popup"
  );
});

test("Tooltip preserves custom render refs and cancellation on keyboard dismissal", async () => {
  await setup();
  const el = React.createElement;
  const ref = React.createRef();
  const triggerRef = React.createRef();
  const changes = [];
  let cancel = true;
  let focuses = 0;
  await React.act(async () =>
    root.render(
      el(
        tooltip.TooltipProvider,
        { delay: 0 },
        el(
          tooltip.Tooltip,
          {
            onOpenChange: (open, details) => {
              changes.push([open, details.reason]);
              if (!open && cancel) {
                details.cancel();
              }
            },
          },
          el(
            tooltip.TooltipTrigger,
            {
              onFocus: () => {
                focuses += 1;
              },
              ref: triggerRef,
            },
            "Save"
          ),
          el(
            tooltip.TooltipContent,
            {
              animated: false,
              ref,
              render: el("section", { "data-consumer": "yes" }),
            },
            "Save changes"
          )
        )
      )
    )
  );
  await React.act(async () => triggerRef.current.focus());
  assert.equal(focuses, 1);
  assert.ok(ref.current, "Keyboard focus must show the tooltip");
  assert.equal(ref.current.tagName, "SECTION");
  assert.equal(ref.current.dataset.consumer, "yes");
  const pressEscape = () =>
    triggerRef.current.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "Escape" })
    );
  await React.act(async () => pressEscape());
  assert.ok(ref.current, "Cancelled dismissal must remain visible");
  cancel = false;
  await React.act(async () => pressEscape());
  assert.ok(
    ref.current === null,
    "Non-animated dismissal must release the popup immediately"
  );
  assert.deepEqual(changes, [
    [true, "trigger-focus"],
    [false, "escape-key"],
    [false, "escape-key"],
  ]);
  assert.ok(
    document.activeElement === triggerRef.current,
    "Tooltip must not steal focus"
  );
});

test("Tooltip playground wires every control to the live preview and Reset clears transient visibility", async () => {
  await setup();
  const { TooltipPlayground } = jiti("../components/tooltip-playground.tsx");
  await React.act(async () =>
    root.render(React.createElement(TooltipPlayground))
  );
  const control = (name) => host.querySelector(`[id$="-${name}"]`);
  const select = async (name, value) => {
    await React.act(async () => control(name).click());
    const option = [...document.querySelectorAll('[role="option"]')].find(
      (item) => item.textContent.trim() === value
    );
    assert.ok(option, "Requested select option must exist");
    await React.act(async () => option.click());
  };
  const input = async (name, value) => {
    await React.act(async () => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value"
      ).set.call(control(name), value);
      control(name).dispatchEvent(new Event("input", { bubbles: true }));
      control(name).dispatchEvent(new Event("change", { bubbles: true }));
    });
  };
  await select("align", "end");
  await select("side", "right");
  await input("content", 'Save "draft"');
  await input("sideOffset", "12");
  await input("delay", "300");
  await React.act(async () => control("animated").click());
  await React.act(async () => control("showArrow").click());
  await React.act(async () => control("defaultOpen").click());
  const popup = document.querySelector('[data-slot="tooltip-content"]');
  assert.ok(popup, "Initially open control must open the preview");
  assert.equal(popup.dataset.align, "end");
  assert.equal(popup.dataset.side, "right");
  assert.equal(popup.textContent, 'Save "draft"');
  assert.ok(
    popup.querySelector('[data-slot="tooltip-arrow"]') === null,
    "Arrow control must remove the arrow"
  );
  const code = host.querySelector("pre").textContent;
  for (const fragment of [
    'align="end"',
    'side="right"',
    'Save \\"draft\\"',
    "sideOffset={12}",
    "delay={300}",
    "animated={false}",
    "showArrow={false}",
    "defaultOpen={true}",
  ]) {
    assert.ok(
      code.includes(fragment),
      `Generated code must include ${fragment}`
    );
  }
  await React.act(async () => control("disabled").click());
  assert.ok(
    document.querySelector('[data-slot="tooltip-content"]') === null,
    "Disable tooltip must dismiss its preview"
  );
  assert.ok(
    !host.querySelector('[data-slot="tooltip-trigger"]').disabled,
    "Tooltip disabling must leave the action usable"
  );
  assert.ok(host.querySelector("pre").textContent.includes("disabled={true}"));
  const reset = [...host.querySelectorAll("button")].find(
    (button) => button.textContent.trim() === "Reset"
  );
  await React.act(async () => reset.click());
  assert.equal(control("animated").getAttribute("aria-checked"), "true");
  assert.equal(control("showArrow").getAttribute("aria-checked"), "true");
  assert.equal(control("defaultOpen").getAttribute("aria-checked"), "false");
  assert.equal(control("disabled").getAttribute("aria-checked"), "false");
  assert.equal(control("content").value, "Save changes");
  assert.equal(control("sideOffset").value, "4");
  assert.equal(control("delay").value, "0");
  assert.equal(control("align").textContent.trim(), "center");
  assert.equal(control("side").textContent.trim(), "top");
  await React.act(async () =>
    host.querySelector('[data-slot="tooltip-trigger"]').focus()
  );
  assert.ok(
    document.querySelector('[data-slot="tooltip-content"]'),
    "Transient focus must open the tooltip"
  );
  await React.act(async () => reset.click());
  assert.ok(
    document.querySelector('[data-slot="tooltip-content"]') === null,
    "Reset must also clear transient opening"
  );
});
