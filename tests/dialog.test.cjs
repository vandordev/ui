/* eslint-disable require-await, global-require */
const assert = require("node:assert/strict");
const { runInNewContext } = require("node:vm");
const { after, afterEach, test } = require("node:test");
const { createJiti } = require("jiti");

let React, createRoot, dialog, dom, host, root;
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
    "SVGElement",
    "Element",
    "Node",
    "NodeFilter",
    "MouseEvent",
    "PointerEvent",
    "KeyboardEvent",
    "MutationObserver",
    "ResizeObserver",
    "Event",
    "EventTarget",
    "CustomEvent",
    "getComputedStyle",
    "requestAnimationFrame",
    "cancelAnimationFrame",
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
const load = () => {
  dialog ??= createJiti(__filename, {
    fsCache: false,
    jsx: { runtime: "automatic" },
  })("../registry/new-york/dialog.tsx");
  return dialog;
};
const mount = async (component) => {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await React.act(async () => root.render(component));
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

test("Dialog owns accessible structure while plain children and associated trigger handlers work", async () => {
  await ready;
  const { Dialog, DialogBody, DialogFooter } = load();
  const el = React.createElement;
  const popupRef = React.createRef();
  let presses = 0,
    submits = 0;
  await mount(
    el(
      Dialog,
      {
        contentProps: {
          closeButtonLabel: "Dismiss editor",
          ref: popupRef,
          size: "lg",
        },
        description: "Update details",
        modal: false,
        title: "Edit project",
        trigger: el(
          "button",
          {
            id: "opener",
            onClick: () => {
              presses += 1;
            },
            type: "button",
          },
          "Edit"
        ),
      },
      el(
        "form",
        {
          id: "editor",
          onSubmit: (event) => {
            event.preventDefault();
            submits += 1;
          },
        },
        el(DialogBody, null, el("input", { name: "name" })),
        el(DialogFooter, null, el("button", { type: "submit" }, "Save"))
      )
    )
  );
  assert.equal(document.querySelectorAll("button").length, 1);
  await React.act(async () => document.querySelector("#opener").click());
  assert.equal(presses, 1);
  const popup = document.querySelector('[role="dialog"]');
  assert.equal(popup, popupRef.current);
  assert.equal(popup.dataset.size, "lg");
  assert.equal(
    document.querySelector(`[id="${popup.getAttribute("aria-labelledby")}"]`)
      .textContent,
    "Edit project"
  );
  assert.equal(
    document.querySelector(`[id="${popup.getAttribute("aria-describedby")}"]`)
      .textContent,
    "Update details"
  );
  const body = document.querySelector('[data-slot="dialog-body"]');
  const footer = document.querySelector('[data-slot="dialog-footer"]');
  assert.equal(body.parentElement, footer.parentElement);
  assert.equal(body.contains(footer), false);
  await React.act(async () =>
    document
      .querySelector("#editor")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
  );
  assert.equal(submits, 1);
  assert.ok(
    document.querySelector('[data-open][role="dialog"]'),
    "submit must not auto-close"
  );
  await React.act(async () =>
    document.querySelector('[aria-label="Dismiss editor"]').click()
  );
  assert.equal(document.querySelector('[data-open][role="dialog"]'), null);
});

test("control, render children and hook observe accepted state including rejected open and close", async () => {
  await ready;
  const { Dialog, useDialog, useDialogControl } = load();
  const el = React.createElement;
  let child,
    control,
    reject = true,
    rendered;
  const changes = [];
  const Child = () => {
    child = useDialog();
    return el("output", { id: "child-state" }, String(child.isOpen));
  };
  const App = () => {
    control = useDialogControl();
    return el(
      React.Fragment,
      null,
      el("output", { id: "external-state" }, String(control.isOpen)),
      el(
        Dialog,
        {
          contentProps: { keepMounted: true, showCloseButton: false },
          control,
          modal: false,
          onOpenChange: (open, details) => {
            changes.push([open, details.reason]);
            if (reject) {
              details.cancel();
            }
          },
          title: "Settings",
        },
        (value) => {
          rendered = value;
          return el(Child);
        }
      )
    );
  };
  await mount(el(App));
  const identity = control;
  await React.act(async () => control.open());
  assert.equal(control.isOpen, false);
  reject = false;
  await React.act(async () => control.open());
  assert.equal(control, identity);
  assert.equal(rendered, control);
  assert.equal(child, control);
  assert.equal(document.querySelector("#external-state").textContent, "true");
  assert.equal(document.querySelector("#child-state").textContent, "true");
  assert.equal(document.querySelector('[data-slot="dialog-trigger"]'), null);
  assert.equal(
    document.querySelector('[data-slot="dialog-close-button"]'),
    null
  );
  reject = true;
  await React.act(async () => child.close());
  assert.equal(control.isOpen, true);
  reject = false;
  await React.act(async () => child.close());
  assert.equal(control.isOpen, false);
  assert.deepEqual(
    changes.map(([open]) => open),
    [true, true, false, false]
  );
  assert.ok(changes.every(([, reason]) => reason === "imperative-action"));
});

test("controlled state waits for parent updates and preserved content retains form values", async () => {
  await ready;
  const { Dialog, useDialog } = load();
  const el = React.createElement;
  let selected;
  const changes = [];
  const Child = () => {
    selected = useDialog();
    return el("input", { defaultValue: "Original", id: "persist" });
  };
  const app = (open) =>
    el(
      Dialog,
      {
        contentProps: { keepMounted: true },
        modal: false,
        onOpenChange: (next) => changes.push(next),
        open,
        title: "Persistent form",
      },
      el(Child)
    );
  await mount(app(true));
  const input = document.querySelector("#persist");
  input.value = "Edited";
  await React.act(async () => selected.close());
  assert.equal(selected.isOpen, true);
  assert.deepEqual(changes, [false]);
  await React.act(async () => root.render(app(false)));
  assert.equal(selected.isOpen, false);
  await React.act(async () => root.render(app(true)));
  assert.equal(document.querySelector("#persist"), input);
  assert.equal(input.value, "Edited");
});

test("nested hooks select nearest dialog and custom headers preserve semantic associations", async () => {
  await ready;
  const { Dialog, useDialog, useDialogControl } = load();
  const el = React.createElement;
  let explicit, inner, outer;
  const Child = () => {
    inner = useDialog();
    explicit = useDialog(outer);
    return null;
  };
  const App = () => {
    outer = useDialogControl();
    return el(
      Dialog,
      {
        contentProps: { keepMounted: true },
        control: outer,
        modal: false,
        title: "Outer",
      },
      el(
        Dialog,
        {
          defaultOpen: true,
          description: "Supporting text",
          modal: false,
          renderHeader: ({ title, description }) =>
            el(
              React.Fragment,
              null,
              description,
              el("div", { id: "custom-title" }, title)
            ),
          title: "Inner",
        },
        el(Child)
      )
    );
  };
  await mount(el(App));
  assert.notEqual(inner, outer);
  assert.equal(explicit, outer);
  const title = document.querySelector("#custom-title h2");
  assert.ok(title);
  assert.equal(
    title.closest('[role="dialog"]').getAttribute("aria-labelledby"),
    title.id
  );
  await React.act(async () => explicit.open());
  await React.act(async () => inner.close());
  assert.equal(outer.isOpen, true);
  assert.equal(inner.isOpen, false);
});

test("invalid ownership fails clearly and Strict Mode permits one stable binding", async () => {
  await ready;
  const { Dialog, useDialogControl, useDialog } = load();
  const { renderToStaticMarkup } = require("react-dom/server");
  const el = React.createElement;
  const Missing = () => {
    useDialog();
    return null;
  };
  assert.throws(() => renderToStaticMarkup(el(Missing)), /inside Dialog/);
  const Conflict = () =>
    el(Dialog, { control: useDialogControl(), open: true, title: "Settings" });
  assert.throws(() => renderToStaticMarkup(el(Conflict)), /control.*open/);
  let control;
  const App = () => {
    control = useDialogControl();
    return el(Dialog, { control, title: "Settings" });
  };
  await mount(el(React.StrictMode, null, el(App)));
  await React.act(async () => control.open());
  assert.equal(control.isOpen, true);
  await React.act(async () => root.render(null));
  assert.equal(control.isOpen, false);
});

const frames = async () => {
  for (let index = 0; index < 3; index += 1) {
    // Actual frames are required by Base UI's animation lifecycle.
    // eslint-disable-next-line promise/avoid-new
    await new Promise((resolve) => {
      requestAnimationFrame(resolve);
    });
  }
};

test("portable Storybook stories compose all scenarios and Playground args affect the actual popup", async () => {
  await ready;
  const { composeStories } = await import("@storybook/react");
  const storyModule = createJiti(__filename, {
    fsCache: false,
    jsx: { runtime: "automatic" },
  })("../registry/new-york/dialog.stories.tsx");
  const stories = composeStories(storyModule);
  const storyNames = [
    "Playground",
    "LongContent",
    "WithoutCloseButton",
    "NonModal",
    "PersistentContent",
    "ExternalControl",
    "ControlledForm",
    "Nested",
    "CustomHeader",
  ];
  await mount(null);
  const storyRoot = root;
  const storyHost = host;
  const renderStory = async (element) => {
    await React.act(async () => storyRoot.render(element));
  };
  for (const name of storyNames) {
    await renderStory(React.createElement(stories[name]));
    await React.act(async () => storyHost.querySelector("button").click());
    assert.ok(document.querySelector('[role="dialog"]'), name);
    await renderStory(null);
  }
  await renderStory(
    React.createElement(stories.Playground, {
      description: "Consumer description",
      keepMounted: true,
      longContent: true,
      modal: false,
      showCloseButton: false,
      size: "xl",
      title: "Consumer title",
    })
  );
  await React.act(async () => host.querySelector("button").click());
  const popup = document.querySelector('[role="dialog"]');
  assert.equal(popup.dataset.size, "xl");
  assert.equal(
    popup.querySelector('[data-slot="dialog-title"]').textContent,
    "Consumer title"
  );
  assert.equal(
    popup.querySelector('[data-slot="dialog-description"]').textContent,
    "Consumer description"
  );
  assert.equal(
    popup.querySelectorAll('[data-slot="dialog-body"] p').length,
    30
  );
  assert.equal(popup.querySelector('[data-slot="dialog-close-button"]'), null);
  assert.equal(document.querySelector('[data-slot="dialog-overlay"]'), null);
  await React.act(async () => popup.querySelector("button").click());
  await React.act(async () => {
    await frames();
    await finishAnimations();
  });
  assert.equal(document.querySelector('[role="dialog"]'), popup);
  assert.equal(Object.hasOwn(popup.dataset, "open"), false);
});
const finishAnimations = async () => {
  for (const element of document.querySelectorAll(
    '[data-slot="dialog-popup"], [data-slot="dialog-overlay"]'
  )) {
    for (const animation of element.getAnimations()) {
      animation.finish();
    }
  }
  await frames();
};

test("controlled close retains popup until native Motion exit completes, then returns focus", async () => {
  await ready;
  const { Dialog, DialogBody } = load();
  const el = React.createElement;
  const opener = React.createRef();
  const completions = [];
  const app = (open) =>
    el(
      React.Fragment,
      null,
      el("button", { ref: opener, type: "button" }, "External opener"),
      el(
        Dialog,
        {
          contentProps: { finalFocus: opener },
          modal: false,
          onOpenChangeComplete: (next) => completions.push(next),
          open,
          title: "Animated",
        },
        el(DialogBody, null, "Details")
      )
    );
  await mount(app(true));
  await React.act(async () => {
    await frames();
    await finishAnimations();
  });
  assert.deepEqual(completions, [true]);
  await React.act(async () => root.render(app(false)));
  const exiting = document.querySelector('[data-slot="dialog-popup"]');
  assert.ok(
    exiting,
    "the exit must not unmount immediately on controlled prop change"
  );
  assert.ok(
    exiting
      .getAnimations()
      .some((animation) => animation.playState === "running")
  );
  assert.deepEqual(completions, [true]);
  await React.act(async () => {
    await frames();
    await finishAnimations();
  });
  assert.equal(document.querySelector('[data-slot="dialog-popup"]'), null);
  assert.deepEqual(completions, [true, false]);
  assert.equal(document.activeElement, opener.current);
});

test("rapid controlled reopening interrupts exit without a stale close completion", async () => {
  await ready;
  const { Dialog } = load();
  const el = React.createElement;
  const completions = [];
  const app = (open) =>
    el(Dialog, {
      modal: false,
      onOpenChangeComplete: (next) => completions.push(next),
      open,
      title: "Reopening",
    });
  await mount(app(true));
  await React.act(async () => {
    await frames();
    await finishAnimations();
  });
  await React.act(async () => root.render(app(false)));
  await React.act(async () => root.render(app(true)));
  await React.act(async () => {
    await frames();
    await finishAnimations();
  });
  assert.ok(document.querySelector('[data-slot="dialog-popup"][data-open]'));
  assert.equal(completions.includes(false), false);
});

test("Dialog panel has a distinct scale and vertical transition with a faster exit than entrance", async () => {
  await ready;
  const { Dialog } = load();
  const el = React.createElement;
  const app = (open) => el(Dialog, { open, title: "Motion profile" });
  await mount(app(true));
  const popup = document.querySelector('[data-slot="dialog-popup"]');
  const entrance = popup.getAnimations();
  assert.ok(
    entrance.length >= 3,
    "opacity, scale, and translate animate natively"
  );
  assert.ok(
    entrance.every((animation) => animation.effect.getTiming().duration === 320)
  );
  await React.act(async () => {
    await frames();
    await finishAnimations();
  });
  await React.act(async () => root.render(app(false)));
  const exit = popup
    .getAnimations()
    .filter((animation) => animation.playState === "running");
  assert.ok(
    exit.every((animation) => animation.effect.getTiming().duration === 220)
  );
  const keyframes = exit.flatMap((animation) =>
    animation.effect.getKeyframes()
  );
  assert.ok(keyframes.some((frame) => Number(frame.scale) === 0.94));
  assert.ok(keyframes.some((frame) => frame.translate === "0 12px"));
});

test("Escape dismisses only the topmost nested modal and respects a cancellation guard", async () => {
  await ready;
  const { Dialog } = load();
  const el = React.createElement;
  const changes = [];
  let block = true;
  await mount(
    el(
      Dialog,
      {
        defaultOpen: true,
        onOpenChange: (open, details) =>
          changes.push(["parent", open, details.reason]),
        title: "Parent",
      },
      el(
        Dialog,
        {
          defaultOpen: true,
          onOpenChange: (open, details) => {
            changes.push(["child", open, details.reason]);
            if (block) {
              details.cancel();
            }
          },
          title: "Child",
        },
        "Nested content"
      )
    )
  );
  const pressEscape = async () => {
    const popups = [...document.querySelectorAll('[role="dialog"][data-open]')];
    await React.act(async () =>
      popups.at(-1).dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          cancelable: true,
          key: "Escape",
        })
      )
    );
  };
  await pressEscape();
  assert.equal(
    document.querySelectorAll('[role="dialog"][data-open]').length,
    2
  );
  block = false;
  await pressEscape();
  assert.equal(
    document.querySelectorAll('[role="dialog"][data-open]').length,
    1
  );
  assert.deepEqual(changes, [
    ["child", false, "escape-key"],
    ["child", false, "escape-key"],
  ]);
});

test("nested dialog portals escape transformed and clipping parent panels while preserving theme scope", async () => {
  await ready;
  const { Dialog, DialogBody, useDialog } = load();
  const el = React.createElement;
  let innerControl;
  const ChildContent = () => {
    innerControl = useDialog();
    return el("p", null, "Nested content");
  };
  await mount(
    el(
      "div",
      { className: "dark", id: "dialog-theme-scope" },
      el(
        Dialog,
        { defaultOpen: true, title: "Parent panel" },
        el(
          DialogBody,
          null,
          el(
            Dialog,
            {
              title: "Child panel",
              trigger: el(
                "button",
                { id: "open-child", type: "button" },
                "Open child"
              ),
            },
            el(DialogBody, null, el(ChildContent))
          )
        )
      )
    )
  );
  const parent = document.querySelector('[role="dialog"]');
  const childTrigger = document.querySelector("#open-child");
  assert.ok(
    parent.contains(childTrigger),
    "the trigger stays in its parent panel"
  );
  await React.act(async () => childTrigger.click());
  const popups = [...document.querySelectorAll('[role="dialog"][data-open]')];
  assert.equal(popups.length, 2);
  const child = popups.find((popup) => popup !== parent);
  const childViewport = child.closest('[data-slot="dialog-viewport"]');
  assert.equal(
    parent.contains(childViewport),
    false,
    "fixed child viewport must escape the scaled overflow-hidden parent"
  );
  assert.equal(parent.contains(child), false);
  assert.equal(
    child.closest("#dialog-theme-scope"),
    document.querySelector("#dialog-theme-scope")
  );
  assert.equal(innerControl.isOpen, true);
  await React.act(async () => innerControl.close());
  await React.act(async () => {
    await frames();
    await finishAnimations();
  });
  assert.equal(
    document.querySelectorAll('[role="dialog"][data-open]').length,
    1
  );
  assert.equal(document.activeElement, childTrigger);
});

test("without Web Animations Dialog is visible immediately and closing completes without retained popup", async () => {
  await ready;
  const { Dialog } = load();
  const { animate } = Element.prototype;
  Element.prototype.animate = undefined;
  try {
    const el = React.createElement;
    const app = (open) => el(Dialog, { open, title: "Fallback" });
    await mount(app(true));
    assert.equal(document.querySelector('[role="dialog"]').style.opacity, "1");
    assert.equal(
      document.querySelector('[data-slot="dialog-overlay"]').style.opacity,
      "1"
    );
    await React.act(async () => root.render(app(false)));
    await React.act(async () => {
      await frames();
    });
    assert.equal(document.querySelector('[role="dialog"]'), null);
  } finally {
    Element.prototype.animate = animate;
  }
});

const playgroundModules = () =>
  createJiti(__filename, {
    alias: { "@": process.cwd() },
    fsCache: false,
    jsx: { runtime: "automatic" },
  });
const generatedDemo = (code) => {
  const ts = require("typescript");
  const output = ts.transpileModule(code, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    reportDiagnostics: true,
  });
  assert.deepEqual(output.diagnostics, [], "generated code must parse");
  const compiledModule = { exports: {} };
  const localRequire = (id) =>
    id === "@/components/ui/dialog" ? load() : require(id);
  runInNewContext(output.outputText, {
    exports: compiledModule.exports,
    module: compiledModule,
    require: localRequire,
  });
  return compiledModule.exports.DialogDemo;
};
const observePreview = async () => {
  await React.act(async () => host.querySelector("button").click());
  const popup = document.querySelector('[data-slot="dialog-popup"]');
  return {
    closeButton: Boolean(
      popup.querySelector('[data-slot="dialog-close-button"]')
    ),
    description:
      popup.querySelector('[data-slot="dialog-description"]')?.textContent ??
      null,
    form: Boolean(popup.querySelector("form")),
    longContent:
      popup.querySelectorAll('[data-slot="dialog-body"] p').length >= 30,
    overlay: Boolean(document.querySelector('[data-slot="dialog-overlay"]')),
    size: popup.dataset.size,
    title: popup.querySelector('[data-slot="dialog-title"]').textContent,
  };
};

test("every playground control wires the real preview and generated runnable code consistently", async () => {
  await ready;
  const jiti = playgroundModules();
  const { getDialogDefaults, getDialogCode } = jiti(
    "../lib/dialog-playground.ts"
  );
  const { DialogPreview } = jiti("../components/dialog-playground.tsx");
  const defaults = getDialogDefaults();
  const cases = [
    defaults,
    { ...defaults, title: 'A "quoted" title <project>\nline' },
    { ...defaults, description: 'Text with "quotes" and <markup>' },
    { ...defaults, description: "" },
    { ...defaults, size: "xl" },
    { ...defaults, modal: false },
    { ...defaults, showCloseButton: false },
    { ...defaults, keepMounted: true },
    { ...defaults, longContent: true },
    ...["render-function", "control", "form"].map((example) => ({
      ...defaults,
      example,
    })),
    {
      ...defaults,
      example: "form",
      keepMounted: true,
      longContent: true,
      showCloseButton: false,
      size: "sm",
    },
  ];
  await mount(null);
  const previewRoot = root;
  const renderPreview = async (element) => {
    await React.act(async () => previewRoot.render(element));
  };
  for (const values of cases) {
    await renderPreview(
      React.createElement(DialogPreview, {
        key: JSON.stringify(values),
        values,
      })
    );
    const preview = await observePreview();
    await React.act(async () => previewRoot.render(null));
    const Generated = generatedDemo(getDialogCode(values));
    await renderPreview(React.createElement(Generated));
    const generated = await observePreview();
    assert.deepEqual(generated, preview, JSON.stringify(values));
    await React.act(async () => previewRoot.render(null));
  }
});

test("Reset restores playground configuration and closes the transient open dialog", async () => {
  await ready;
  const { DialogPlayground } = playgroundModules()(
    "../components/dialog-playground.tsx"
  );
  await mount(React.createElement(DialogPlayground));
  const title = [...host.querySelectorAll("label")].find(
    (node) => node.textContent === "Title"
  );
  const input = document.querySelector(`[id="${title.htmlFor}"]`);
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  ).set;
  await React.act(async () => {
    setter.call(input, "Customized settings");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  assert.match(host.querySelector("pre").textContent, /Customized settings/);
  await React.act(async () =>
    [...host.querySelectorAll("button")]
      .find((node) => node.textContent.includes("Open dialog"))
      .click()
  );
  assert.equal(
    document.querySelector('[data-slot="dialog-title"]').textContent,
    "Customized settings"
  );
  await React.act(async () =>
    [...host.querySelectorAll("button")]
      .find((node) => node.textContent.includes("Reset"))
      .click()
  );
  assert.equal(document.querySelector('[data-slot="dialog-popup"]'), null);
  assert.equal(input.value, "Project settings");
  assert.doesNotMatch(
    host.querySelector("pre").textContent,
    /Customized settings/
  );
});
