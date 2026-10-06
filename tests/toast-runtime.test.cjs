// Shared sequential DOM fixture; deferred promises exercise real cache settlement.
/* eslint-disable global-require, require-await, no-loop-func, func-style, sort-vars, no-shadow, no-empty-function, avoid-new, param-names, no-promise-executor-return, no-plusplus */
const assert = require("node:assert/strict");
const { test, after, afterEach } = require("node:test");
const { createJiti } = require("jiti");
let React, createRoot, dom, api, root, host, snapshot, reducedMotionQuery;
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
  // Happy DOM cancels native WAAPI promises differently from browsers. These
  // lifecycle tests deliberately use the reduced-motion rendering path.
  reducedMotionQuery = dom.matchMedia("(prefers-reduced-motion)");
  Object.defineProperty(reducedMotionQuery, "matches", {
    configurable: true,
    value: true,
    writable: true,
  });
  const matchMedia = dom.matchMedia.bind(dom);
  dom.matchMedia = (query) =>
    query === "(prefers-reduced-motion)"
      ? reducedMotionQuery
      : matchMedia(query);
  delete dom.Element.prototype.animate;
  React = require("react");
  ({ createRoot } = require("react-dom/client"));
  const jiti = createJiti(__filename, {
    alias: { "@": process.cwd() },
    fsCache: false,
    jsx: { runtime: "automatic" },
  });
  api = jiti("../registry/new-york/toast.tsx");
})();
async function mount(position) {
  await ready;
  const { Toast } = require("@base-ui/react/toast");
  function Observe() {
    snapshot = Toast.useToastManager();
    return null;
  }
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  const { MotionConfig } = require("motion/react");
  await React.act(async () =>
    root.render(
      React.createElement(
        MotionConfig,
        { reducedMotion: "always" },
        React.createElement(
          api.ToastProvider,
          null,
          React.createElement(
            "button",
            { id: "background-button" },
            "Background"
          ),
          React.createElement(Observe),
          React.createElement(api.Toaster, { position })
        )
      )
    )
  );
}
afterEach(async () => {
  if (root) {
    await React.act(async () => root.unmount());
    host.remove();
    root = null;
  }
});
after(async () => {
  await ready;
  await dom.happyDOM.abort();
});
test("shell and queue controls survive new arrivals, dismissal and queued swipe", async () => {
  await mount();
  await React.act(async () => api.toast.info("First", { duration: 0 }));
  const shell = document.querySelector("[data-toast-shell]");
  assert.ok(Boolean(shell), "persistent shell exists");
  await React.act(async () => api.toast.info("Second", { duration: 0 }));
  const badge = document.querySelector("[data-toast-queue]");
  const close = document.querySelector('[aria-label="Dismiss notification"]');
  assert.ok(
    document.querySelector("[data-toast-shell]") === shell,
    "arrival preserves shell identity"
  );
  await React.act(async () => api.toast.info("Third", { duration: 0 }));
  assert.ok(
    document.querySelector("[data-toast-queue]") === badge,
    "arrival preserves badge identity"
  );
  await React.act(async () => close.click());
  assert.ok(
    document.querySelector("[data-toast-shell]") === shell,
    "dismissal preserves shell identity"
  );
  assert.ok(
    document.querySelector('[aria-label="Dismiss notification"]') === close,
    "dismissal preserves close identity"
  );
  assert.equal(
    document.querySelector("[data-toast-id]").dataset.toastExit,
    "advance"
  );
  const card = document.querySelector("[data-toast-id]");
  const dispatch = (type, x) =>
    card.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        button: 0,
        clientX: x,
        clientY: 30,
        pointerId: 1,
        pointerType: "mouse",
      })
    );
  await React.act(async () => dispatch("pointerdown", 200));
  await React.act(async () => dispatch("pointermove", 210));
  await React.act(async () => dispatch("pointermove", 310));
  await React.act(async () => dispatch("pointerup", 310));
  assert.ok(
    document.querySelector("[data-toast-shell]") === shell,
    "swipe preserves shell"
  );
  assert.ok(
    document.querySelector("[data-toast-queue]") === badge,
    "swipe preserves queue control node"
  );
  assert.ok(
    document.body.textContent.includes("First"),
    "swipe advances immediately"
  );
});
test("progress pauses with hover and loading settlement starts the visual clock", async () => {
  await mount();
  let id;
  await React.act(async () => {
    id = api.toast.loading("Working");
  });
  assert.ok(
    !document.querySelector("[data-toast-progress]"),
    "loading has no countdown"
  );
  await React.act(async () =>
    api.toast.update(id, { duration: 260, title: "Failed", type: "error" })
  );
  const progress = document.querySelector("[data-toast-progress]");
  assert.equal(progress.dataset.duration, "260");
  await React.act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 45));
  });
  const viewport = document.querySelector('[aria-label="Notifications"]');
  await React.act(async () =>
    viewport.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }))
  );
  assert.equal(progress.dataset.paused, "true");
  const { transform } = progress.firstElementChild.style;
  const fraction = Number(transform.match(/scaleX\(([^)]+)\)/)?.[1]);
  assert.ok(
    fraction > 0 && fraction < 1,
    "countdown visibly decreases before hover"
  );
  await React.act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
  });
  assert.equal(progress.firstElementChild.style.transform, transform);
  assert.ok(
    snapshot.toasts.some(
      (item) => item.id === id && item.transitionStatus !== "ending"
    ),
    "hover pauses actual expiry"
  );
  await React.act(async () =>
    viewport.dispatchEvent(
      new MouseEvent("mouseout", {
        bubbles: true,
        relatedTarget: document.body,
      })
    )
  );
  await React.act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
  });
  assert.ok(
    !snapshot.toasts.some(
      (item) => item.id === id && item.transitionStatus !== "ending"
    ),
    "expiry resumes after hover"
  );
});
test("countdown defaults follow title, action and explicit persistence", async () => {
  await mount();
  await React.act(async () => api.toast.error("Error"));
  assert.equal(
    document.querySelector("[data-toast-progress]").dataset.duration,
    "3000"
  );
  await React.act(async () =>
    api.toast.action("Undoable", { actionLabel: "Undo" })
  );
  assert.equal(
    document.querySelector("[data-toast-progress]").dataset.duration,
    "4000"
  );
  await React.act(async () => api.toast.info("Persistent", { duration: 0 }));
  assert.ok(
    !document.querySelector("[data-toast-progress]"),
    "explicit persistence removes progress"
  );
});
test("partial update preserves title, status, description and action", async () => {
  await mount();
  let id;
  await React.act(async () => {
    id = api.toast.success("Saved", {
      actionLabel: "Undo",
      actionOnClick: () => {},
      description: "Details",
    });
  });
  await React.act(async () => api.toast.update(id, { duration: 9000 }));
  const item = snapshot.toasts.find((item) => item.id === id);
  assert.equal(item.title, "Saved");
  assert.equal(item.type, "success");
  assert.equal(item.description, "Details");
  assert.equal(item.data.actionLabel, "Undo");
});
test("loading-to-error update adopts urgent priority unless the caller overrides it", async () => {
  await mount();
  let id;
  await React.act(async () => {
    id = api.toast.loading("Saving");
  });
  await React.act(async () =>
    api.toast.update(id, { title: "Failed", type: "error" })
  );
  assert.equal(snapshot.toasts.find((item) => item.id === id).priority, "high");
});
test("queued promise result has no timer until presented", async () => {
  await mount();
  let resolve, pending;
  await React.act(async () => {
    pending = api.toast.promise(
      new Promise((done) => {
        resolve = done;
      }),
      { error: "Failed", loading: "Saving", success: "Saved" }
    );
    for (let index = 0; index < 3; index++) {
      api.toast.error(`Block ${index}`);
    }
  });
  await React.act(async () => {
    resolve(42);
    assert.equal(await pending, 42);
  });
  const item = snapshot.toasts.find((item) => item.title === "Saved");
  assert.ok(Boolean(item), "result retains its record");
  assert.equal(item.timeout, 0, "unseen result cannot expire");
});
test("displaced toast pauses its timeout and resumes when presented", async () => {
  await mount();
  let id;
  await React.act(async () => {
    id = api.toast.info("Read me");
  });
  await React.act(async () => {
    for (let index = 0; index < 3; index++) {
      api.toast.error(`Block ${index}`);
    }
  });
  assert.equal(snapshot.toasts.find((item) => item.id === id).timeout, 0);
});
test("dismissed loading toast is not resurrected by async settlement", async () => {
  await mount();
  let resolve, pending;
  await React.act(async () => {
    pending = api.toast.promise(
      new Promise((done) => {
        resolve = done;
      }),
      { error: "Failed", loading: "Saving", success: "Saved" }
    );
  });
  const [{ id }] = snapshot.toasts;
  await React.act(async () => api.toast.dismiss(id));
  await React.act(async () => {
    resolve("result");
    await pending;
  });
  assert.ok(
    !snapshot.toasts.some(
      (item) => item.id === id && item.transitionStatus !== "ending"
    ),
    "dismissal remains final"
  );
});
test("first detailed arrival presents title before revealing description and action", async () => {
  await mount();
  await React.act(async () => root.unmount());
  host.remove();
  root = null;
  const preference = reducedMotionQuery;
  preference.matches = false;
  preference.dispatchEvent(new Event("change"));
  try {
    await mount();
    await React.act(async () =>
      api.toast.info("Title first", {
        actionLabel: "Undo",
        description: "Details later",
        duration: 0,
      })
    );
    assert.ok(
      document.body.textContent.includes("Title first"),
      "title is available immediately"
    );
    assert.ok(
      !document.body.textContent.includes("Details later"),
      "detail waits until after title entrance"
    );
    assert.ok(
      !document.querySelector("[data-toast-id] button"),
      "action waits with description"
    );
    await React.act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 90));
    });
    assert.ok(
      !document.body.textContent.includes("Details later"),
      "title has a deliberate readable lead"
    );
    await React.act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 220));
    });
    assert.ok(
      document.body.textContent.includes("Details later"),
      "detail is eventually revealed"
    );
    assert.ok(
      document.body.textContent.includes("Undo"),
      "action is revealed with detail"
    );
    const shell = document.querySelector("[data-toast-shell]");
    await React.act(async () =>
      api.toast.info("Replacement", {
        description: "No extra entrance delay",
        duration: 0,
      })
    );
    assert.ok(
      document.querySelector("[data-toast-shell]") === shell,
      "replacement preserves the shell"
    );
    assert.ok(
      document.body.textContent.includes("No extra entrance delay"),
      "replacement does not repeat title-first delay"
    );
  } finally {
    preference.matches = true;
    preference.dispatchEvent(new Event("change"));
  }
});
test("opening detail survives a later content-only update", async () => {
  await mount();
  let id;
  await React.act(async () => {
    id = api.toast.info("Details", { description: "Keep this body" });
  });
  await React.act(async () => api.toast.update(id, { title: "Updated" }));
  assert.ok(
    document.body.textContent.includes("Keep this body"),
    "partial updates retain open detail"
  );
});
test("closed keepMounted Dialog does not capture live notifications", async () => {
  await mount();
  const jiti = createJiti(__filename, {
    alias: { "@": process.cwd() },
    fsCache: false,
    jsx: { runtime: "automatic" },
  });
  const { Dialog } = jiti("../registry/new-york/dialog.tsx");
  const other = document.createElement("div");
  document.body.append(other);
  const modalRoot = createRoot(other);
  try {
    await React.act(async () =>
      modalRoot.render(
        React.createElement(
          Dialog,
          { contentProps: { keepMounted: true }, open: false, title: "Closed" },
          "Content"
        )
      )
    );
    await React.act(async () => api.toast.error("Visible"));
    const viewport = document.querySelector('[aria-label="Notifications"]');
    assert.ok(
      !viewport.closest("[data-vandor-modal-toast-host]"),
      "closed portal cannot own the toast viewport"
    );
  } finally {
    await React.act(async () => modalRoot.unmount());
    other.remove();
  }
});
test("adapter catches an in-flight mutation when mounted and preserves cache callbacks", async () => {
  await mount();
  const { QueryClient, MutationCache } = require("@tanstack/react-query");
  const jiti = createJiti(__filename, {
    alias: { "@": process.cwd() },
    fsCache: false,
    jsx: { runtime: "automatic" },
  });
  const { ToastQueryAdapter } = jiti(
    "../registry/new-york/toast-tanstack-query.tsx"
  );
  const { QueryClientProvider } = require("@tanstack/react-query");
  let resolve,
    callbacks = 0;
  const client = new QueryClient({
    defaultOptions: { mutations: { gcTime: Infinity } },
    mutationCache: new MutationCache({
      onSuccess: () => {
        callbacks++;
      },
    }),
  });
  const mutation = client.getMutationCache().build(client, {
    meta: { vandorToast: { loading: "Working", success: "Completed" } },
    mutationFn: () =>
      new Promise((done) => {
        resolve = done;
      }),
  });
  const operation = mutation.execute("input");
  await Promise.resolve();
  await Promise.resolve();
  const other = document.createElement("div");
  document.body.append(other);
  const adapterRoot = createRoot(other);
  try {
    await React.act(async () =>
      adapterRoot.render(
        React.createElement(
          QueryClientProvider,
          { client },
          React.createElement(ToastQueryAdapter)
        )
      )
    );
    assert.equal(
      snapshot.toasts.filter((item) => item.title === "Working").length,
      1,
      "pending cache reconciles on mount"
    );
    const { id } = snapshot.toasts.find((item) => item.title === "Working");
    await React.act(async () => {
      resolve("value");
      assert.equal(await operation, "value");
    });
    assert.equal(
      snapshot.toasts.find((item) => item.id === id).title,
      "Completed"
    );
    assert.equal(callbacks, 1);
    const completed = snapshot.toasts.find((item) => item.id === id);
    assert.equal(
      completed.data.duration,
      3000,
      "adapter success uses the title-only default"
    );
    assert.equal(
      completed.data.durationOverride,
      undefined,
      "adapter does not force a custom duration"
    );
    assert.equal(
      document.querySelector("[data-toast-progress]").dataset.duration,
      "3000"
    );
  } finally {
    await React.act(async () => {
      resolve?.("cleanup");
      await operation;
      adapterRoot.unmount();
    });
    other.remove();
    client.clear();
  }
});
test("adapter deduplicates subscribers and tracks concurrent mutations without touching callbacks", async () => {
  await mount();
  const { QueryClient } = require("@tanstack/react-query");
  const jiti = createJiti(__filename, {
    fsCache: false,
    jsx: { runtime: "automatic" },
  });
  const { subscribeToastQueryClient } = jiti(
    "../registry/new-york/toast-tanstack-query.tsx"
  );
  const client = new QueryClient({
    defaultOptions: { mutations: { gcTime: Infinity } },
  });
  const stop = subscribeToastQueryClient(client);
  const stopSecond = subscribeToastQueryClient(client);
  let finishA,
    finishB,
    callback = 0;
  const a = client.getMutationCache().build(client, {
    meta: { vandorToast: { loading: "A", success: (value) => `A ${value}` } },
    mutationFn: () =>
      new Promise((done) => {
        finishA = done;
      }),
    onSuccess: () => {
      callback++;
    },
  });
  const b = client.getMutationCache().build(client, {
    meta: { vandorToast: { loading: "B", success: "B done" } },
    mutationFn: () =>
      new Promise((done) => {
        finishB = done;
      }),
  });
  let first, second;
  try {
    await React.act(async () => {
      first = a.execute();
      second = b.execute();
      await Promise.resolve();
      await Promise.resolve();
    });
    assert.equal(snapshot.toasts.length, 2, "one loading toast per operation");
    const aId = snapshot.toasts.find((item) => item.title === "A").id;
    await React.act(async () => {
      api.toast.dismiss(aId);
      finishA("done");
      finishB("done");
      await Promise.all([first, second]);
    });
    assert.equal(callback, 1);
    assert.ok(
      !snapshot.toasts.some(
        (item) => item.id === aId && item.transitionStatus !== "ending"
      )
    );
    assert.equal(
      snapshot.toasts.filter((item) => item.title === "B done").length,
      1
    );
  } finally {
    await React.act(async () => {
      finishA?.();
      finishB?.();
      await Promise.all([first, second]);
      stop();
      stopSecond();
      client.clear();
    });
  }
});
test("configured query retries announce once per terminal failure, including a reused Error", async () => {
  await mount();
  const { QueryClient } = require("@tanstack/react-query");
  const jiti = createJiti(__filename, {
    fsCache: false,
    jsx: { runtime: "automatic" },
  });
  const { subscribeToastQueryClient } = jiti(
    "../registry/new-york/toast-tanstack-query.tsx"
  );
  const client = new QueryClient({
    defaultOptions: { queries: { gcTime: Infinity } },
  });
  const stop = subscribeToastQueryClient(client);
  const error = new Error("private payload");
  let calls = 0;
  const options = {
    meta: {
      vandorToast: {
        error: () => {
          throw new Error("bad mapping");
        },
      },
    },
    queryFn: async () => {
      calls++;
      throw error;
    },
    queryKey: ["configured"],
    retry: 2,
    retryDelay: 0,
  };
  try {
    await React.act(async () => {
      await client.fetchQuery(options).catch(() => {});
    });
    assert.equal(calls, 3);
    assert.equal(snapshot.toasts.length, 1);
    assert.ok(!document.body.textContent.includes("private payload"));
    await React.act(async () => {
      await client.fetchQuery(options).catch(() => {});
    });
    assert.equal(
      snapshot.toasts.length,
      2,
      "a later terminal failure is independently reported"
    );
    await React.act(async () => {
      await client
        .fetchQuery({
          queryFn: async () => {
            throw error;
          },
          queryKey: ["silent"],
          retry: false,
        })
        .catch(() => {});
    });
    assert.equal(
      snapshot.toasts.length,
      2,
      "unconfigured query remains silent"
    );
  } finally {
    stop();
    client.clear();
  }
});
for (const name of ["Dialog", "Drawer"]) {
  test(`${name} keeps pre-existing toast actions inside the modal portal without exposing background`, async () => {
    await mount();
    const jiti = createJiti(__filename, {
      alias: { "@": process.cwd() },
      fsCache: false,
      jsx: { runtime: "automatic" },
    });
    const component = jiti(`../registry/new-york/${name.toLowerCase()}.tsx`)[
      name
    ];
    let invoked = 0;
    await React.act(async () =>
      api.toast.action("Undoable", {
        actionLabel: "Undo",
        actionOnClick: () => {
          invoked++;
        },
      })
    );
    const other = document.createElement("div");
    document.body.append(other);
    const modalRoot = createRoot(other);
    try {
      await React.act(async () =>
        modalRoot.render(
          React.createElement(
            component,
            {
              contentProps: { keepMounted: true },
              title: "Modal",
              trigger: React.createElement(
                "button",
                { id: "modal-trigger" },
                "Open modal"
              ),
            },
            "Modal content"
          )
        )
      );
      await React.act(async () =>
        document.querySelector("#modal-trigger").click()
      );
      await React.act(async () => {
        await new Promise((done) => requestAnimationFrame(done));
      });
      const viewport = document.querySelector('[aria-label="Notifications"]');
      assert.ok(
        Boolean(viewport.closest('[data-toast-host-active="true"]')),
        "toast is inside the active modal portal"
      );
      const action = [...viewport.querySelectorAll("button")].find(
        (button) => button.textContent === "Undo"
      );
      await React.act(async () => {
        action.focus();
        action.click();
      });
      assert.equal(invoked, 1);
      assert.ok(
        document.activeElement === action,
        "modal does not steal action focus"
      );
      assert.ok(!action.closest("[inert]"), "action is not inert");
      assert.ok(
        Boolean(
          document
            .querySelector("#background-button")
            .closest('[aria-hidden="true"], [inert]')
        ),
        "background remains unavailable"
      );
    } finally {
      await React.act(async () => modalRoot.unmount());
      other.remove();
    }
  });
}
test("burst shows one toast, hover never expands, close advances and close-all drains the queue", async () => {
  await mount();
  await React.act(async () => {
    for (let index = 0; index < 45; index++) {
      api.toast.error(`Notification ${index}`, {
        actionLabel: "Act",
        actionOnClick: () => {},
      });
    }
  });
  assert.equal(document.querySelectorAll("[data-toast-id]").length, 1);
  const viewport = document.querySelector('[aria-label="Notifications"]');
  await React.act(async () =>
    viewport.dispatchEvent(
      new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" })
    )
  );
  assert.equal(document.querySelectorAll("[data-toast-id]").length, 1);
  assert.equal(
    document.querySelector("[data-toast-queue]").dataset.count,
    "44"
  );
  const front = document.querySelector("[data-toast-id]").dataset.toastId;
  await React.act(async () =>
    document.querySelector('[aria-label="Dismiss notification"]').click()
  );
  for (let index = 0; index < 3; index++) {
    await React.act(async () => {
      await new Promise((done) => requestAnimationFrame(done));
    });
  }
  assert.equal(document.querySelectorAll("[data-toast-id]").length, 1);
  assert.ok(
    document.querySelector("[data-toast-id]").dataset.toastId !== front,
    "closing exposes the next queued notification"
  );
  await React.act(async () =>
    document.querySelector('[aria-label="Dismiss all notifications"]').click()
  );
  for (let index = 0; index < 6; index++) {
    await React.act(async () => {
      await new Promise((done) => requestAnimationFrame(done));
    });
  }
  assert.equal(
    snapshot.toasts.length,
    0,
    "queued records are removed, not stranded in ending state"
  );
});
test("entry and timeout exit distinguish first, replacement, queued and final notifications", async () => {
  await mount();
  let first;
  await React.act(async () => {
    first = api.toast.info("First", { duration: 0 });
  });
  assert.equal(
    document.querySelector("[data-toast-id]").dataset.toastEntry,
    "first"
  );
  await React.act(async () => api.toast.info("Replacement", { duration: 30 }));
  assert.equal(
    document.querySelector("[data-toast-id]").dataset.toastEntry,
    "replacement"
  );
  assert.equal(
    document.querySelector("[data-toast-id]").dataset.toastExit,
    "advance"
  );
  const badge = document.querySelector("[data-toast-queue]");
  assert.ok(
    badge.className.includes("bg-neutral-950") &&
      badge.className.includes("dark:bg-neutral-50"),
    "queue badge has opaque surfaces in both themes"
  );
  await React.act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 65));
  });
  for (let index = 0; index < 3; index++) {
    await React.act(async () => {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });
  }
  const card = document.querySelector("[data-toast-id]");
  assert.equal(card.dataset.toastId, first);
  assert.equal(card.dataset.toastEntry, "replacement");
  assert.equal(card.dataset.toastExit, "last");
  await React.act(async () => api.toast.dismiss());
  for (let index = 0; index < 3; index++) {
    await React.act(async () => {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });
  }
  await React.act(async () => api.toast.info("New session", { duration: 0 }));
  assert.equal(
    document.querySelector("[data-toast-id]").dataset.toastEntry,
    "first"
  );
});
test("duration-only update retains callbacks and timeout triggers close before removal", async () => {
  await mount();
  let id,
    closed = 0,
    removed = 0;
  await React.act(async () => {
    id = api.toast.info("Timed", {
      duration: 30,
      onClose: () => {
        closed++;
      },
      onRemove: () => {
        removed++;
      },
    });
  });
  await React.act(async () => api.toast.update(id, { duration: 30 }));
  await React.act(async () => {
    await new Promise((done) => setTimeout(done, 70));
  });
  for (let index = 0; index < 3; index++) {
    await React.act(async () => {
      await new Promise((done) => requestAnimationFrame(done));
    });
  }
  assert.equal(closed, 1);
  assert.equal(removed, 1);
  assert.equal(snapshot.toasts.length, 0);
});
for (const direction of ["left", "right"]) {
  test(`completed ${direction} swipe retains direction and displacement until removal`, async () => {
    await mount();
    await React.act(async () => api.toast.action("Swipe me"));
    const card = document.querySelector("[data-toast-id]");
    const sign = direction === "left" ? -1 : 1;
    const dispatch = (type, x) =>
      card.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          button: 0,
          clientX: x,
          clientY: 30,
          pointerId: 1,
          pointerType: "mouse",
        })
      );
    await React.act(async () => dispatch("pointerdown", 200));
    await React.act(async () => dispatch("pointermove", 200 + sign * 10));
    await React.act(async () => dispatch("pointermove", 200 + sign * 110));
    const surface = document.querySelector("[data-toast-swipe-shell]");
    assert.ok(Boolean(surface), "whole-surface swipe wrapper exists");
    assert.ok(
      surface.contains(document.querySelector("[data-toast-shell] svg")),
      "drag wrapper contains silhouette"
    );
    assert.ok(
      surface.contains(
        document.querySelector('[aria-label="Dismiss notification"]')
      ),
      "drag wrapper contains close control"
    );
    assert.ok(
      surface.style.transform.includes("translateX("),
      "siluet and controls follow the drag transform"
    );
    assert.equal(
      card.style.transform,
      "none",
      "content does not move independently"
    );
    await React.act(async () => dispatch("pointerup", 200 + sign * 110));
    assert.equal(card.dataset.swipeDirection, direction);
    assert.ok(
      Math.abs(
        Number.parseFloat(
          card.style.getPropertyValue("--toast-swipe-movement-x")
        )
      ) > 40,
      "successful swipe never resets displacement"
    );
    assert.ok(
      surface.className.includes(
        `data-[swipe-direction=${direction}]:data-ending-style:transform-`
      ),
      "CSS exits from swipe offset, not from the centered position"
    );
  });
}
test("center placement centers the pill and anchors queue controls beside it", async () => {
  await mount("top-center");
  await React.act(async () => api.toast.info("Centered", { duration: 0 }));
  const row = document.querySelector("[data-toast-header-row]");
  assert.ok(
    Boolean(row) && row.className.includes("justify-center"),
    "pill is centered rather than right-aligned"
  );
  assert.equal(
    row.style.paddingLeft,
    "0px",
    "single pill has no empty queue gutter"
  );
  await React.act(async () => api.toast.info("Next", { duration: 0 }));
  const controls = document.querySelector("[data-toast-queue-controls]");
  assert.equal(
    row.style.paddingLeft,
    "96px",
    "queue and pill are centered as a combined compact group"
  );
  assert.ok(
    controls.style.left.includes("50%"),
    "queue controls follow centered pill geometry"
  );
  assert.ok(
    controls.style.transform.includes("translateX(-100%)"),
    "controls sit adjacent to pill, not viewport edge"
  );
});
for (const position of [
  "top-right",
  "bottom-right",
  "top-left",
  "bottom-left",
]) {
  test(`${position} queue controls stay 8px from measured pill instead of viewport edge`, async () => {
    await mount(position);
    await React.act(async () => api.toast.info("Short", { duration: 0 }));
    const header = document.querySelector("[data-toast-header-row] > div");
    Object.defineProperty(header, "offsetLeft", {
      configurable: true,
      value: position.endsWith("left") ? 0 : 208,
    });
    Object.defineProperty(header, "offsetWidth", {
      configurable: true,
      value: 160,
    });
    const id = document.querySelector("[data-toast-id]").dataset.toastId;
    await React.act(async () => api.toast.update(id, { title: "Measured" }));
    const controls = document.querySelector("[data-toast-queue-controls]");
    assert.equal(
      controls.style.left,
      position.endsWith("left") ? "168px" : "200px"
    );
    assert.equal(
      controls.style.transform,
      position.endsWith("left") ? "none" : "translateX(-100%)"
    );
    assert.ok(
      !controls.className.includes("left-0") &&
        !controls.className.includes("right-0"),
      "no viewport-edge anchor remains"
    );
  });
}
test("portable Toast story args affect the emitted notification", async () => {
  await ready;
  const jiti = createJiti(__filename, {
    fsCache: false,
    jsx: { runtime: "automatic" },
  });
  const stories = jiti("../registry/new-york/toast.stories.tsx");
  const { composeStories } = require("@storybook/react");
  const composed = composeStories(stories);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await React.act(async () =>
    root.render(
      React.createElement(composed.Playground, {
        action: true,
        description: "Custom detail",
        status: "warning",
        title: "Controlled story",
      })
    )
  );
  const trigger = [...host.querySelectorAll("button")].find(
    (button) => button.textContent === "Show configured notification"
  );
  await React.act(async () => trigger.click());
  assert.ok(document.body.textContent.includes("Controlled story"));
  assert.ok(document.body.textContent.includes("Custom detail"));
  assert.ok(document.body.textContent.includes("Undo"));
});
