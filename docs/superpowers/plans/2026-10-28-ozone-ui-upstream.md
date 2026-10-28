# Ozone-informed Vandor UI Implementation Plan

> **For agentic workers:** Follow the execution mode selected at approval. Orchestrated modes use `/home/alfarizi/.config/opencode/workflows/planned-execution.md`. Build berantai instead uses only `/home/alfarizi/.config/opencode/workflows/build-chained.md`. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the approved reusable Ozone improvements into Vandor UI, including an integrated AppShell user menu, DateTime family, fields, metrics, and consumer-owned DataGrid data.

**Architecture:** Adapt reference behavior to the existing registry and Vandor tokens. Keep application auth/routing/cache ownership outside the library, share controllers and small helpers, and distribute complete source/dependency closures. Repository source stays flat where existing family conventions require it; installed DateTime source lives in its own folder.

**Tech Stack:** React 19, TypeScript 6, Tailwind 4, Base UI ^1.8.0, Motion ^12.38.0, TanStack Query 5/Table 9, Zod 4, Next.js 16/Fumadocs, shadcn 4.5.0, Node test runner/Jiti/Happy DOM, portable Storybook React 10.6 types.

**Authority:** Approved spec: `docs/superpowers/specs/2026-10-28-ozone-ui-upstream-design.md`. Plan is awaiting review. No implementation, commit, merge, push, branch switch, worktree or delegation is authorized by saving this plan.

## Discovery Evidence

- Checkout is `/home/alfarizi/dev/vandor/ui`, branch `main`, tracking `origin/main`. At discovery the only change was the newly written spec. Recheck before execution; do not assume this remains true.
- Recent commits inspected: `7e0e9ba` (PageContainer padding), `f8a7773` (component regression backports), `595c02a` (AppShell). Preserve those fixes except explicitly approved spacing changes.
- Read `.agent/frontend-workflow.md`, `.agent/component-implementation.md`, `.agent/registry-distribution.md`, `package.json`, `tsconfig.json`, `next.config.mjs`, and `.github/workflows/ci.yml`.
- Source inspected: AppShell, Dropdown action/close/error implementation, Select, Input outline, PageContainer, DataGrid hook/context/index; Ozone AppShell/BO shell/NavUser, FieldOutline, StatsCard, Select/Autocomplete, date helpers and DateTime.
- Existing harnesses inspected: `tests/app-shell.test.cjs`, `tests/select-input.test.cjs`, `tests/page-container.test.cjs`, `tests/data-grid-controller.test.cjs`, `tests/data-grid-distribution.test.cjs`, `tests/component-family-artifacts.test.cjs`, `tests/consumer-compatibility.test.cjs`, `tests/registry-stories-distribution.test.cjs`.
- Distribution interfaces observed: `prepareFamilyArtifacts({ artifactDirectory, cwd, name, outputDirectory })`, `resolveAliasDirectory(cwd, alias)`, and `node scripts/install-component-family.cjs <item> <consumer-directory> [--dry-run]`. The installer whitelist and artifact family regex currently recognize only Autocomplete/DataGrid.
- `tests/fixtures/component-families/verify.cjs` runs real CLI plus separate dependency installation/typechecks and stories checksums, with `FAMILY_VERIFY_LAYOUT`. Existing cases are `default`, `src-divergent`, and `schema-only`, not a complete three-layout DateTime matrix yet.
- Confirmed package scripts: `pnpm typecheck`, `pnpm check`, `pnpm registry:build`, `pnpm build`; `pnpm test` is an unbounded convenience script and must not be used as-is. CI uses explicit bounded serial Node tests. Production build honors `VANDOR_BOUNDED_BUILD=1` to limit Next CPUs.
- Documentation wiring is in `lib/component-docs.ts` (including family install command selection), `components/component-documentation.tsx`, `lib/*-playground.ts`, `lib/input-component-props.ts`, and `components/input-family-playground.tsx`. Do not invent a `component-installation.ts` or separate date-picker playground module.
- No live application services, databases, credentials, or Ozone environment files are needed. Installed node_modules are available. Real consumer package installs may require network; generated `public/r` must be fresh first.
- Browser URL is unknown. No additional dev/Storybook server may be assumed or started. Repository-wide runtime/type/build baselines were not run during planning; no baseline defect is established and a clean baseline is not claimed.

### Earliest uncertainty resolution

- T1: verify custom Tooltip trigger composition against installed public Base UI types; choose single-root ReactElement control contract rather than claiming arbitrary ReactNode support.
- T2: inspect Dropdown/Base UI close reasons and cancellation before integrating mobile user-menu dismissal. If no reliable existing public selection-close signal exists, add the smallest typed internal integration seam with Dropdown regression protection; do not infer selection from every close event.
- T5: confirm focus-within and portal interactions with real Base UI parts before changing Autocomplete label state.
- T10: validate ISO offset/calendar parsing independently of engine Date normalization, including leap days and invalid offsets.
- T11: test DateTime family alias preparation offline before real CLI verification in T16.
- T13: inventory every controller result field consumed by DataGrid so the source adapter does not impersonate a full Query result.

## Verification Architecture

| Requirements | Lowest-cost meaningful local evidence                                                        | Real boundary required before completion                                                |
| ------------ | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| R1–R3        | Happy DOM interaction tests, public types, portable story composition                        | Browser shell, router-link tooltip, mobile drawer/user menu; CLI/consumer closure       |
| R4           | Pure date vectors, server markup + hydrateRoot tests, ref/native props, generated-code tests | Real installed family and aliases, Next client-boundary fixture, browser Intl/hydration |
| R5–R6        | Form/ARIA/focus tests with real Base UI, outline/helper distribution checks                  | Browser labels and interactive popup inside actual Drawer/Dialog                        |
| R7           | Exhaustive small-count layout invariants and portable rendering                              | Browser row widths/separators on mobile/tablet/desktop                                  |
| R8           | Both controller adapters, source without QueryClientProvider, inference and request tests    | Real DataGrid renderer/controls and installed consumer types                            |
| R9           | Visibility action regression, token declaration/contrast inspection, locale type/import      | Browser dark/light destructive button and localized examples                            |
| R10          | Artifact parity, docs discovery, preview/code/Reset tests, typed stories                     | Real shadcn installation/checksums and browser documentation/playgrounds                |

Happy DOM is a test environment, not evidence of browser geometry, safe-area appearance, contrast or animation. Artifact materialization/typechecking is not a replacement for actual CLI installation. Local fake rows are appropriate for UI examples; no claim is made about real auth, servers or persistence. Portable stories checks do not establish Storybook UI appearance.

## Global Constraints

- The user explicitly permits breaking changes. Do not introduce compatibility switches solely to preserve the old shell/page spacing.
- Preserve unrelated public behavior and the existing documentation website design.
- Do not modify Ozone; no Ozone workspace import, auth SDK, router package, or new date library may enter distributed source.
- Root/content surface uses background; sidebar uses the sidebar token. Use Vandor semantic tokens, native semantics, public dependency APIs, and `cn` merging.
- Main content has no default page padding. PageContainer defaults become 16px below `sm`, 24px from `sm`, and 48px from `lg` (`p-4 sm:p-6 lg:p-12`).
- `showHeader` defaults to `true`, matching Ozone.
- NavUser functionality is integrated into AppShell, not a standalone item. Custom `sidebarFooter` overrides built-in `user` rendering.
- DateTime locale defaults to `en-US`; fallback defaults to `—`. Epoch inputs are milliseconds. Explicit `format` replaces default Intl options.
- DateTime is a folder under the configured components alias with public `index.ts`; no query adapter, schema entry, `@repo/ui-utils` import or new date dependency.
- No Ozone branding/palette/radius, OzoneLoader, new Table, authentication/backend/routes, relative-time clock, live timestamp updates or minimum-loading hook.
- Preserve existing DataGrid controller contracts, schema-derived inference, selection and both pagination modes; source use requires no QueryClient provider at runtime.
- Stories are mandatory to author but optional to install; stories-only installation must preserve customized core source. AppShell retains its documented no-props-playground exception.
- Do not edit generated registry contents manually. Declare all dependency/helper/CSS/token requirements and preserve attribution/licenses.
- Browser server starts/restarts/port changes, Playwright, extra browser automation, destructive actions, branch changes, and commit/merge/push require applicable user authority.

## File Structure and Ownership

All scope locks are **flexible**: the smallest supporting file can be added if recorded in the execution evidence without changing approved behavior. Existing unrelated source is never overwritten for convenience.

- AppShell owner: `registry/new-york/app-shell.tsx`; new internal `app-shell-user.tsx` and optional navigation helper if needed. Public user types are exported through AppShell, not a new registry item. Existing `app-shell.stories.tsx`, three `examples/app-shell-*-demo.tsx`, `lib/app-shell-props.ts`, `content/docs/components/app-shell.mdx` own teaching surfaces.
- Fields owner: existing `select.tsx`/`autocomplete.tsx`, new `registry/new-york/field-outline.tsx`, matching docs/playgrounds/stories. Shared helper installation belongs to both dependency closures, not a hidden website import.
- Metrics/small changes: existing `stats-card.tsx`, `input-password.tsx`, `button.tsx`, `date-range-picker.tsx` and their teaching surfaces. Token declarations belong in registry setup/manifest; not an internal website palette redesign.
- DateTime new source: `registry/new-york/date-time.tsx`, `date-time-utils.ts`, `date-time-index.ts`, `date-time.stories.tsx`; installed as `date-time/date-time.tsx`, `date-time/date-time-utils.ts`, `date-time/index.ts`, optional colocated story. New docs/playground/demo files mirror current conventions.
- DataGrid: `use-data-grid.ts` may be split into new `data-grid-controller.ts`/`use-data-grid-source.ts` to isolate the shared controller from adapters; `data-grid-index.ts` owns public exports, `data-grid-context.tsx` the minimal renderer surface, and `data-grid-controls.tsx` pagination UI.
- Distribution/documentation: `registry.json`, generated `public/r`, scripts, tests/fixtures, `lib/component-docs.ts`, `components/component-documentation.tsx`, `content/docs/components/meta.json`, and the narrow family exception in `.agent/registry-distribution.md`.
- Durable evidence: new `docs/superpowers/plans/2026-10-28-ozone-ui-upstream-evidence.md` created in T1. It records task/batch state, exact command/output summaries, Git state, gate IDs, limitations and requirement coverage. It is not a substitute for any selected workflow's separate control/handoff records.

## Safe Command Catalog

Run from repository root, sequentially, after inspecting current machine workload. Commands below are concrete forms, not permission to exceed memory rules.

Focused test pattern (replace the named file/pattern with the explicitly listed task case):

```sh
NODE_OPTIONS="--max-old-space-size=512" UV_THREADPOOL_SIZE=1 timeout --signal=TERM --kill-after=5s 120s node --test --test-concurrency=1 --test-name-pattern='headerless' tests/app-shell.test.cjs
```

Only after a focused case is safe, expand to its complete file, then other named files, still one invocation at a time. Full integrated suite belongs only to final Batch 6:

```sh
NODE_OPTIONS="--max-old-space-size=512" UV_THREADPOOL_SIZE=1 timeout --signal=TERM --kill-after=5s 900s node --test --test-concurrency=1 tests/*.test.cjs
NODE_OPTIONS="--max-old-space-size=2048" UV_THREADPOOL_SIZE=1 timeout --signal=TERM --kill-after=5s 300s pnpm typecheck
NODE_OPTIONS="--max-old-space-size=1024" RAYON_NUM_THREADS=1 timeout --signal=TERM --kill-after=5s 180s pnpm check
NODE_OPTIONS="--max-old-space-size=1024" UV_THREADPOOL_SIZE=1 timeout --signal=TERM --kill-after=5s 180s pnpm registry:build
NODE_OPTIONS="--max-old-space-size=2048" NEXT_TELEMETRY_DISABLED=1 VANDOR_BOUNDED_BUILD=1 RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1 timeout --signal=TERM --kill-after=5s 600s pnpm build
NODE_OPTIONS="--max-old-space-size=512" UV_THREADPOOL_SIZE=1 timeout --signal=TERM --kill-after=5s 1200s node tests/fixtures/component-families/verify.cjs
NODE_OPTIONS="--max-old-space-size=512" UV_THREADPOOL_SIZE=1 timeout --signal=TERM --kill-after=5s 1200s node tests/fixtures/autocomplete-consumer/verify.cjs
git diff --check
```

Per-batch registry build refreshes that batch's artifact tests; do not repeatedly run production builds during iteration. Typecheck after changes to shared public interfaces. Assert only primitives or boolean identity with short messages; no DOM/React graph assertion formatting. Teardown roots, observers, windows, timers and Query clients on failure as well as success. A heap flag is not a total-RAM cap. On OOM, timeout or abnormal growth, stop the owned process tree and investigate a smaller case; never automatically retry, raise budgets or stop user processes. Use OS process-tree isolation for a known runaway reproduction if available; otherwise remain read-only/reduced and disclose the blocked check.

## External Gates

Each gate has states `PASS`, `FAIL`, `BLOCKED`, `SKIPPED`; only `PASS` satisfies acceptance. G-VISUAL and G-CLI are required acceptance gates of Batch 6 only. Batches 1–5 have explicitly local gates: they can pass with their local evidence while recording outstanding final integration evidence, never claiming visual quality or actual installability from those local results. An external failure does not stop unrelated local batches. No batch or full plan is falsely reported accepted while its own required gate is pending.

- **G-VISUAL:** blocks final visual acceptance of R1–R10, not local Tasks 1–15. Source: primary dev server URL supplied by user and OpenChamber browser captures/interactions. Owner/dependency: user provides URL or explicit server authorization; executor performs checks. Resolution: changed desktop/mobile, themes, safe areas, keyboard, menus/overlays, reduced motion and playground checks recorded against current source. No guessed URL, new server or Playwright fallback.
- **G-CLI:** blocks final distribution acceptance, not offline artifact/unit/type work. Source: real CLI fixture installs default/divergent/src aliases, independent consumer compilation, stories-only checksums. Owner/dependency: executor plus available package-network/cache. Resolution: all affected cases pass against freshly built artifacts, no repository-source import fallback. Network failure is `BLOCKED`, semantic mismatch is `FAIL`.
- **G-BASELINE:** blocks only the affected integrated checks if unrelated repository defects surface. Source: current-tree reproducible checks and scoped comparison, owner user for out-of-scope fixes. Resolution: repair within scope or obtain explicit scope authorization; report unrelated failures without weakening acceptance or silently expanding scope.

Storybook UI is an accepted unperformed limitation, not an external gate. Do not create a Storybook server.

## Execution Batches

### Batch 1: Ozone-style AppShell with integrated user footer

- Goal: deliver R1–R3 with executable examples and portable stories.
- Tasks: 1–3, in order.
- Depends on: no earlier batch; execution profile/branch decision before edits.
- Acceptance gate: local shell and PageContainer focused/full tests, Dropdown regression cases, typed custom link/user API, docs/story composition, current generated AppShell closure. Passing this local gate does not establish visual or real CLI acceptance.
- External gates: none required to accept this local batch; G-VISUAL/G-CLI are owned by T16. Record deferred checks for the final audit without marking this local batch externally blocked.
- Verification impact: shell layout can invalidate all shell demos/stories and PageContainer snapshots; user menu adds Dropdown/helper closure dependencies and invalidates AppShell installation checks.

### Batch 2: Consistent labeled fields and overlay behavior

- Goal: deliver R5–R6 with one real-notch helper and preserved form semantics.
- Tasks: 4–6, in order; T4 helper precedes T5.
- Depends on: none functionally; execute after Batch 1 to serialize registry/docs edits.
- Acceptance gate: local Select/Autocomplete form, focus, generated-code and stories tests, helper dependency closure, typecheck and fresh artifacts. Record deferred visual/CLI evidence without claiming visual or actual installation acceptance.
- External gates: none for this local batch; G-VISUAL/G-CLI belong to T16.
- Verification impact: helper/source/metadata changes invalidate field render, consumer, docs and family artifact evidence; rerun Input regression checks even though its public design is unchanged.

### Batch 3: Responsive metrics and small reusable controls

- Goal: deliver R7/R9 without unrelated component redesign.
- Tasks: 7–9; T7 and T8 are independent, T9 reconciles both.
- Depends on: none functionally; execute after Batch 2 for serialized shared files.
- Acceptance gate: local counts/layout invariants, StatsCard runtime/reduced-motion tests, translated password interaction, locale types, Button token setup, matching teaching surfaces/artifacts. Visual/CLI evidence is final-batch work, not a claim from this local gate.
- External gates: none for this local batch; G-VISUAL/G-CLI belong to T16.
- Verification impact: StatsCard snapshots, Button-dependent rendered stories and destructive theme evidence; token/setup edits invalidate consumer setup checks.

### Batch 4: Self-contained DateTime component family

- Goal: deliver R4 with independent folder installation and SSR-safe display.
- Tasks: 10–12, in order.
- Depends on: none functionally; execute after Batch 3 to serialize manifest/generator work.
- Acceptance gate: pure parsing/Intl vectors, actual hydration/ref tests, public type checks, family alias preparation, documentation/code-generator parity and portable stories; actual CLI/browser evidence remains pending T16 if not available.
- External gates: none for this local batch; G-CLI/G-VISUAL belong to T16.
- Verification impact: shared family script/generator changes invalidate Autocomplete/DataGrid alias, stories and consumer verification; rerun their offline regressions here and actual matrix in final batch.

### Batch 5: Consumer-owned DataGrid source with shared state

- Goal: deliver R8 using one controller and prove both adapter paths.
- Tasks: 13–15, in order.
- Depends on: no DateTime behavior; execute after Batch 4 to serialize family artifacts/docs.
- Acceptance gate: Query adapter regressions, provider-free source runtime tests, page/cursor/selection/type contracts, single-size controls and real renderer composition, fresh artifact parity. Consumer CLI gate deferred T16 if needed.
- External gates: none for this local batch; G-CLI/G-VISUAL belong to T16.
- Verification impact: all DataGrid controller/context/rendering/inference examples and installed exports; shared family fixture edits invalidate prior CLI matrix evidence.

### Batch 6: Full-plan integration and acceptance audit (Final)

- Goal: close R1–R10 and every required local/external gate on the final tree.
- Tasks: 16 only; this is a large/high-risk integrated audit, not an artificial tiny task.
- Depends on: implementation Tasks 1–15; required missing evidence is reconciled here.
- Acceptance gate: repository-wide integrated commands, actual CLI/consumer matrix, browser verification, complete requirement/evidence audit and migration guidance. No unresolved required finding or gate can be accepted as complete.
- External gates: G-VISUAL, G-CLI, G-BASELINE with the owners/resolution conditions above.
- Verification impact: any repair invalidates the corresponding earlier tests/artifacts/consumer/browser checks; rerun affected gates before the final audit closes. This is the only full-plan audit batch.

## Task Details

### Requirement Coverage

- R1: Task 1 layout/localization/spacing; Task 3 publication; Task 16 browser/integration.
- R2: Task 1 custom-control hover/focus/ref contract; Tasks 3 and 16 consumer examples and real browser evidence.
- R3: Task 2 integrated user menu and async lifecycle; Tasks 3 and 16 installation/documentation/browser.
- R4: Tasks 10–12 DateTime runtime, family installation and teaching surfaces; Task 16 real CLI/Next/browser.
- R5: Tasks 4 and 6 Select labels, native behavior and teaching surfaces; Task 16 visual/install checks.
- R6: Tasks 5 and 6 Autocomplete notch/focus/layering; Task 16 actual overlay painting and selection.
- R7: Tasks 7 and 9 balanced StatsCard layout and stories; Task 16 responsive rendering.
- R8: Tasks 13–15 shared DataGrid/source adapter, controls, types and docs; Task 16 integrated acceptance.
- R9: Tasks 8 and 9 password labels, destructive token and Indonesian locale; Task 16 consumer/theme checks.
- R10: Tasks 3, 6, 9, 11, 12 and 15 publish each feature; Task 16 owns the full-plan audit and CI evidence.

### Task 1: AppShell layout, custom-control tooltip and page spacing

**Files:** modify `registry/new-york/app-shell.tsx`, `page-container.tsx`, `tests/app-shell.test.cjs`, `tests/page-container.test.cjs`; create `tests/app-shell.types.tsx` and the evidence file named above. Optional internal navigation helper remains in AppShell closure. Scope lock: flexible.

**Interfaces:** consumes existing AppShell/Tooltip/Drawer/Button props. Produces `showHeader?: boolean`, localized shell `labels`, footer callback `AppShellNavigationState`, edge-to-edge main, and single-root custom control tooltip composition. Proposed renderer contract is `(state: AppShellNavigationState) => ReactElement`; the root must forward passed props/ref to one native control. No new router dependency. Blocked by: branch/profile authority, not G-VISUAL.

**Acceptance:** tests named `headerless`, `custom control tooltip`, and current collapse/hierarchy/mobile suites; PageContainer padding tests. Typecheck proves single-root usage; browser later proves appearance. Invalidated by: shell/tooltip/drawer dependencies and PageContainer classes.

- [x] Create the execution evidence file with spec R1–R10, Tasks 1–16, batch/gate states and current Git state; all begin pending, not passing.
- [x] Add regression cases to the existing shell harness for `showHeader:false`, localized labels, rail keyboard toggle, mobile side/close/focus return, absence of main padding, and collapsed custom link tooltip. Run one failing case with the focused command catalog before source changes.
- [x] Inspect Tooltip trigger public types. Compose the custom root as the tooltip trigger (not a nested button). Verify the consumer ref still reaches the anchor, click handler fires once, href/aria-current survive, tooltip appears on focus and hover, and expanded/mobile labels do not gain redundant tooltips. A minimal control contract/type fixture is:

```tsx
import { AppShell } from "../registry/new-york/app-shell";

export const CustomLinkShell = () => (
  <AppShell
    brand={{ name: "Acme" }}
    navigation={[
      {
        id: "reports",
        label: "Reports",
        renderControl: ({ closeNavigation }) => (
          <a href="/reports" onClick={closeNavigation}>
            Reports
          </a>
        ),
      },
    ]}
  >
    Content
  </AppShell>
);
```

- [x] Adapt Ozone layout and safe-area/headerless controls to Vandor tokens; preserve search shortcut opt-in, hierarchy inert/focus handling, media-change dismissal and reduced motion. Keep header default true.
- [x] Change PageContainer to `p-4 sm:p-6 lg:p-12`, remove shell main padding, and update existing padding assertions without deleting ref/native override checks. Add a primitive class assertion:

```js
const { PageContainer } = jiti("../registry/new-york/page-container.tsx");
const classes = PageContainer({}).props.className.split(/\s+/);
assert.ok(classes.includes("lg:p-12"), "Desktop padding is 48px");
assert.ok(!classes.includes("lg:p-8"), "Retired desktop padding is absent");
```

- [x] Run safe focused shell/PageContainer checks, then both complete files serially and typecheck. Record result and deferred browser evidence.

### Task 2: Built-in AppShell user menu with safe mobile lifecycle

**Files:** modify `app-shell.tsx`, optionally `dropdown.tsx` only for a necessary typed selection-close seam; create internal `registry/new-york/app-shell-user.tsx`, `tests/app-shell-user.test.cjs`; extend `tests/app-shell.types.tsx` and relevant `tests/dropdown.test.cjs`. Scope lock: flexible.

**Interfaces:** consumes T1 collapse/mobile state and public `DropdownEntry`/`DropdownProps` from `dropdown.tsx`. Produces exported-through-AppShell user configuration; recommended shape:

```tsx
export interface AppShellUser {
  name: string;
  description?: string;
  avatar?: ReactNode;
  items: readonly DropdownEntry[];
  pending?: boolean;
  menuLabel?: string;
}
```

`AppShellProps.user?: AppShellUser`; built-in footer only when `sidebarFooter === undefined`. Internal helper receives `collapsed`, `closeNavigation` and its user config. Blocked by: T1 local APIs.

**Acceptance:** real Dropdown action/link/group/submenu/overlay behavior composed inside shell; tests for pending, rejection, cancellation and close-on-success; no auth or role schema. Invalidated by: Dropdown callback/session lifecycle or shell mobile mounting.

- [ ] Inspect installed public close-event reason/cancellation types and current Dropdown session/pending implementation. Add tests before integration: missing user, initials, description, custom-footer precedence (including explicit null), icon-only name/tooltip, pending repeat lock, and mobile selection.
- [x] Implement the internal identity trigger and configured Dropdown using shared primitives. Do not introduce a standalone NavUser item or hardcoded account/logout. Accessible default menu label is derived from user name and overridden by `menuLabel`.
- [x] Define selection-driven drawer closure, not dismissal-driven closure. Test sync success, preventDefault, thrown error, Promise rejection, `closeOnSelect:false`, and `closeOnSelect:"success"`. Keep pending/rejected/overlay content mounted as required by Dropdown; background clicking or Escape closing the menu alone must not masquerade as navigation selection.
- [x] Preserve real links and their cancellation/modifier semantics; do not close an unrelated menu session from a late Promise. Use boolean assertions, for example:

```js
assert.equal(callbackCount, 1);
assert.ok(
  document.querySelector('[aria-busy="true"]') !== null,
  "Pending user action remains represented"
);
assert.ok(
  document.activeElement === trigger,
  "Focus returns to the surviving trigger"
);
```

Here `callbackCount` and `trigger` come from each new mounted fixture; assertions must follow actual clicks/Promise settlement, not static markup inspection.

- [x] Run the new focused file with pattern `user`, then complete file; rerun touched Dropdown cases and T1 shell tests serially. Typecheck rejects malformed user menu entries. Record any public Dropdown seam and why it was needed.

### Task 3: Ship AppShell documentation, migration and stories

**Files:** modify `registry.json`, generated AppShell/closure items, `registry/new-york/app-shell.stories.tsx`, `lib/app-shell-props.ts`, `content/docs/components/app-shell.mdx`, PageContainer docs/metadata, `examples/app-shell-demo.tsx`, `app-shell-workspace-demo.tsx`, `app-shell-hierarchy-demo.tsx`; create `examples/app-shell-user-demo.tsx`; modify shell/docs/distribution tests. Scope lock: flexible.

**Interfaces:** consumes T1/T2 public APIs. Produces complete AppShell install dependency closure and teaching surfaces without a NavUser install/page. Blocked by: T1/T2 local behavior.

**Acceptance:** portable story compose/render and current docs/source metadata; artifact parity; shell examples compile with no router package. Invalidated by: AppShell/helper API, manifest or docs generator edits.

- [x] Add user/footer/headerless/localization/tooltip stories with deterministic state, including pending/rejected actions and no providers/auth. Preserve current hierarchy/controlled/mobile/long-content stories; migrate custom controls to the supported single-root contract.
- [x] Update examples to use PageContainer exactly once where page padding is wanted; include a true full-bleed example. Document hidden topbar content and retained onSearch shortcut behavior in headerless mode.
- [x] Document the approved spacing break with complete usage:

```tsx
<AppShell brand={{ name: "Acme" }} navigation={[]} showHeader={false}>
  <PageContainer>Page content</PageContainer>
</AppShell>
```

Also document user config, localized names, custom-footer precedence, async close behavior, and supported custom-control prop/ref forwarding.

- [x] Register internal support files and required Dropdown/tooltip/avatar-independent dependencies. Prefer the initials fallback rather than adding the full avatar catalog. Do not put stories/Storybook packages in the ordinary AppShell item.
- [x] Run registry build once, existing AppShell/story/distribution checks, docs tests, and consumer-compatibility materialization extended to AppShell. Reserve actual full CLI/browser acceptance for T16; record it explicitly.

### Task 4: Select labels with a distributable real-notch helper

**Files:** create `registry/new-york/field-outline.tsx`; modify `select.tsx`, `registry.json`, `tests/select-input.test.cjs`, `tests/select.types.tsx`, `tests/select.test.cjs`. Scope lock: flexible.

**Interfaces:** helper `FieldOutline({ label, raised, className })`, using string label, boolean raised and optional merged classes; Select gains `label?: string`, `labelStyle?: "floating" | "static"` (floating default for supplied label). Custom trigger owns its label layout. Blocked by: none.

**Acceptance:** trigger accessible naming, explicit ARIA override, static/floating/unlabeled/custom modes, multi value/size/disabled/invalid/ref/form regression. Invalidated by: helper/trigger DOM or labels.

- [ ] Add one failing label test to the existing mount harness, explicitly removing its default `aria-label` when testing visible-label naming. Then add caller-label precedence and existing form submission/reset/ref scenarios.
- [x] Implement the real-notch fieldset/legend helper without opaque label background or duplicate accessible name. Use `useId` for visible label linkage. Preserve the trigger's full primitive props and class overrides.
- [x] Add typed examples for all modes. Preserve custom-trigger callback inference; do not inject default label markup into a consumer-owned trigger.
- [x] Prove the helper installs in the same UI alias as Select and has no website imports. Add it to the Select item/support closure before building artifacts.
- [x] Run focused `Select.*label` and form/native tests, then complete affected files and typecheck; note that border geometry remains a browser gate.

### Task 5: Autocomplete notch, group focus and popup layer

**Files:** modify `registry/new-york/autocomplete.tsx`, helper closure in `registry.json`, `tests/autocomplete-behavior.test.cjs`, `tests/autocomplete-form.test.cjs`, `tests/autocomplete-parts.test.cjs`; create `tests/autocomplete-overlay.test.cjs` using existing `tests/autocomplete-ui-fixture.cjs` conventions. Scope lock: flexible.

**Interfaces:** consumes T4 FieldOutline; no new managed value API. Group focus remains true when relatedTarget is inside the same control; selection/text/focus raise the label. Positioner uses `isolate z-50`. Blocked by: T4 helper, not T4 visual evidence.

**Acceptance:** single/multiple label state through input→clear→trigger→chip focus transitions, blur outside, clear/select, disabled/invalid and form regressions; popup inside real Drawer/Dialog primitives. Invalidated by: input-group or portal/focus composition.

- [x] Add regression tests that focus each interactive child and assert primitive floating-state/notch indicators instead of entire DOM objects. Run the smallest case red.
- [x] Move focus tracking from the text input to the complete group; ignore blur whose relatedTarget is still inside. Reuse the helper while preserving opaque-free gradient surfaces and existing chip/form logic.
- [x] Add positioner z-50 and test a mounted Drawer containing Autocomplete, opening suggestions and selecting an option. Test Dialog composition as well. DOM tests assert interaction/placement intent; actual painting remains G-VISUAL.
- [x] Verify cross-family helper imports are rewritten to the consumer UI alias, not mistaken for an Autocomplete-owned file. Update distribution tests accordingly.
- [x] Run focused label/focus/overlay tests, existing input/form tests serially, and relevant Input/Select regressions. Do not replace public behavior with class-only assertions.

### Task 6: Field playgrounds, examples and portable packaging

**Files:** modify `lib/select-playground.ts`, `components/select-playground.tsx`, `lib/autocomplete-playground.ts`, `components/autocomplete-playground.tsx`, corresponding MDX/examples/stories, `tests/autocomplete-playground.test.cjs`, `tests/autocomplete-distribution.test.cjs`, `tests/component-family-artifacts.test.cjs`, `tests/consumer-compatibility.test.cjs`; create `tests/select-playground.test.cjs` if label/code parity is not covered elsewhere. Scope lock: flexible.

**Interfaces:** consumes T4/T5 label contracts. Produces runnable label/overlay examples, correctly generated JSX, separate typed stories, updated dependency/manual install guidance. Blocked by: T4/T5 implementation.

**Acceptance:** every exposed label mode/control changes preview and code, fresh Reset, quote-safe labels, typed portable story composition, dependency/helper artifact parity. Invalidated by: metadata defaults/adapter/codegen or installer rewriting.

- [x] Add shared typed config controls for label and labelStyle; select appropriate focus/invalid/disabled examples. Avoid a second unrelated defaults source.
- [x] Test hostile label serialization and output behavior using current Jiti/TS transpilation conventions, then compile generated snippets against installed exports. Example serialized label vector:

```js
const label = 'A "quoted" <label> {value}\nnext';
assert.ok(JSON.stringify(label).includes('\\"'), "Fixture exercises escaping");
```

Use that value in actual preview/code parity assertions; this fixture assertion alone is not acceptance.

- [x] Add Drawer/Dialog embedded popup examples and deterministic portable stories for floating/static/unlabeled/multi and keyboard states. Update usage and accessible naming limitations.
- [x] Build registry and run field docs/playground/story/distribution tests plus offline alias/consumer checks serially. Record deferred actual CLI/browser gates and affected imports for final audit.

### Task 7: Balanced responsive StatsCard rows

**Files:** modify `registry/new-york/stats-card.tsx`, existing StatsCard tests; create `tests/stats-card-layout.test.cjs`, optional internal `registry/new-york/stats-card-layout.ts` if isolating pure calculation is clearer. Scope lock: flexible.

**Interfaces:** no new public layout DSL. Internal layout calculation consumes item count, max columns and item index, returns `{ columns, lastRow, lastColumn }`; map 1/2/3/4 columns to 12/6/4/3 spans. Blocked by: none.

**Acceptance:** counts 0–17 preserve order, sum spans to full rows, desktop max four/tablet max two except exactly three, correct separators, existing animated/reduced-motion behavior. Invalidated by: layout algorithm or breakpoint mapping.

- [ ] Add pure/in-render regression vectors for desktop five→3+2, six→3+3, seven→4+3, zero/one and larger counts before adapting Ozone's calculation.
- [x] Implement balanced rows using `rows=ceil(count/maxColumns)`, distribute remainder to earlier rows, then derive actual row/column ends; do not divide by zero for empty arrays. If helper is extracted, include it in the registry item.
- [x] Assert the result as small primitives; verify every row's span sum is 12 and exactly its last item has no end separator. Keep native metric markup and numbering behavior unchanged.
- [x] Run focused layout, StatsCard runtime and reduced-motion tests serially. Browser later establishes actual widths and separators, not these arithmetic tests.

### Task 8: Localized password controls, destructive token and locale export

**Files:** modify `registry/new-york/input-password.tsx`, `button.tsx`, `date-range-picker.tsx`, their entries in `registry.json`; extend `tests/input-components.test.cjs`, `tests/button-motion.test.cjs`, `tests/date-picker-stories.test.cjs` and public type fixtures as needed. Scope lock: flexible.

**Interfaces:** password gains `showPasswordLabel?: string`/`hidePasswordLabel?: string`; DateRangePicker exports `dateRangeIndonesianLocale` from a verified public DayPicker locale entry. Button switches destructive foreground to its declared semantic token. Blocked by: none.

**Acceptance:** visibility click changes type/aria-pressed/translatable name, disabled button remains inactive; locale is real exported DayPicker data; consumer token exists. Invalidated by: password control, token definitions or locale dependency export.

- [ ] Add failing password cases for custom labels while retaining existing default labels/disabled/readOnly/password-manager/native input assertions.
- [x] Implement props with English defaults and preserve visibility/control semantics. Verify locale export against installed DayPicker declarations before selecting its import path.
- [x] Replace hardcoded destructive white with `text-destructive-foreground`; supply/document the token using supported registry CSS setup. Do not blindly copy Ozone foreground values or use website tokens as the only setup evidence.
- [x] Run focused input/button/date tests and types. No new runtime test is required solely for the CSS color substitution; installed token checks and browser contrast are the meaningful evidence.

### Task 9: Publish metrics and small-control teaching surfaces

**Files:** modify StatsCard docs/stories/examples/playground, `lib/input-component-props.ts`, `components/input-family-playground.tsx`, InputPassword docs/stories/examples, Button and DateRangePicker docs/stories, matching generated artifacts and docs/playground tests. Scope lock: flexible.

**Interfaces:** consumes T7/T8. Produces accurate public prop/default/dependency guidance, row-count cases, translated password generated code and localized calendar example. Blocked by: T7/T8 local behavior.

**Acceptance:** interactive row counts and label config have preview/code parity and Reset, stories compose, defaults match runtime, token installation survives consumer setup. Invalidated by: metadata/preview/manifest changes.

- [x] Teach five/six/seven metric examples and mobile/tablet arrangement; preserve values/reduced-motion examples. Do not expose controls for unsupported layout variants.
- [x] Expose translated visibility labels in the shared input playground and generated code; Reset also restores hidden-password transient state where applicable.
- [x] Demonstrate `dateRangeIndonesianLocale` with caller-owned apply/cancel/clear copy. Document destructive token as an actual consumer setup requirement.
- [x] Build registry once, run focused codegen/story/docs/artifact checks and typecheck, and record theme/browser evidence pending T16.

### Task 10: DateTime parsing, formatting and hydration-safe component

**Files:** create `registry/new-york/date-time-utils.ts`, `date-time.tsx`, `date-time-index.ts`, `tests/date-time-utils.test.cjs`, `tests/date-time.test.cjs`, `tests/date-time.types.tsx`. Scope lock: flexible.

**Interfaces:** `DateInput = string | number | Date | null | undefined`; `DateFormatOptions` has locale string/string[], timezone string, Intl format and string fallback. Helpers `toDate(value): Date | null`, `formatDate(value, options?): string`; public `DateTime` accepts native time props/ref excluding children/dateTime plus required value and format options. Only the component module needs client hooks; helper remains React-free.

**Acceptance:** actual parsing/Intl tests and `renderToString`→`hydrateRoot` with recoverable-error capture, then client update/native ref. Invalidated by: helper validation/Intl defaults/hydration strategy.

- [ ] Add pure red tests using Jiti, including the following real vectors:

```js
const { toDate, formatDate } = jiti("../registry/new-york/date-time-utils.ts");
assert.equal(toDate("2026-02-30T08:00:00Z"), null);
assert.equal(toDate("2026-10-24"), null);
assert.equal(toDate("2026-10-24T08:00:00"), null);
assert.equal(
  toDate("2026-10-24T08:00:00+07:00").toISOString(),
  "2026-10-24T01:00:00.000Z"
);
assert.equal(formatDate(null), "—");
assert.throws(() => formatDate(0, { timeZone: "Not/AZone" }), RangeError);
```

Also test leap year/day/month/time/offset boundaries, fractional seconds, numeric zero, Date copying, nonfinite numbers, custom fallback, explicit format replacement/timeZone precedence. Compare Intl results with the same declared options instead of hardcoding locale punctuation.

- [x] Implement strict instant parsing with calendar validation before Date conversion. Do not simply accept Date.parse normalization or use UTC reconstruction that mishandles years 0000–0099. Reject invalid date/offset components and nonfinite values.
- [x] Implement 24-hour default Intl formatting with en-US fallback locale and explicit override precedence. Do not catch invalid formatter configuration as invalid input.
- [x] Implement component fallback via `useSyncExternalStore` server/client snapshots, preserve ISO dateTime on valid instants, forward native props/ref, and omit invalid timestamp attributes. Use no suppression of hydration warnings.
- [x] Add real hydration tests proving server and initial client fallback match, no recoverable mismatch, post-hydration locale/timezone display and value updates. Unmount roots and abort DOM on failure.
- [x] Run one pure red/green case, full utility file, focused hydration then full component tests, all serially; typecheck native prop/ref and unsupported children/dateTime examples.

### Task 11: DateTime folder installation and family tooling

**Files:** modify `registry.json`, `scripts/component-family-artifacts.cjs`, `scripts/install-component-family.cjs`, `.agent/registry-distribution.md`, `lib/component-docs.ts`, existing family/consumer tests and `tests/fixtures/component-families/verify.cjs`; create `tests/date-time-distribution.test.cjs` and `tests/fixtures/date-time-consumer/verify.cjs`. Scope lock: flexible.

**Interfaces:** consumes T10 four source modules including later optional stories. Item names allowed: `date-time`, `date-time-stories` only; do not accidentally permit date-time-query/schema. Source mapping:

```text
date-time-index.ts   -> components/date-time/index.ts
date-time.tsx        -> components/date-time/date-time.tsx
date-time-utils.ts   -> components/date-time/date-time-utils.ts
date-time.stories.tsx -> components/date-time/date-time.stories.tsx (separate item)
```

All installed helpers use relative family imports, no website aliases. Blocked by: T10 local source; stories artifact completed in T12.

**Acceptance:** offline default/divergent/src target preparation; no Ozone/Query/date library dependency; stories-only no core dependency; real CLI matrix in T16. Invalidated by: any family regex/target/import rewriting.

- [ ] Add failing family-artifact tests for DateTime, invalid suffixes and traversal rejection. Define family ownership explicitly instead of the current binary Autocomplete-versus-DataGrid fallback.
- [x] Extend installer whitelist, family recognition and generator install commands narrowly; preserve existing version normalization, local dependency closure, cycle/alias escape checks, overwrite prompts and src-prefix behavior.
- [x] Register ordinary and stories-only items and document the narrowly expanded family exception. Keep public source flat and installation targets nested, as existing families do.
- [x] Extend actual CLI fixture with a non-src divergent layout as well as existing default/src-divergent. Install DateTime before Query families and assert no Query dependency introduced by it. Add public import compilation and checksum verification for all customized DateTime core files during stories install.
- [ ] Add `tests/fixtures/date-time-consumer/verify.cjs`: create one owned disposable Next consumer under `/tmp/opencode`, using the installed repository Next/React version ranges and actual independent package installation. Generate `app/layout.tsx`, a Server Component `app/page.tsx` importing installed DateTime, local CSS/components/TypeScript config, install the freshly prepared registry item through real CLI, then run bounded single-CPU Next build with no server listener. Use the family fixture's deadline/environment/cleanup patterns and no runtime import fallthrough to repository source. Offline TypeScript alone must not be labeled proof of an RSC boundary. Record any network gate.
- [ ] Before T12 creates stories, run target-preparation tests using explicit minimal fixture artifacts and source compilation directly, not stale generated DateTime artifacts. After T12, build the complete registry and run artifact parity/offline installed-consumer compilation, including existing Autocomplete/DataGrid regressions. Mark G-CLI pending until actual installs execute.

### Task 12: DateTime playground, documentation and stories

**Files:** create `registry/new-york/date-time.stories.tsx`, `lib/date-time-playground.ts`, `components/date-time-playground.tsx`, `examples/date-time-demo.tsx`, `examples/date-time-formats-demo.tsx`, `content/docs/components/date-time.mdx`, `tests/date-time-playground.test.cjs`, `tests/date-time-stories.test.cjs`; modify renderer/generator/docs navigation/discovery tests. Scope lock: flexible.

**Interfaces:** consumes T10 public DateTime. Produces `getDateTimeDefaults()`, `getDateTimeCode(values)` and typed preview/config adapter, optional stories entry, gallery `DateTimeDemo`. Blocked by: T10 API, T11 packaging definitions.

**Acceptance:** real controls and fresh Reset, generated native JSX serialization/import typing, server/hydration limitation explained, portable stories and docs/gallery discovery. Invalidated by: config/codegen/public API/installed entry.

- [x] Create fixed timestamp demo fixtures, locale/timezone/format/fallback controls and invalid-input example; do not use current time as a moving default.
- [x] Serialize format presets as valid Intl options, not a conflicting merge. Invalid formatter configuration must be explained; the playground should offer valid presets rather than crash on arbitrary invalid timezone text.
- [x] Use standard ComponentPlayground, generated code and Copy; test nondefault controls, malicious string escaping, reset from custom values, and actual preview/code connection. Compile representative generated snippets against installed family exports.
- [x] Add default/localized/timezone/date-only-display/time-only-display/invalid/native-props stories with portable args; describe fallback before hydration. Do not promise birthday/date-only string parsing.
- [x] Wire docs definitions, renderer, metadata and gallery, preserving standard section order. Explain exact helper/manual-install closure, family wrapper commands and separate stories prerequisite/install.
- [x] Build registry; run DateTime and docs/gallery/stories checks and existing shared-family offline tests serially. Record missing browser/CLI evidence accurately.

### Task 13: Shared DataGrid controller and source adapter

**Files:** modify `registry/new-york/use-data-grid.ts`, `data-grid-context.tsx`, `data-grid-index.ts`, `registry.json`; create `data-grid-controller.ts`, `use-data-grid-source.ts`, `tests/data-grid-source.test.cjs`, `tests/data-grid-source.types.tsx`; extend existing controller/inference tests. Scope lock: flexible; split paths can change with rationale, public `useDataGridSource` cannot disappear.

**Interfaces:** consume current Options fields as shared controller options, not a second request DSL. Export:

```tsx
export interface DataGridSource<C extends DataGridContract> {
  data: DataGridOutput<C> | undefined;
  error?: unknown;
  loading?: boolean;
  refreshing?: boolean;
  refetch: () => unknown;
}
```

`useDataGridSource(options)` accepts the shared `contract`, `columns`, `getRowId`, request/selection/filter options plus `source`. `useDataGrid` retains its query-options inference/proof and real `UseQueryResult`. Renderer consumes existing minimal `query: { data, error, refetch }` plus shared controller presentation, not fabricated native fields. Blocked by: none functionally; local interface inventory first.

**Acceptance:** source mounts without QueryClientProvider, source adapter never calls useQuery, existing Query path preserves cache/select/status, same state machine for page/cursor/filter/sort/selection; positive/negative schema-derived types. Invalidated by: shared request/controller/query/result changes.

- [ ] Inventory every `DataGridController`/`DataGridSurface` field and consumer example before extraction. Add provider-free source tests and Query regression assertions before implementation.
- [x] Extract request initialization and shared controller; both adapters must call the same hooks in stable order, not a conditional useQuery branch or duplicated state machine. Keep baseline/raw filter restoration and atomic controlled callbacks.
- [x] Implement the source adapter with normalized internal presentation flags, preserving data during refreshing and exposing source error/refetch through the minimal surface. Do not advertise the full Query result or package-dependency removal.
- [x] Extend tests for initial loading→data, refreshing with rows, empty, error/retry, controlled restore, debounce/reset/apply validation, sorting, page-size correction, cursor history and explicit/all-matching selection across data updates. Test immutable data refresh and repeated refresh with unchanged identity where reconciliation needs it.
- [x] Test external ownership: request callbacks update a fixture-controlled source; grid makes no network call and creates no QueryClient. Explicitly document stale-data/request correspondence as consumer responsibility.
- [x] Run source/controller tests focused then complete, existing pagination/selection/state/integration tests serially and typecheck existing inference fixtures. Add negative source row/output/getRowId cases without `any` or inference-suppressing casts.

### Task 14: Source-compatible DataGrid controls and renderer

**Files:** modify `registry/new-york/data-grid-controls.tsx`, `data-grid-context.tsx`, `data-grid-feedback.tsx` only if needed by minimal surface; extend `tests/data-grid-controls.test.cjs`, `tests/data-grid-rendering.test.cjs`, `tests/data-grid-integration.test.cjs`. Scope lock: flexible.

**Interfaces:** consumes T13 shared surface; `pageSizes.length <= 1` omits selector, all other pagination buttons/ranges remain. Blocked by: T13 shared interface.

**Acceptance:** mounted real DataGrid/toolbar/pagination/selection/feedback with source-only adapter; zero/one/multiple size options, correct loading/error/refresh states, provider-free rendering. Invalidated by: controller context/controls/feedback API.

- [x] Add failing control tests for pageSizes `[]`, `[25]`, `[10,25,50]`; verify pagination/range announcements remain, and multiple-size changes still update request exactly once.
- [x] Implement conditional selector, preserving existing backend page-size contract and labels; do not add a selectable option absent from caller input.
- [x] Mount real table and controls using source adapter without QueryClientProvider. Drive filter, next-page, selection and retry interactions; assert rows/callback primitives and correct feedback rather than only hook internals.
- [x] Rerun native Query-backed controls/rendering and source cases serially; investigate any private `query` assumptions rather than adding fake native fields.

### Task 15: Source adapter documentation, examples and portable stories

**Files:** create `examples/data-grid-source-demo.tsx`; modify `registry/new-york/data-grid.stories.tsx`, `content/docs/components/data-grid.mdx`, `lib/data-grid-playground.ts`, `components/data-grid-playground.tsx`, existing examples/story/generated-type/distribution tests and registry dependency closure. Scope lock: flexible.

**Interfaces:** consumes T13/T14 exports and request callback contract. Produces a complete source-owned example and single-size pagination story, retaining existing Query docs/examples. Blocked by: T13/T14 local APIs.

**Acceptance:** examples/stories run with no second Query cache, generated public imports/row inference compile, dependencies and renderer surface documentation accurate. Invalidated by: controller exports/types/options or family targets.

- [x] Build a deterministic consumer-owned source demo that owns request state and source data updates. Show callback/refetch wiring, initial/refresh/error states and ownership limits; do not fake a backend sort contract.
- [x] Add provider-free portable source stories and single-size cases; keep existing QueryClient-backed stories correctly isolated and typed.
- [x] Update API/default/behavior guidance to distinguish minimal source result from native query result, and explain stale-response/cache/auth ownership.
- [x] If adding an adapter choice to playground, make preview/code derive from one typed configuration and reset both source and request state. Otherwise retain existing meaningful controls and show source use as a focused runnable example; do not add an inert selector.
- [x] Build registry, verify changed closure/index exports, run generated-code/example/story/type and distribution tests serially, and record which previous family checks need final rerun.

### Task 16: Final installed-consumer, browser and repository audit

**Files:** audit all changed files and requirement mappings; update evidence file, migration docs, family fixture README, `.github/workflows/ci.yml` only to ensure new durable acceptance tests/fixture checks run. Bounded in-scope repairs can touch earlier task files with invalidated evidence explicitly listed. Scope lock: flexible.

**Interfaces:** consumes all Tasks 1–15 and G-VISUAL/G-CLI/G-BASELINE. Produces final R1–R10 evidence matrix, explicit pass/fail/blocked states, clean generated parity and truthful handoff. Blocked by: earlier implementations, not by lack of a Storybook server.

**Acceptance:** the following checklist is the only full-plan integrated gate. Tests with mocks, absent network, skipped browser checks or stale artifacts cannot be marked passing.

- [x] Audit spec coverage line-by-line: R1–R3→T1–T3; R4→T10–T12; R5–R6→T4–T6; R7→T7/T9; R8→T13–T15; R9→T8/T9; R10→each publishing task plus T16. Check excluded scope has not crept in.
- [x] Confirm automated tests are included by existing `tests/*.test.cjs` CI glob and types by tsconfig. Ensure real family CLI matrix is run by a bounded serial CI step, or a verified existing invoked fixture delegates it; currently CI only explicitly invokes autocomplete-consumer fixture. Do not claim matrix CI coverage without wiring it.
- [x] Run fresh registry build, complete affected artifact checks and full serial tests only after focused runs were safe. Run typecheck/lint using catalog commands. Investigate baseline failures with minimal diagnostics; no unapproved unrelated repair.
- [ ] Run real CLI matrix serially against fresh artifacts: default, non-src divergent and src-divergent DateTime/core/story imports and checksums, affected AppShell/support closure, Select/helper and Autocomplete/helper placement, DataGrid public source adapter, no repository-runtime fallback. Preserve core/package/config files on stories-only installation. Retain schema-only and optional-query regressions as existing family safety checks.
- [ ] Run existing autocomplete-consumer fixture; establish installed Next Server Component→DateTime client import via `NODE_OPTIONS="--max-old-space-size=512" UV_THREADPOOL_SIZE=1 timeout --signal=TERM --kill-after=5s 1200s node tests/fixtures/date-time-consumer/verify.cjs` (created in T11). Its owned framework-build child uses an explicit heap no greater than 2048 MiB and single CPU within a 600-second process-tree deadline. This is genuine framework compilation, not transpilation alone. Package install/network failures mark only G-CLI blocked. Clean up only owned disposable fixture trees in `/tmp/opencode`.
- [ ] Ask for the primary server URL if still unknown. Use OpenChamber browser panel, not guessed ports or alternate automation. Check shell header/headerless at desktop/mobile, 200% zoom/narrow content, long nav, safe-area positioning, controlled rail, hover/keyboard custom-link/user tooltips, mobile drawer Escape/focus return, sync/pending/rejected/close-on-success user actions and custom footer precedence.
- [ ] Inspect Select/Autocomplete label modes, values, invalid/disabled and group focus in light/dark; actually select suggestions inside Drawer and Dialog. Verify StatsCard counts 0/1/3/5/6/7 at mobile/tablet/desktop and destructive Button contrast against installed semantic setup.
- [ ] Verify DateTime fallback/hydration/current display, browser timezone/explicit timezone and invalid input; DataGrid source-owned loading/error/refresh/pagination/selection; controls/Reset/Copy/generated code in changed playgrounds. Record viewport/theme/action/result and screenshots, not only expected behavior.
- [ ] Run bounded production build with `VANDOR_BOUNDED_BUILD=1`, then typecheck if Next regenerated types; inspect registry diff for unintended overwrites, missing helper/license/CSS setup and obsolete outputs. Run `git diff --check`. If any repair changes compiled/runtime source, rerun invalidated test/build/consumer/browser gates rather than relying on earlier green output.
- [x] Self-review actual surrounding code/diff for event/ref merging, callback ordering, stale async sessions, type inference, circular/shared-target closure and docs/manual/processed-Markdown parity. Close findings with actual evidence; unresolved required findings forbid overall completion.
- [ ] Final handoff records Git state and exact checks, G-VISUAL/G-CLI/G-BASELINE states, breaking migration guidance, and `Storybook UI not verified: this project has no Storybook server`. Report user-owned server left untouched. No auto commit/merge/push; after successful acceptance offer leave branch or user-selected merge with the required Git-state report and explicit permission.

## Plan Review and Execution Selection

Approve this plan before any execution. Then offer exactly: execute inline; Build berantai on GPT 6.1 Sol Medium; Mars direct on Luna High; Janus with adaptive Luna workers; Mercury with Luna Medium workers only; Jupiter with Luna High workers only.

Select branch separately after execution mode: current branch, local main, or confirmed full new `alfarizi/<type>/<slug>` name and base. Never assume main or move existing work.

For Build berantai ask target 1–4 batches per session, recommend exact consecutive batch ranges for these six batches and obtain distribution approval; do not treat target alone as approval. Preserve all batch gates and final audit, perform mandatory read-only parent review between idle executors, carry required repairs forward before new work, and stop on blockers. Other managed modes use the planned-execution workflow and its exact native-result/state discipline. Inline work needs no subagents/worktree/spec rewrite.
