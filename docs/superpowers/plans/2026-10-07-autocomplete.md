# Autocomplete Implementation Plan

> **For agentic workers:** Follow the execution mode selected at approval. Orchestrated modes use `/home/alfarizi/.config/opencode/workflows/planned-execution.md`. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a polished, installable Autocomplete with typed free-text/selection and single/multiple contracts, concise usage, advanced composition, and complete consumer/documentation evidence.

**Architecture:** One Vandor root adapter owns the mode-specific committed value, query, identity, and form contracts. Public Base UI autocomplete/combobox primitives supply accessible interaction; shared styled parts power both compound composition and the convenience component. Free-text multiple adds a bounded string-tag adapter, not arbitrary object creation.

**Tech Stack:** React 19.2.5, TypeScript 6.0.3, Next 16.2.4, Tailwind 4.2.4, `@base-ui/react@^1.8.0`, `cn`, `lucide-react`, `motion@^12.38.0`, Node tests, Happy DOM, jiti, Storybook React 10.6.1 types/composition, shadcn CLI 4.5.0.

**Approved spec:** `docs/superpowers/specs/2026-10-07-autocomplete-design.md`.

## Discovery Evidence

- Branch is `main...origin/main`; only the new autocomplete spec was untracked before plan authoring. No implementation branch has been selected and no component code changed.
- Read all three `.agent/` frontend/component/distribution standards.
- Inspected `registry/new-york/select.tsx`, `input.tsx`, `button.stories.tsx`, installed Base UI autocomplete/combobox root declarations and `combobox/index.parts.d.ts`. Base UI exposes Chips/Chip/ChipRemove publicly; its autocomplete `mode` is unrelated to Vandor's selection discriminator.
- No existing autocomplete/combobox registry component was found.
- Inspected `components/select-playground.tsx`, `components/component-playground.tsx`, `components/component-documentation.tsx`, `lib/select-playground.ts`, `lib/component-docs.ts`, `content/docs/components/select.mdx`, `content/docs/components/meta.json`, and `registry.json`.
- Playground shell already remounts its preview on Reset and supports an `onReset` callback; do not rewrite it to introduce autocomplete.
- Inspected `tests/select.test.cjs`, `select-input.test.cjs`, `select.types.tsx`, `button-stories.test.cjs`, `tooltip-distribution.test.cjs`, `data-grid-generated-types.test.cjs`, and `data-grid-ui-fixture.cjs`. Test files use jiti with automatic JSX, DOM setup before React DOM import, bounded primitive assertions, and cleanup.
- `tsconfig.json` includes all `.ts`/`.tsx` including compile-time test fixtures. Its reference to `scripts/build-registry.mts` does not imply that file exists; no `scripts/` directory currently exists. Do not invent or depend on that script.
- Confirmed package scripts: `pnpm typecheck`, `pnpm check`, `pnpm registry:build`, `pnpm build` (runs registry build then Next build), and Node tests. `pnpm exec shadcn add --help` confirms local artifact arguments, `--cwd`, `--yes`, `--dry-run`, and overwrite options.
- CI `.github/workflows/ci.yml` discovers `tests/*.test.cjs`, runs serial tests with a 512 MiB inherited heap and timeout, and already builds/typechecks. Normal new root-level test files need no discovery change.
- `components.json` uses `base-nova`, Tailwind CSS variables, RSC, and `@/components/ui`; generated items must also install under nondefault aliases.
- `next.config.mjs` does not specify bounded build workers. Resolve supported Next build worker limits in Task 9 rather than silently running unconstrained workers.
- No primary server URL is known. No Storybook server exists. Browser panel is available; do not start any server or substitute Playwright.
- Baseline test/typecheck/build results have not been collected. Existing failures must be separated from regressions, never silently fixed outside scope.
- Earliest uncertainties: public tag/chip compatibility and inferred root types (Task 1); exact compound adapter behavior (Task 2); native form validation/reset (Task 4); CLI rewriting and isolated Next build worker setup (Task 8); repository-wide build worker control (Task 9).

## Verification Architecture

| Requirement                                                        | Lowest-cost meaningful evidence                                               | Real boundary                                               |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Four value types, generic inference, rejected combinations         | `tests/autocomplete.types.tsx` through native tsc                             | Public TSX imports, no broad cast fixtures                  |
| Value/query separation, tags/IME/chips, blur/Escape, refs/handlers | Focused Node + Happy DOM mounted public component tests                       | Real React + Base UI, not a fake root implementation        |
| Form submission/required/reset                                     | FormData + mounted form tests; validation behavior browser check              | Native form associated with public control                  |
| Visual states/motion/mobile                                        | OpenChamber browser inspection at agreed server                               | Actual website/playground, DOM assertions do not replace it |
| Generated-code/preview parity                                      | Typed config adapter + real control/Reset tests + generated TSX compilation   | Generated code imports public component                     |
| Stories                                                            | Actual Storybook types and `composeStories` representative rendering/behavior | Portable relative imports; no Storybook UI claim            |
| Artifact correctness                                               | Manifest/source/artifact regression tests                                     | Generated JSON, not only repository source                  |
| Consumer installation/RSC                                          | Real CLI installs + isolated compilation/Next client import                   | Installed files, declared dependencies, nondefault UI alias |
| Integrated delivery                                                | Fresh sequential tests/typecheck/check/build and full-spec audit              | Repository integration and primary browser                  |

Use TDD for meaningful state, normalization, event, form, and generation regressions. Styling/copy/metadata use type/render/format/distribution checks rather than manufactured unit tests. Unit fakes may control requests in examples but cannot substitute for real Base UI, CLI installation, or browser evidence.

## Global Constraints

- `mode="free-text"` by default; `mode="selection"` for constrained selection.
- `multiple` is supported in both modes, not just selection.
- Free-text values are `string` / `string[]`; selection values are `Item | null` / `Item[]`.
- Selection callbacks return original items rather than IDs.
- Free-text tags commit on Enter, not blur or comma. Paste is not split into tags.
- Static labels are default; default field height 36px, compact 32px.
- `clearable` defaults false; `autoHighlight` defaults false; `animated` defaults true.
- `showTrigger` defaults true for selection, false for free-text.
- `getItemValue` returns a stable string ID for object items; readonly item collections accepted.
- `value` is committed application value; separate draft/query is forbidden on free-text single.
- Top-level ref targets editable input; `className` targets field container; input/popup props have explicit ownership.
- Selection single restores committed label on blur/Escape; selection multiple discards draft; free-text multiple retains draft on dismissal.
- Error, loading, empty, populated status precedence; loading/error suppress stale suggestion commits, not free-text creation.
- Multiple form values use repeated same-name entries; empty singles submit `""`; drafts never submit.
- Use public Base UI APIs only, preserve refs/handlers and cancellation where supported, and add client directives.
- No unrelated internal UI redesigns, virtualization, comma delimiters, paste splitting, automatic selection-object creation, or fetching ownership inside the component.
- Stories required, installation optional; no Storybook packages in ordinary installation and no component reinstallation from stories-only item.
- No branch creation/switching, component implementation, commits, merge, push, worktree, or delegation until the applicable user workflow/branch choice. Plan approval does not authorize automatic merge/push.
- No additional/restarted servers or Playwright without explicit approval. Read `.agent/frontend-workflow.md` again before implementation/verification.
- Heavy checks run sequentially. Tests: inherited heap 512 MiB, `--test-concurrency=1`, focused file/pattern first, process-tree timeout. Other Node checks: explicit heap at most 2048 MiB, finite deadline, conservative workers. Stop on OOM/timeout; never increase limits automatically.

## File Structure and Ownership

All lists are **Scope lock: flexible**. Add only the smallest supporting file required for the approved outcome; record deviations. Do not change product architecture/scope without approval.

New distributable files:

- `registry/new-york/autocomplete-types.ts`: discriminated prop/value contracts and reusable part types.
- `registry/new-york/autocomplete-utils.ts`: pure string-tag normalization, stable item identity, and ordered grouping helpers.
- `registry/new-york/autocomplete-root.tsx`: client root adapter, typed public context/parts behavior, committed/draft state, Base UI bridge, form integration.
- `registry/new-york/autocomplete.tsx`: client styled parts, convenience assembly, public exports.
- `registry/new-york/autocomplete.stories.tsx`: portable CSF stories, relative public imports only.

Website files:

- `lib/autocomplete-playground.ts`: typed controls/defaults, shared preview configuration, complete code generator.
- `components/autocomplete-playground.tsx`: shared shell adapter with explicit literal-mode branches.
- `examples/autocomplete-demo.tsx`: narrow gallery/default demo and four mode demos.
- `examples/autocomplete-advanced-demo.tsx`: grouping, rich items, compound composition.
- `examples/autocomplete-async-demo.tsx`: deterministic request/debounce/error cleanup.
- `examples/autocomplete-form-demo.tsx`: native/controlled form submission, required/reset.
- `content/docs/components/autocomplete.mdx`: contract, examples, behavior, consumer/setup/credits guidance.
- Modify `registry.json`, `lib/component-docs.ts`, `components/component-documentation.tsx`, `content/docs/components/meta.json`; inspect discovery via `tests/home-component-gallery.test.cjs` and existing gallery implementation before assuming additional registrations.
- Generate `public/r/autocomplete.json`, `public/r/autocomplete-stories.json` using existing build.

Tests/consumer evidence:

- `tests/autocomplete.types.tsx`, `autocomplete-utils.test.cjs`, `autocomplete-runtime.test.cjs`, `autocomplete-ui-fixture.cjs`, `autocomplete-parts.test.cjs`, `autocomplete-form.test.cjs`.
- `tests/autocomplete-playground.test.cjs`, `autocomplete-generated-types.test.cjs`, `autocomplete-examples.test.cjs`, `autocomplete-stories.test.cjs`, `autocomplete-distribution.test.cjs`.
- `tests/fixtures/autocomplete-consumer/`: minimal package/config/consumer entry templates and deterministic CLI-check driver, no committed `node_modules` or build outputs. Driver provisions owned fixtures under `/tmp/opencode` and uses only installed artifacts/dependencies.
- `docs/superpowers/plans/2026-10-07-autocomplete-evidence.md`: durable execution ledger with commands, results, deviations, browser evidence, and limitations.

## Execution Batches

### Batch 1: Prove four-mode contracts and primitive feasibility

- Goal: Establish an inferable public API and public-primitive route for tags before committing to runtime architecture.
- Tasks: 1 (one-task batch because generic inference/tag feasibility is high-risk).
- Depends on: Approved plan, execution mode, and branch choice.
- Acceptance gate: Type fixtures and pure helper tests PASS; bounded public-primitive chip/tag probe supports approved behavior. If public primitives cannot meet the contract without private APIs, return replan evidence rather than weaken it.
- External gates: None.
- Verification impact: Establishes baseline contract; later source changes invalidate type/helper/probe evidence.

### Batch 2: Deliver real component behavior and field polish

- Goal: Same public value/query/form/interaction behavior in convenience and compound APIs.
- Tasks: 2-4.
- Depends on: Batch 1.
- Acceptance gate: Focused runtime/parts/form suites and typecheck PASS with real Base UI; visual gate deferred to Batch 5.
- External gates: None; browser evidence is not required to implement local runtime/styling.
- Verification impact: Changes to types/utils/root require rerunning Batch 1 checks; styling/refs/handlers require runtime and parts reruns.

### Batch 3: Deliver coherent playground, examples, docs, stories

- Goal: All documented configurations run and generated code matches preview; stories remain portable.
- Tasks: 5-7.
- Depends on: Batch 2.
- Acceptance gate: Playground parity/Reset/generated type tests, example/MDX integration, story composition and typecheck PASS. Missing browser URL does not block local authoring.
- External gates: None.
- Verification impact: Any component fixes rerun affected Batch 1/2 evidence; generated code, docs, stories changes invalidate their own tests.

### Batch 4: Prove generated installation boundaries

- Goal: Artifacts install in an independent consumer with nondefault aliases and an RSC boundary; stories do not overwrite customized component.
- Tasks: 8 (one-task batch because distribution/CLI/RSC boundary is complex).
- Depends on: Batch 3.
- Acceptance gate: Registry parity, real CLI installation, isolated compilation, stories checksum preservation, and isolated Next boundary check PASS.
- External gates: `GATE-CONSUMER`, detailed below. Local artifact validation/driver authoring remain runnable when network is blocked.
- Verification impact: Manifest, distributable files, dependencies, aliases, or stories changes invalidate consumer/artifact evidence.

### Batch 5: Integrated acceptance and full-plan audit (Final)

- Goal: Verify the complete approved specification and report exactly what evidence exists.
- Tasks: 9.
- Depends on: Batches 1-4 passing their gates.
- Acceptance gate: Fresh sequential integrated commands, resolved consumer gate, required browser matrix, and full-spec checklist PASS. Only this batch owns repository-wide integrated acceptance/full-plan audit.
- External gates: `GATE-BROWSER`; unresolved `GATE-CONSUMER` cannot be counted as acceptance.
- Verification impact: Any repair invalidates checks touching its changed files; rerun relevant local checks and all affected final boundaries before acceptance.

### External gate ledger

| ID            | Blocked scope                                                                                                    | Evidence source                                                               | Owner/dependency                                                   | Exact resolution                                                                                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GATE-CONSUMER | Task 8 CLI/dependency installation and RSC consumer checks, final installability claim; not local artifact tests | shadcn/pnpm exit results, consumer tsc/Next output, installed paths/checksums | Package network/cache availability; executor owns isolated fixture | Actual CLI resolves artifacts/support files with nondefault aliases; declared packages install; consumer compile/RSC check pass; stories preserve source checksum |
| GATE-BROWSER  | Task 9 visual/native-browser acceptance only; no earlier local work                                              | OpenChamber snapshots, inspect/capture, exercised interactions                | User supplies reachable primary dev-server URL                     | Changed playground/docs/examples inspect correctly desktop/mobile, light/dark and relevant native interaction matrix; no console error attributable to change     |

Record each gate as PASS/FAIL/BLOCKED/SKIPPED with reason and blocked scope. Only PASS closes acceptance. Storybook UI not verified is the repository-approved limitation, not a substitute PASS or a new external gate.

## Command Recipes

Commands run from this checkout unless a fixture `cwd` is specified. No heavy invocations concurrently.

```sh
# First focused behavior check, then widen pattern/file selection only after safe execution.
NODE_OPTIONS="--max-old-space-size=512" timeout --signal=TERM --kill-after=5s 120s node --test --test-concurrency=1 --test-name-pattern='tag normalization' tests/autocomplete-utils.test.cjs

# Focused runtime example; choose exact test names added by the task.
NODE_OPTIONS="--max-old-space-size=512" timeout --signal=TERM --kill-after=5s 120s node --test --test-concurrency=1 --test-name-pattern='selection restores' tests/autocomplete-runtime.test.cjs

NODE_OPTIONS="--max-old-space-size=2048" timeout --signal=TERM --kill-after=5s 300s pnpm typecheck
NODE_OPTIONS="--max-old-space-size=1024" timeout --signal=TERM --kill-after=5s 180s pnpm check
NODE_OPTIONS="--max-old-space-size=1024" timeout --signal=TERM --kill-after=5s 180s pnpm registry:build

# Expand from focused files only after they have run safely.
NODE_OPTIONS="--max-old-space-size=512" timeout --signal=TERM --kill-after=5s 900s node --test --test-concurrency=1 tests/*.test.cjs
```

For child compiler/CLI commands use `spawnSync('timeout', [...])`, inherited explicit budget, deadline/kill grace, bounded `maxBuffer`, and primitive diagnostics following `tests/data-grid-generated-types.test.cjs`. No unchecked bare Node tests. Confirm compiler worker controls before production/Next fixture builds; heap flags do not cap total RAM.

## Task 1: Typed contracts, helpers, and public primitive feasibility

**Files:** Create types/utils, `tests/autocomplete.types.tsx`, `tests/autocomplete-utils.test.cjs`; initial bounded feasibility test in `tests/autocomplete-runtime.test.cjs`; record probe in evidence ledger.

**Interfaces:** Consume public Base UI exports/declarations. Produce exported `AutocompleteProps<Item>`, `AutocompleteRootProps<Item>` sharing the four-way discriminator, `AutocompleteValue<Item, Mode, Multiple>`, and pure `normalizeAutocompleteTag(draft: string, values: readonly string[]): string | null`. `items` stays readonly; root accepts children, convenience does not. Export the confirmed part contracts through the eventual public entry.

**Blocked by:** Workflow/branch approval only.

**Acceptance evidence:** Native tsc infers string/item/array values with no consumer casts, rejects duplicate free-text single query state and wrong shape values, requires object accessors. Bounded probe mounts public primitive chips/tag flow without private imports. Source/type/helper changes invalidate evidence.

- [ ] Read public input/chip/item/root declarations and implementation-supported public semantics; compare tagging approaches. Probe free-text multiple using public combobox string values plus independent draft, handling created values in the adapter; confirm chip focus behavior. Do not reuse unsupported autocomplete chips.
- [ ] Add type fixtures for all four literal combinations and readonly object items. Representative contract:

```tsx
type User = { id: string; name: string };
const users: readonly User[] = [{ id: "ada", name: "Ada" }];
export const inferred = (
  <Autocomplete
    mode="selection"
    multiple
    items={users}
    getItemLabel={(item) => item.name}
    getItemValue={(item) => item.id}
    onValueChange={(next) => {
      const selected: User[] = next;
      return selected;
    }}
  />
);
// @ts-expect-error Multiple free-text requires string[], not string.
export const invalidTags = (
  <Autocomplete multiple items={["React"]} value="React" />
);
// @ts-expect-error Free-text single has one text source of truth.
export const conflictingQuery = (
  <Autocomplete items={["React"]} inputValue="R" />
);
```

- [ ] Add failing normalization tests before implementation:

```js
test("tag normalization trims and rejects empty or exact duplicates", () => {
  assert.equal(normalizeAutocompleteTag("  React  ", []), "React");
  assert.equal(normalizeAutocompleteTag("   ", []), null);
  assert.equal(normalizeAutocompleteTag("React", ["React"]), null);
  assert.equal(normalizeAutocompleteTag("react", ["React"]), "react");
  assert.equal(normalizeAutocompleteTag("a,b", []), "a,b");
});
```

- [ ] Run focused helper test to establish red, implement helpers and discriminated interfaces, rerun to green. Stable-ID equality must compare accessor strings; ordered grouping must drop empty filtered groups without sorting.
- [ ] Export types through the initial public entry/root while adding the smallest public-primitive mount needed for compilation/probe. Run native typecheck and one focused bounded probe; record which primitive backs each mode and any caveat. Do not claim runtime complete from a type stub.

## Task 2: Root adapter and actual mode transitions

**Files:** Create/complete `autocomplete-root.tsx`, `tests/autocomplete-ui-fixture.cjs`, `tests/autocomplete-runtime.test.cjs`; connect `autocomplete.tsx` exports.

**Interfaces:** Consume Task 1 props/normalization/identity. Produce `AutocompleteRoot` and shared internal adapter state consumed by styled parts: mode, multiple, committed value, input text, label/ID accessors, selected-ID lookup, status gating, commit/remove/clear requests. Expose named parts using this same root, not an unrelated second root with inconsistent props.

**Blocked by:** Task 1 typed/public-primitive feasibility. **Acceptance:** Real React/Base UI behavior tests for all four combinations plus compound smoke test; typecheck. Root/state/primitive changes invalidate these checks.

- [ ] Create fixture with DOM globals before React DOM imports; mount real public components under `React.act`. Provide helpers for input/key/blur/pointer events and small snapshots; unmount roots and abort Happy DOM in teardown even on failures. Do not assert connected DOM objects directly.
- [ ] Write focused failing tests: typing free-text single emits string; selection query does not emit value; choosing item returns original object; selection restores committed label on blur/Escape; selected item survives async results removal/new same-ID objects; arrays never mutate supplied defaults.
- [ ] Run one focused red test, then implement controlled/uncontrolled value/query transitions using supported public primitives. Avoid `mode` collision and preserve ID equality. Rerun relevant patterns before expanding.
- [ ] Add actual tag/chip tests: Enter without highlight trims/appends, with highlight chooses suggestion, duplicate/empty no callback, IME Enter ignored, comma/paste unbroken, free-text draft survives blur, selection multiple rejects arbitrary draft and discards it on blur, successful append clears draft and retains popup.
- [ ] Add error/loading tests: stale option click/Enter cannot commit; query/free-text creation still works; error takes priority and loading never shows empty. `filter={null}` renders supplied server result without refiltering. Implement status gating and rerun.
- [ ] Exercise `AutocompleteRoot` with public Input/Content/List/Item and multiple chips against the same cases. Root adapter cannot be considered done while only convenience API works.

## Task 3: Styled parts, convenience assembly, and accessible actions

**Files:** Complete `registry/new-york/autocomplete.tsx`, relevant part types, `tests/autocomplete-parts.test.cjs`, runtime keyboard tests.

**Interfaces:** Consume Task 2 adapter. Produce `Autocomplete` and all named parts in the approved spec; `renderItem`, `groupBy`, disabled-item support, typed input/content props, and refs. Consumers import only public entry; supporting imports are relative distributable imports.

**Blocked by:** Task 2 root/part interface. **Acceptance:** Named parts and convenience mounting/typechecking; labels, ownership, refs/handler cancellation, chip focus/removal, disabled/read-only tests. Styling visual gate deferred. Parts/adapter/styles changes invalidate parts and final visual evidence.

- [ ] Read `impeccable` and applicable `shadcn` technology guidance at implementation time; preserve repository standards over conflicting defaults. Reuse established Input/Select token treatment without changing website-only primitives or dragging in unrelated registry items.
- [ ] Add failing label/ref/handler tests. Compose top-level/input refs, label association, `aria-describedby`, cancellation and native handlers; prove `className` is on container and input attrs remain on input. Exclude managed-state props from `inputProps` and children/state conflicts from `contentProps`.
- [ ] Assemble shared static/floating field, grouped list, status, clear, trigger and wrapping chips. Foundation example styles:

```tsx
const fieldBase =
  "min-w-0 rounded-md border border-input text-sm text-foreground";
const popupBase =
  "max-h-(--available-height) min-w-(--anchor-width) overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md";
// Merge with cn; extend these with sibling focus/invalid/disabled surface classes.
// Anchor action positioning to the editable-control wrapper, not the label wrapper.
```

- [ ] Add failing Backspace/Remove/focus tests; first Backspace on empty draft focuses last chip, subsequent deletion removes and focuses prior chip/input. Read-only blocks all commits/remove/clear and disabled blocks interaction. Support accessible per-action labels and hidden decorative icons.
- [ ] Implement restrained popup Motion reveal/exit with reduced-motion and interrupted transitions. Keep portal explicit placement/layering consistent with working Select pattern; cap scroll height and preserve input width on mobile/long labels.
- [ ] Rerun parts/runtime patterns and typecheck; inspect pending visual checklist rather than claiming appearance from classes.

## Task 4: Native form semantics, validation, and reset

**Files:** Root/form integration; `tests/autocomplete-form.test.cjs`; extend type fixtures as required.

**Interfaces:** Consume committed values/accessors from Task 2 and input ownership from Task 3. Produce native `name`/`form` serialization and required/reset behavior, without serializing query drafts or duplicating names on visible and hidden inputs.

**Blocked by:** Tasks 2-3 for real input/refs/state. **Acceptance:** Mounted FormData/reset tests and native browser validation deferred to final gate. Changes to input/hidden fields/state/reset invalidate all form evidence.

- [ ] Write failing FormData tests for all combinations, disabled exclusion, read-only submission, external form ownership, empty singles and empty multiples. Exact sample expectations:

```js
assert.deepEqual(new FormData(form).getAll("tags"), ["React", "Vue"]);
assert.deepEqual(new FormData(form).getAll("assignees"), ["ada", "bea"]);
assert.equal(new FormData(form).get("assignee"), "ada");
```

- [ ] Implement explicit form values: string or stable ID, repeated same-name entries for multiple. Suppress native query serialization where it would submit a draft/duplicate field. Required validity must reflect committed value, not typed search.
- [ ] Add failing native reset tests and controlled owner-reset example fixture: defaults restored, popup/highlight cleared, correct draft and label state, controlled callbacks not secretly overriding props. Guard reset listener cleanup.
- [ ] Test Enter handling does not submit when selecting/creating a tag; unhighlighted free-text single Enter retains native form semantics. Add required-selection tests with a nonempty query/no selection; record limitations of Happy DOM validity and verify later in browser.
- [ ] Rerun focused form suite and typecheck; update runtime tests if form ownership changes invalidate query behavior.

## Task 5: Typed playground and reproducible code

**Files:** Create `lib/autocomplete-playground.ts`, `components/autocomplete-playground.tsx`, `tests/autocomplete-playground.test.cjs`, `tests/autocomplete-generated-types.test.cjs`; modify docs renderer and docs definitions.

**Interfaces:** Produce `autocompleteProps`, `getAutocompleteDefaults()`, `AutocompletePlaygroundValues`, `getAutocompleteCode(values): string`, and shared `getAutocompletePreviewConfig(values)` returning discriminated literal-mode component props. Website preview and generator use the same defaults/scenario configuration, not unrelated data sets.

**Blocked by:** Tasks 1-4. **Acceptance:** Every exposed control changes preview and code; real Reset restores configuration and transient values; generated code typechecks. Changes to generator/config/preview/public props invalidate evidence.

- [ ] Define controls for mode, multiple, label/style, placeholder, size, disabled/read-only/invalid, clearability, trigger, grouping, animation and status. Scenario should distinguish ready/loading/error/empty, and generated snippet must reproduce it.
- [ ] Add failing tests for default config, each nondefault control, compatible combinations, and safe quoted/newline/JSX text serialization. Provide explicit mode branches instead of casting broad booleans into narrow props.
- [ ] Implement complete client demo generator including imports/items/accessors/state/types as needed. Draft/interactive value changes need not serialize; state that code reproduces configuration, not a live value snapshot. Generator pattern:

```ts
const labelProp = `label={${JSON.stringify(values.label)}}`;
// Generate a complete literal-mode branch with matching string/object value type.
// Do not interpolate label/placeholder as unescaped JSX attribute text.
```

- [ ] Mount actual shared playground shell. Change controls, select/add values, enter draft, click Reset, and assert default controls/empty transient state/current code. Use existing preview remount rather than new global reset mechanisms.
- [ ] Compile generated TSX for all four modes, scenarios and representative nondefault controls through bounded compiler child following existing generated-types test. Alias public import to intended source for repository checks; Task 8 separately compiles installed output.
- [ ] Register `AutocompletePlayground` in `components/component-documentation.tsx` and metadata in `lib/component-docs.ts`; run focused parity/generated checks/typecheck.

## Task 6: Runnable examples, docs, navigation and gallery

**Files:** Create four example files, autocomplete MDX, `tests/autocomplete-examples.test.cjs`; modify docs metadata and existing discovery tests only as needed.

**Interfaces:** Export `AutocompleteDemo`, `AutocompleteFreeTextMultipleDemo`, `AutocompleteSelectionDemo`, `AutocompleteSelectionMultipleDemo`, `AutocompleteAdvancedDemo`, `AutocompleteAsyncDemo`, `AutocompleteFormDemo` from their responsible files. MDX imports match these exports; all runnable examples use `ComponentPreview` with correct source/title.

**Blocked by:** Tasks 1-4 for API; Task 5 only for playground integration, not example authoring. **Acceptance:** Native typecheck, example rendering/behavior checks, discovery/MDX integration, truthful consumer docs. Public API or example changes invalidate these checks.

- [ ] Implement four mode demos with visible value feedback and simple narrow gallery default. Grouped/rich composition uses stable IDs, consistent label search and accessibly named controls.
- [ ] Implement deterministic async demo: debounce 300ms, clear pending timer, abort/ignore stale responses, predictable `error` query, cleanup on unmount, `filter={null}`, committed value retained when results change. Test that older response cannot replace newer results; no random failure/latency claims.
- [ ] Implement form demo with repeated entries output, selection `required`, uncontrolled reset and explicit controlled owner reset. Show draft vs committed value, invalid help, read-only vs disabled without unrelated form-library dependencies.
- [ ] Write MDX Usage and behavior sections for each mode/empty representation, callbacks and prop ownership, object accessors/equality, query restoration, tags/IME/keyboard, status/async ownership, form/reset, composition, styling prerequisites and limitations. Use shared generated Installation/Props/Source, not duplicates.
- [ ] Add separate stories install/setup guidance, exact Storybook type version tested, relative discovery pattern, consumer CSS/theme inheritance and prerequisite component install. Explain whether manual copying requires supporting files; credits distinguish reference from adapted code and preserve any copied license.
- [ ] Add `autocomplete` to component docs metadata and inspect existing home gallery discovery implementation via test imports. Verify matching default demo export and navigation without modifying unrelated gallery architecture. Run example/discovery/documentation tests sequentially and typecheck.

## Task 7: Portable stories and representative compositions

**Files:** `registry/new-york/autocomplete.stories.tsx`, `tests/autocomplete-stories.test.cjs`.

**Interfaces:** Typed `Meta`/`StoryObj`, title `Vandor UI/Autocomplete`, public relative imports only. Stories cover Playground, free-text tags, single/multiple selection, grouping/rich items, states, controlled value/query, floating label, long content, and advanced composition.

**Blocked by:** Tasks 1-4; examples not required and must not be imported. **Acceptance:** Actual Storybook typecheck and `composeStories` rendering/meaningful args behavior; ordinary component remains independent of stories packages. Story source/props changes invalidate story evidence.

- [ ] Write self-contained story data and state. Keep Playground controls consistent with literal-mode branches, suppress nonserializable accessor/render/callback controls, and disable controls intentionally fixed by each scenario.
- [ ] Preserve consumer styling/decorators rather than importing site globals/providers. Fixed error/loading demonstrations do not pretend to perform network requests.
- [ ] Add real composition test pattern:

```js
const { composeStories } = await import("@storybook/react");
const stories = composeStories(
  jiti("../registry/new-york/autocomplete.stories.tsx")
);
assert.equal(typeof stories.Playground, "function");
const html = renderToStaticMarkup(
  stories.Playground({ label: "Framework", disabled: true })
);
assert.match(html, /Framework/);
assert.match(html, /disabled=""/);
```

- [ ] Mount representative multiple/controlled stories where state behavior matters; verify args actually affect public control, not only exported story existence. Run focused story tests and actual typecheck.

## Task 8: Registry artifacts and real isolated consumer installation

**Files:** Modify `registry.json`; generate public artifacts; create `tests/autocomplete-distribution.test.cjs`, `tests/fixtures/autocomplete-consumer/` templates/driver; update installation guidance if evidence requires it.

**Interfaces:** `autocomplete` installs public entry and every support file under consumer UI aliases; `autocomplete-stories` contains only stories. Dependencies declare public Base UI/motion floors plus `cn` and used icons, no website aliases or Storybook runtime on ordinary item.

**Blocked by:** Batches 1-3 sources/stories/docs. Network blocks only real install/consumer evidence, not manifest/parity/fixture work. **Acceptance:** Artifact parity + CLI install + isolated tsc/RSC check + customized-file checksum preservation, not merely repository imports. Distribution/source/dependency edits invalidate all affected artifact/consumer evidence.

- [ ] Register all four distributable modules together, relative imports targeting colocated installed support files; no fixed `components/ui` target. Stories use separate `registry:item`/`registry:ui` file and no component registry dependencies or package install/upgrade.
- [ ] Run bounded registry build, inspect affected and unrelated generated diffs. Add parity tests comparing file metadata/content and dependency graph, client directives, license preservation, no private/website imports, stories isolation.
- [ ] Create fixture driver under permanent test fixtures, materializing an owned directory via `mkdtempSync('/tmp/opencode/autocomplete-consumer-')`. Minimal consumer has its own `package.json`, TS config, Tailwind CSS tokens/setup, `components.json` with `@/shared/ui`, and all declared dependencies. No repository `@/*` fallthrough or node_modules symlink. Test driver cleanup removes only its owned path.
- [ ] Driver invokes existing CLI binary using local artifact path, avoiding another registry server:

```js
const command = [
  "--signal=TERM",
  "--kill-after=5s",
  "180s",
  process.execPath,
  cliEntry,
  "add",
  artifactPath,
  "--cwd",
  fixtureDirectory,
  "--yes",
];
// Resolve cliEntry from the installed shadcn package bin declaration, not a guessed file.
// spawnSync('timeout', command, { env: boundedEnv, encoding: 'utf8', maxBuffer: 16000 });
```

Confirm local artifact support-file installation and alias rewriting. Install dependency versions using fixture package manager with bounded subprocesses; record network/cache failure as GATE-CONSUMER BLOCKED, never skip-as-pass. Do not retry a timed-out process blindly.

- [ ] Compile four mode usage and generated demos against installed aliases/dependencies only. Add a consumer Next Server Component page that imports installed client module; run an isolated Next production compile with confirmed supported one-worker configuration and bounded memory/deadline, no server. Consumer CSS/style obligations remain documented; don't claim consumer visual inspection from compile alone.
- [ ] Hash customized installed public entry before stories installation. Install local stories artifact, assert entry/support checksums unchanged and story lands beside public entry; consumer Storybook packages are predeclared compatible fixture prerequisites, not dependencies of stories item. Typecheck stories in isolated consumer.
- [ ] Keep artifact regression checks in root Node tests for CI. Add a deterministic opt-in consumer driver command `node tests/fixtures/autocomplete-consumer/verify.cjs` and CI step only after ensuring provisioning/deadlines/output are bounded and network prerequisite explicit; real consumer boundary must run in CI, not remain unexecuted fixture code.
- [ ] Rerun affected docs/types/stories after packaging fixes, record installed paths/versions/commands and exact consumer evidence. No automatic server launch or package upgrades in user's checkout.

## Task 9: Browser QA, sequential integrated gates and full-spec audit

**Files:** Evidence ledger and narrowly scoped repairs to owned files; no unrelated baseline cleanups.

**Interfaces:** Consume all previous artifacts/behavior/docs evidence. Produce PASS/BLOCKED/FAIL evidence with full approved-spec checklist, truthful delivery handoff, and current branch/dirty state.

**Blocked by:** Earlier batch acceptance; GATE-BROWSER only blocks visual acceptance. **Acceptance:** Complete fresh final integrated evidence, all material boundaries exercised. Any repair invalidates the matching source/test/artifact/browser checks and triggers rerun.

- [ ] Ask for primary dev-server URL if not already provided; verify reachability in OpenChamber. Do not guess port/start server. Snapshot actual docs/playground and gallery; use returned selectors, inspect computed styles/capture for visual ambiguities. Stop and report after two failed tool attempts at same interaction.
- [ ] Exercise all four modes, compound example, custom/grouped disabled items, query/selection separation, tag Enter/IME behavior where browser tool can establish it, chip removal/focus, Escape/blur, clear, async status/error, native required/submit/reset, refs/focus demo, long values and scroll/collisions. If browser tooling cannot establish an essential native behavior, disclose missing evidence and ask permission for a focused additional check, never silently switch tools.
- [ ] Inspect desktop/mobile and light/dark, static/floating labels, wrapped chips/long descriptions, reduced motion, loading/error/empty. Exercise every playground control plus combinations, Reset and Copy; compare preview and generated code. Record screenshots only in gitignored `.openchamber/` if needed.
- [ ] Confirm supported bounded Next build worker setting against installed Next public config/types. Prefer transient environment-supported control; if this requires config change, obtain approval for that smallest verification-only adjustment. Do not run unbounded workers or alter user's active server. Use `NODE_OPTIONS="--max-old-space-size=2048" timeout --signal=TERM --kill-after=5s 600s pnpm build` only after worker preflight passes. A blocked worker configuration is reported, not worked around by higher memory.
- [ ] Run focused affected tests first; then integrated Node suite, native typecheck, formatting/lint and production build sequentially using recipes. If build updates generated types/artifacts, rerun impacted type/parity checks. Do not repeatedly rebuild for minor visual iterations.
- [ ] Run real consumer driver serially and confirm CI invokes durable checks. Production/CLI/browser failures are not closed by mock tests. Separate baseline unrelated failures from regressions with bounded read-only comparison; do not revert user's files to establish baseline.
- [ ] Audit spec section by section: four types, accessors/identity, grouping/filter/rendering, prop/ref ownership, keyboard/IME/chips, state/status, all form contracts, motion/theme/mobile, docs/playground/examples/stories, installation/client boundary/licenses and CI. Record requirement → exact evidence, no unexecuted assertions or vague completion claims.
- [ ] Inspect git diff for unrelated files, generated churn and missing support targets; update evidence ledger with gate statuses, no-storybook-UI limitation and primary server intentionally left running. State “Storybook UI not verified: this project has no Storybook server”. If required visual/distribution evidence is unavailable, report partial verification/BLOCKED rather than fully complete.
- [ ] After successful verification offer leaving work on selected branch or merging into user-selected target; do not merge/push/delete branch automatically. Report source/target/dirty/ahead-behind/conflicts before any separately approved merge.

## Plan Self-Review

- All approved spec requirements map to Tasks 1-9; four-mode values/queries in 1-2, styled/accessibility/compound in 2-3, native forms in 4, preview/code/reset in 5, runnable examples/docs/discovery in 6, portable stories in 7, registry/CLI/RSC in 8, visual/integrated audit in 9.
- Every task assigned once; high-risk contracts and distribution have dedicated one-task batches; normal implementation/documentation batches have three tasks each; only Batch 5 owns repository-wide acceptance.
- Missing browser/network evidence gates only relevant boundaries, never unrelated local tasks. FAIL/BLOCKED/SKIPPED cannot masquerade as PASS.
- Pure helper normalization signatures and public mode naming agree across tasks; supporting files are declared as distributable, not hidden site-only dependencies.
- Consumer templates/driver paths are explicitly new; existing command paths are observed; cliEntry/build worker controls require earliest relevant discovery, not guesses.
- No baseline checks are claimed; Storybook UI absence is explicit; no appearance claim from DOM markup; real CLI/installed-file and browser boundaries retained.

## Approval and Execution Choice

Ask the user to approve this written plan before execution. After approval offer exactly: Execute inline, Mars, Janus, Mercury, Jupiter. Then ask current branch/local main/new branch unless already chosen. For a new branch confirm full `alfarizi/feat/autocomplete` name and user-selected base before creating it. Do not move/discard the uncommitted spec/plan to satisfy branch choice. Orchestrated choices follow the configured planned-execution workflow; inline stays in this session without subagents/worktree.
