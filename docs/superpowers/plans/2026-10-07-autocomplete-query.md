# Autocomplete Query and Feature Families Implementation Plan

> **For agentic workers:** Follow the execution mode selected at approval. Orchestrated modes use `/home/alfarizi/.config/opencode/workflows/planned-execution.md`. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship optional typed Query hooks and accessible infinite pagination for Autocomplete, with compact feedback using `Loading`, and verified out-of-UI family installation for Autocomplete and DataGrid.

**Architecture:** Core Autocomplete accepts agnostic search/pagination state and shares feedback/footer parts between convenience and compound compositions. Two optional hooks own debounced search/open and map real TanStack Query results into literal-mode bindings; selections and tags remain application-owned. Family entry modules separate UI, optional Query and server-safe schema, with actual CLI installation as the packaging boundary.

**Tech Stack:** Existing React 19.2.5, Base UI ^1.8.0, TanStack Query ^5.104.1, Table 9.2.6, TypeScript 6.0.3, Next 16.2.4, Tailwind 4.2.4, Motion ^12.38.0, cn, Zod ^4.3.6, shadcn 4.5.0, Node/Happy DOM/jiti, Storybook React 10.6.1 types/composition.

**Approved spec:** `docs/superpowers/specs/2026-10-07-autocomplete-query-design.md`.

## Discovery Evidence

### Approved installation amendment

User approved the amendment after commit `2dbe922` proved stock shadcn 4.5.0
flattens nested families with divergent directory basenames. Use a thin wrapper
to resolve consumer components aliases through TypeScript configuration and
prepare local artifacts with explicit cwd-relative family targets. Invoke stock
CLI; preserve its reviewed overwrite prompts, optional entries, primitive targets,
and fully local generated dependency closure. No private CLI APIs or default-only
alias restriction. Tasks 1, 6-8 additionally own wrapper resolution, safety, and
actual CLI matrix verification. Existing batch dependencies and acceptance gates
remain in force; approval does not turn failed probe evidence into PASS.

- Branch observed `main...origin/main`; only the new Query spec untracked before this plan. No implementation branch/execution profile chosen. Existing component implementation is committed user work, not ours to revert.
- Inspected `.agent/frontend-workflow.md`, `.agent/component-implementation.md`, `.agent/registry-distribution.md`, package scripts, registry graph and existing autocomplete/DataGrid source.
- Current `AutocompleteProps`/`AutocompleteRootProps` are four-way discriminated unions in `registry/new-york/autocomplete-types.ts`. Single free text forbids inputValue; remaining modes have inputValue callbacks. Root resolves object IDs, preserves committed values, and treats `loading || error` as blocking suggestion state.
- `registry/new-york/autocomplete.tsx` provides scrolling `AutocompleteList`, compact text Empty/Status and a convenience composition hiding results under initial loading/error. No pagination contract exists.
- `registry/new-york/loading.tsx` exports variant-discriminated `LoadingProps`. `Loading` registry installs its full catalog and licenses, explicitly approved. Do not swap it for `loading-arc.tsx` or depend on ErrorState/Empty for autocomplete feedback.
- `registry.json` currently registers autocomplete/DataGrid as UI files. DataGrid includes relative imports to shared primitives and `error-state-base.tsx`; schema-only item is separate and must remain Zod/server-only. Do not move shared primitives accidentally with the family.
- `registry/new-york/use-data-grid.ts` already consumes a native query-options factory. `tests/data-grid-controller.test.cjs` warns about matching provider/hook CJS export condition in jiti tests; preserve that pattern.
- Existing test helper: `tests/autocomplete-ui-fixture.cjs` installs DOM globals before React DOM, wraps actions in act, uses cleanup. Existing suites include autocomplete behavior/form/parts/runtime/types/playground/generated/story/distribution and extensive DataGrid tests.
- Existing consumer driver: `tests/fixtures/autocomplete-consumer/verify.cjs` invokes real CLI, tsc, bounded one-worker Next webpack build and stories checksum preservation. It assumes flat `@/shared/ui/autocomplete` and must change. It provisions templates, installs declared packages, never symlinks repository modules, and removes only owned /tmp/opencode fixture.
- Existing CI `.github/workflows/ci.yml` runs consumer driver separately and discovers root `tests/*.test.cjs` with bounded serial tests. Preserve real boundary execution in CI rather than adding skipped tests as evidence.
- Confirmed scripts: `pnpm registry:build`, `pnpm typecheck`, `pnpm check`, `pnpm build` (registry then Next), and Node tests. `next.config.mjs` supports `VANDOR_BOUNDED_BUILD=1` -> experimental cpus:1; CI also uses RAYON_NUM_THREADS=1.
- Read shadcn public declarations and bounded excerpts of installed CLI target resolution. `registry:component` routes to components alias; explicit targets are cwd/src-relative, and no-target path trimming depends on consumer directory basename. Neither source reading nor type enum proves alias-aware nested family layout. Task 1 must probe actual CLI rather than assuming target placeholders or registry internals are usable production APIs.
- Primary server URL unknown. No Storybook server. No baseline tests/type/build run for this planning task. Missing baseline results are not existing failures or claimed successes.

## Verification Architecture

| Contract                                            | Evidence                                               | Real boundary                                                     |
| --------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------- |
| Hook inference/four bindings/select/pages/skipToken | Public TSX fixtures + tsc                              | Native public Query options and original component types          |
| Debounce/eligibility/races/cancellation             | Mounted hook + QueryClient tests                       | Real Query observer/cache/React, deterministic queryFn only       |
| Scroll/footer/retry/retained options                | Mounted Autocomplete and real hooks                    | Actual Base UI DOM + Query, browser later verifies geometry/focus |
| Core Loading/compact states                         | Component tests, portable story composition, browser   | Existing public Loading component, not custom spinner             |
| Family paths/optional entry/schema/stories          | Real CLI + isolated compile/Next boundary/checksums    | Consumer files and declared deps, no source alias fallthrough     |
| Preview/code/reset/docs                             | Actual shell control tests + generated code compile    | Typed adapter and rendered public component                       |
| DataGrid no behavior change                         | Existing DataGrid suites/types plus installed consumer | Existing runtime invariants and new family entry                  |
| Full acceptance                                     | Fresh sequential integrated gates and browser matrix   | Final batch only owns full-spec audit                             |

Test branching/state/normalization/integration behavior with focused red-green cycles. Docs/exports/path/style changes normally use native compilation, source/artifact checks, existing regression suites and browser inspection; do not add low-value tests merely for ceremony. Unit mocks cannot replace real Query, CLI installation or browser evidence.

## Global Constraints

- `mode` defaults `free-text`; `multiple` defaults false; preserve all four original value contracts.
- `debounceMs` defaults 300 and `minSearchLength` defaults 0.
- Automatic fetch requires open popup, minimum length, settled debounce, hook enable gate and application Query enabled semantics.
- Keep committed selection/tags outside hooks; free-text single search is its value and binds value/onValueChange.
- Infinite `getItems` consumes selected page data; dedupe by stable string ID, first-seen order/item, no cached-page mutation.
- Auto + accessible Load more; explicit Retry after next-page error; never drain pages on mount merely to fill viewport.
- `Loading` and its full registry graph are required and accepted; no replacement spinner/LoadingArc; no ErrorState/Empty dependency for autocomplete.
- Query import optional; UI index must not runtime-import or re-export Query hooks. Query provider is consumer-owned.
- Default directories `components/autocomplete/`, `components/data-grid/`; both public index.ts; DataGrid schema separate server-safe entry.
- Consumer components/UI aliases can differ; stories colocated in family, optional and checksummed, not overwriting component.
- DataGrid change limited to packaging/exports/imports/docs/stories/checks; no runtime redesign or new API semantics.
- No automatic old consumer file deletion, unrelated primitive moves, virtualization or backend endpoints.
- No implementation until plan/execution/branch gates; no automatic commit/merge/push/worktree/subagents.
- Heavy checks sequential; inherited test heap 512MiB, serial workers, focused file/pattern first, process-tree deadline/5s kill grace. Other Node budgets at most 2048MiB, bounded workers/deadlines. No DOM graph assertion output or unsafe OOM/timeout retries.
- Browser-first at user-approved primary URL; no port guessing/server restart/start/Playwright. Storybook UI absent is accepted limitation, not visual proof.

## File Structure and Ownership

Scope lock: flexible throughout. Record smallest supporting-file deviations; product/API/installation requirements are not flexible. Source may remain flat in registry until Task 1 proves installation representation; expected flat source entry names below are explicit new files, not a claim of CLI target support.

**Core:** modify `registry/new-york/autocomplete-types.ts`, `autocomplete-root.tsx`, `autocomplete.tsx`; create `autocomplete-feedback.tsx`, `autocomplete-pagination.tsx`, `autocomplete-index.ts` (UI barrel).

**Query:** create `registry/new-york/autocomplete-query-types.ts`, `autocomplete-query-state.ts`, `use-autocomplete-query-state.ts`, `use-autocomplete-query.ts`, `use-autocomplete-infinite-query.ts`, `autocomplete-query.ts` (optional barrel). Separate pure state/policy from React hooks and UI.

**DataGrid entries:** create `registry/new-york/data-grid-index.ts`, `data-grid-schema-entry.ts`; preserve existing modules/public symbols and update shared imports only where installation layout requires it. If CLI-proof needs source families, move only explicitly owned modules and rewrite repository tests/imports; do not duplicate two independently maintained implementations.

**Packaging:** `registry.json`, generated affected `public/r/`, narrow family exception in `.agent/registry-distribution.md`, existing `tests/autocomplete-distribution.test.cjs`, `tests/data-grid-distribution.test.cjs`, and consumer driver/templates. Add `tests/fixtures/component-families/probe.cjs`/README for deterministic alias/entry proof; fixture-created package/config/artifact files remain under owned /tmp/opencode directory. No new preview server.

**New checks:** `tests/autocomplete-query.types.tsx`, `autocomplete-query-state.test.cjs`, `autocomplete-query.test.cjs`, `autocomplete-infinite-query.test.cjs`, `autocomplete-pagination.test.cjs`, `autocomplete-feedback.test.cjs`. Extend existing autocomplete UI fixture for provider/scroll as needed; keep timers/Query clients cleaned up.

**Surfaces:** `lib/autocomplete-playground.ts`, `components/autocomplete-playground.tsx`, `lib/component-docs.ts`, `content/docs/components/autocomplete.mdx`, new `examples/autocomplete-query-demo.tsx`, `examples/autocomplete-infinite-demo.tsx`, core stories. DataGrid generator/MDX/examples/stories adopt installed public family/schema imports; discover exact usage files with scoped grep before edits, not blanket global replace. Update generated-code fixture aliases and consumer checks.

**Ledger:** create `docs/superpowers/plans/2026-10-07-autocomplete-query-evidence.md` for proof/results/deviations and requirement coverage.

## Execution Batches

### Batch 1: Establish public contracts and bounded family proof

- Goal: Confirm native Query typing and an installation strategy without coding against guessed nested-target semantics.
- Tasks: 1 (high-risk proof task).
- Depends on: Approved plan, chosen execution mode and branch.
- Acceptance gate: Public API/type probe PASS; CLI source/path analysis and executable isolated dry-run/install strategy recorded. Definitive alias proof is owned by Batch 4 and may be deferred on network limitations; no migration is claimed here.
- External gates: `GATE-CLI-PROBE` blocks path-specific migration, not core/Query local work.
- Verification impact: Later interface changes invalidate typing proof; CLI/config changes invalidate path proof.

### Batch 2: Deliver agnostic feedback and pagination

- Goal: Core supports compact states, public Loading and safe accessible pagination independent of Query.
- Tasks: 2-4.
- Depends on: Task 1 public interface proof, not external network.
- Acceptance gate: Focused feedback/pagination/legacy regression tests and typecheck PASS; browser deferred.
- External gates: None.
- Verification impact: Root/status/keyboard changes invalidate old behavior/form/IME tests; loading imports invalidate dependency/consumer evidence.

### Batch 3: Deliver real typed Query hooks

- Goal: Both hooks preserve four-mode bindings, eligibility and real Query lifecycle including infinite retries/races.
- Tasks: 5 (large/high-risk hook integration task, one-task batch).
- Depends on: Batches 1 public contracts and 2 agnostic interface.
- Acceptance gate: Native type fixtures plus real QueryClient mounted tests PASS for ordinary/infinite queries and controlled/uncontrolled ownership.
- External gates: None; query functions are deterministic test services, no external backend required.
- Verification impact: Binding/type/query/eligibility changes invalidate legacy core and Query tests; footer mapping invalidates pagination tests.

### Batch 4: Install both families through real boundaries

- Goal: Autocomplete optional Query + DataGrid/schema/stories install outside UI and compile under real default/nondefault aliases.
- Tasks: 6-8.
- Depends on: Batches 1-3; Task 6 target mutation requires resolved GATE-CLI-PROBE.
- Acceptance gate: Generated graph/CLI/isolated compile and Next/schema/no-Query boundaries PASS; customized story checksums preserved.
- External gates: `GATE-CLI-PROBE`, `GATE-CONSUMER`. Offline entry/graph analysis and fixture authoring do not wait for network. A CLI capability failure is replan-required, not resolved by hardcoding broken aliases.
- Verification impact: Imports/targets/barrels/dependency/source moves invalidate all affected previous type/runtime/source/artifact checks.

### Batch 5: Publish playground, examples, docs and portable stories

- Goal: New contracts/installation paths are accurately discoverable and reproducible.
- Tasks: 9-11.
- Depends on: Local core/hooks ready and family export contract confirmed. External consumer checks do not prevent independent documentation/example authoring, but this batch cannot override Batch 4 gate failure.
- Acceptance gate: Typed examples, generated code/parity/Reset and portable story composition PASS, migrations/defaults documented.
- External gates: None; visual deferred to final.
- Verification impact: Source repairs rerun respective earlier suites; entry/code/story changes invalidate installed compilation and docs evidence.

### Batch 6: Integrated acceptance and full-plan audit (Final)

- Goal: Every approved material requirement has fresh evidence and installation/visual limitations are explicit.
- Tasks: 12.
- Depends on: All earlier acceptance gates.
- Acceptance gate: Fresh bounded sequential integrated checks, resolved consumer and browser gates, complete full-spec audit PASS.
- External gates: `GATE-BROWSER`, unresolved consumer/probe gates remain blockers.
- Verification impact: Any final repair invalidates matching prior checks and affected integrated boundaries. Exactly this batch owns repository-wide gate/full-plan audit.

### Gate ledger

| ID             | Blocked scope                                                              | Evidence/owner                                                                                | Exact resolution                                                                                                                                                                                             |
| -------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GATE-CLI-PROBE | Targets/source moves/family migration acceptance, not local feedback/hooks | Real installed shadcn CLI in owned fixtures; executor, package cache/network when needed      | Nested family UI/Query/schema/story files and imports resolve with default + divergent components/UI aliases. If unsupported, return smallest design amendment for user approval; no silent alias limitation |
| GATE-CONSUMER  | Batch 4 installed graph/type/Next claims and final gate                    | Consumer driver exits/checksums/packages; executor + network/cache                            | Both families/default/nondefault layouts pass independent installs/types, Query-free UI, schema-only server, RSC and story preservation                                                                      |
| GATE-BROWSER   | Final visual/native scroll/focus/form gate only                            | OpenChamber actual snapshots/interactions/capture; user supplies reachable primary server URL | Required browser matrix exercised without change-caused console errors; no alternate unapproved automation                                                                                                   |

Use PASS/FAIL/BLOCKED/SKIPPED distinctly; only PASS closes acceptance. Independent local tasks may proceed with deferred network evidence; orchestrated batch advancement must still respect blocked statuses. Record baseline unrelated failures separately; don't delete or rewrite them to manufacture green.

## Verification Commands

```sh
# Start with one test name/file; only expand after safe execution.
NODE_OPTIONS="--max-old-space-size=512" timeout --signal=TERM --kill-after=5s 120s node --test --test-concurrency=1 --test-name-pattern='eligibility' tests/autocomplete-query-state.test.cjs
NODE_OPTIONS="--max-old-space-size=512" timeout --signal=TERM --kill-after=5s 120s node --test --test-concurrency=1 --test-name-pattern='next page' tests/autocomplete-infinite-query.test.cjs

NODE_OPTIONS="--max-old-space-size=2048" timeout --signal=TERM --kill-after=5s 300s pnpm typecheck
NODE_OPTIONS="--max-old-space-size=1024" timeout --signal=TERM --kill-after=5s 180s pnpm registry:build
NODE_OPTIONS="--max-old-space-size=1024" timeout --signal=TERM --kill-after=5s 180s pnpm check

# Existing driver, expanded in Task 8; do not run before provisioning is ready.
NODE_OPTIONS="--max-old-space-size=512" timeout --signal=TERM --kill-after=5s 1200s node tests/fixtures/autocomplete-consumer/verify.cjs

# Final suite after focused checks, not an initial diagnostic.
NODE_OPTIONS="--max-old-space-size=512" timeout --signal=TERM --kill-after=5s 900s node --test --test-concurrency=1 tests/*.test.cjs
VANDOR_BOUNDED_BUILD=1 RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1 NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS="--max-old-space-size=2048" timeout --signal=TERM --kill-after=5s 600s pnpm build
```

Consumer/query child invocations have explicit inherited heap/deadlines/kill grace and bounded output; entire driver deadline is not permission to run children concurrently. No bare pnpm test, giant DOM snapshots or automatic increased memory. Network/OOM/timeouts are reported and diagnosed with smaller read-only evidence, not blindly retried.

## Task 1: Public Query binding contracts and CLI feasibility proof

**Files:** Create `autocomplete-query-types.ts`, `tests/autocomplete-query.types.tsx` preliminary compile probes, permanent `tests/fixtures/component-families/probe.cjs`/README and evidence ledger. No migration of existing public source yet.

**Interfaces:** Produce typed common search/open state options and `AutocompleteQueryBinding<Item, Mode, Multiple>` keyed by original mode/multiple. Root UI types remain canonical. Decide public native query factory generic signatures through installed Query declarations rather than internal exports. Produce recorded family file types/targets/rewrite strategy or an explicit replan-required capability result.

**Dependencies:** Workflow/branch gate only. External CLI evidence blocks migration, not Tasks 2-5. **Evidence invalidated by:** options/bindings/CLI version or alias rules changes.

- [ ] Inspect installed public `queryOptions`, `infiniteQueryOptions`, `useQuery`, `useInfiniteQuery`, `skipToken`, enabled callback and select types using targeted glob/read. Verify handling tagged query keys and optional initialData without erasing data/error/page inference.
- [ ] Add compile-only native probes with this representative selected-page expectation:

```tsx
const options = infiniteQueryOptions({
  queryKey: ["people", "a"] as const,
  initialPageParam: null as string | null,
  queryFn: async ({ pageParam, signal }) => ({
    users: [{ id: "a", name: "Ada" }],
    next: pageParam,
    aborted: signal.aborted,
  }),
  getNextPageParam: (page) => page.next ?? undefined,
});
// Hook fixture added in Task 5 must infer getItems page, item, cursor and callback types.
```

- [ ] Establish exact additional UI contracts for dependent work:

```ts
export interface AutocompletePaginationProps {
  hasNextPage: boolean;
  fetchingNextPage: boolean;
  error?: ReactNode;
  disabled?: boolean;
  automatic?: boolean; // true by default
  onLoadMore: () => void | Promise<unknown>;
  onRetry?: () => void | Promise<unknown>;
  loadMoreLabel?: string;
  retryLabel?: string;
  loadingMessage?: ReactNode;
}
// Core owns a pagination?: AutocompletePaginationProps prop, LoadingProps-typed
// loadingProps, compact feedback state, initial retry, and background indicator.
```

Import ReactNode/LoadingProps from their real public modules. Exclude ref/controlled conflicts from composed props. Discriminated hook props omit value callbacks for selection/tags and omit inputValue for single free text.

- [ ] Build disposable minimal local artifacts/configs in the probe for families/index, optional query, schema and stories. Invoke real CLI `add --dry-run` then actual installation, including aliases `@/components` + `@/components/ui` and `@/shared` + `@/primitives`, and a src layout. Use predeclared cached dependencies first; record any network requirement rather than assume the local file means no network. Capture actual paths/import rewrites with bounded output.
- [ ] Prove nested layout/alias import rewriting, not only registry schema validation. If stock CLI cannot support approved aliases/families, stop path-specific implementation and propose smallest verified alternative to user; do not invent target interpolation, import private CLI internals into production, hardcode default components directory, or silently flatten index.ts files. Keep core/hook work independent.
- [ ] Run focused compile/probe checks sequentially, ledger exact commands/paths/capability and deferred evidence. No full repository integrated gate here.

## Task 2: Compact search feedback using public Loading

**Files:** Core types/root/assembly; create `autocomplete-feedback.tsx`, `tests/autocomplete-feedback.test.cjs`; extend existing types/stories later.

**Interfaces:** Consume Task 1 types. Produce `AutocompleteFeedback` compound part, `loadingProps` based on public LoadingProps, a compact hint/search/initial-error/empty state contract and initial retry callback. Preserve legacy loading/error semantics while adding nonblocking background state; never conflate it with next-page state.

**Dependencies:** Task 1 contracts, not CLI/network. **Acceptance:** Focused real component feedback tests, original type/runtime tests. **Invalidated by:** feedback/root/Loading import/status precedence changes.

- [ ] Add failing tests for below-minimum hint vs empty, debounce search blocking old options, initial Loading rendering, initial error/retry and nonblocking same-search background refresh. Verify chosen Loading variant actual data-variant and passed size/variantProps.
- [ ] Render existing `Loading` default arc at compact 16px with customizable props; do not implement another spinner. Use inline compact text/action layout, existing tokens and one coherent live announcement. No nested duplicate status messages or ErrorState/Empty imports.
- [ ] Implement state mapping in core adapter and convenience composition while compound feedback uses same adapter. Retry is type=button, does not submit/select, and respects disabled/read-only/eligibility callback gate.
- [ ] Add long/custom loading/error content tests and native accessibility-name association primitives. Run one focused red-green test then widen to old autocomplete form/behavior suites proportionally; typecheck actual LoadingProps unions.

## Task 3: Agnostic pagination footer and scroll guard

**Files:** Create `autocomplete-pagination.tsx`, `tests/autocomplete-pagination.test.cjs`; modify core types/adapter/List/assembly.

**Interfaces:** Consume `pagination?: AutocompletePaginationProps`. Produce public `AutocompletePagination` compound footer plus convenience placement sharing adapter. Scroll viewport belongs to List, footer actions outside selectable option roles. Default automatic true, Load more when more available, Retry on page error.

**Dependencies:** Task 1 pagination contract and Task 2 shared Loading/feedback. **Acceptance:** Mounted core + actual DOM scroll/focus/action tests; geometry browser later. **Invalidated by:** List dimensions/events/root/action/loading code.

- [ ] Write failing cases using real mounted List and bounded scalar geometry descriptors: user scroll near bottom calls once; mount/short list does not auto-drain; hasNextPage false/closed/disabled/read-only/loading/error prevents auto-call; non-bottom scroll no call. Do not spy on a replacement fake List.
- [ ] Implement list-specific onScroll composition, near-end threshold (48px default internal constant), in-flight lock and eligibility guard. Preserve caller onScroll/preventDefault; avoid document-level observers. Promise completion releases lock but render/completion alone must not trigger next page.
- [ ] Implement footer with Load more/Retry button and `Loading`, page error latches automatic action off, successful explicit retry/query reset can re-enable. Preserve list options during page load/error and existing scroll/highlight/focus relationships.
- [ ] Add keyboard footer tests with focused input/Tab/button activation, no form submission or accidental option selection. Keep loading button present/focus-stable where possible; don't remove a focused action without a predictable target.
- [ ] Rerun focused pagination tests, typecheck and root/parts behavior cases. Assert option labels/IDs and boolean identity, not DOM objects.

## Task 4: Protect original core ownership and reset invariants

**Files:** Existing `tests/autocomplete-behavior.test.cjs`, `autocomplete-form.test.cjs`, `autocomplete-parts.test.cjs`, `autocomplete.types.tsx`, UI fixture; smallest core fixes required by new state.

**Interfaces:** Consume new feedback/pagination; preserve all original public modes, form/ref/handler/IME/chip contracts. No new selected-value ownership in pagination or feedback.

**Dependencies:** Tasks 2-3. **Acceptance:** Existing suites plus new actual combination regressions PASS. **Invalidated by:** state/props/focus/field changes.

- [ ] Add focused regression sequence: selected object retained, query changed, old options blocked, new items appended, page fails, retry invoked, selection still valid and FormData still contains stable ID. Multi tags keep Enter/IME/reset rules while pagination actions never commit draft.
- [ ] Test four-mode controlled/uncontrolled components and compound Root with new feedback/footer; native reset restores owned defaults without retaining a false page-loading interaction lock.
- [ ] Preserve refs/events, static/floating labels and label restoration. Native external form reset and read-only cannot begin pagination. Small implementation repairs must rerun the failing case and its neighboring old tests.
- [ ] Run focused old suites sequentially, typecheck, ledger compatibility boundary. Styling-only differences wait for final browser, not new irrelevant tests.

## Task 5: Ordinary and infinite Query hooks with real QueryClient

**Files:** Create Query state/types/hooks/barrel and pure/mounted tests; update `tests/autocomplete-query.types.tsx`; extend fixture for QueryClientProvider without breaking core-only tests.

**Interfaces:** `useAutocompleteQuery` consumes native factory + getItems; `useAutocompleteInfiniteQuery` consumes infinite factory + per-page getItems/getItemValue. Both return `{ query, search, setSearch, open, setOpen, autocompleteProps }`; infinite adds `pagination` matching Task 1. Public common options `search/defaultSearch/onSearchChange`, `open/defaultOpen/onOpenChange`, `enabled`, debounceMs/minSearchLength, and safe `formatError(error)` return displayable messages. Output literals mode/multiple are preserved.

**Dependencies:** Tasks 1-4 contracts/runtime. **Acceptance:** Native inference + real QueryClient integration; fake queryFn controls network only. **Invalidated by:** shared search/enabled/data mapping/hooks/types/footer changes.

- [ ] Write pure eligibility/dedup tests first with explicit snapshots:

```js
test("eligibility rejects closed, debounce and insufficient search", () => {
  assert.equal(
    isAutocompleteQueryEligible({
      open: false,
      search: "ada",
      debouncedSearch: "ada",
      minSearchLength: 2,
      enabled: true,
    }),
    false
  );
  assert.equal(
    isAutocompleteQueryEligible({
      open: true,
      search: "ada",
      debouncedSearch: "ad",
      minSearchLength: 2,
      enabled: true,
    }),
    false
  );
  assert.equal(
    isAutocompleteQueryEligible({
      open: true,
      search: "a",
      debouncedSearch: "a",
      minSearchLength: 2,
      enabled: true,
    }),
    false
  );
});
```

Define/export this exact pure helper in query-state. Invalid timing/length inputs throw a bounded RangeError at configuration validation; zero delay/minimum supported. Dedup helper `dedupeAutocompleteItems(items, getItemValue)` returns first-seen fresh array and doesn't mutate inputs.

- [ ] Create shared client search/open hook with controlled authority, timer cleanup and debounce; expose raw/debounced state and eligibility. Minimum hint not loading-empty. Setters do not fabricate selected-value callbacks. Honor initial defaults without a forever pending ineligible UI.
- [ ] Add mounted ordinary hook red tests using actual provider with same Query export condition as jiti, retry false test client and deterministic promises. Assert no requests closed/too-short/unsettled/false-enabled/skipToken; function-enabled receives actual Query object semantics. Eligible raw changes settle once; no manual Retry bypass disabled gate.
- [ ] Implement ordinary factory invocation using debounced search; combine native enabled function without evaluating it against a fake Query. Respect skipToken. Map `isPending` vs actively fetching, placeholder stale-search data, same-key refetch background state, safe formatted error and guarded retry. UI loading/error excludes page-specific status.
- [ ] Add four literal-mode inference fixtures, object items, select-transformed ordinary results, infinite selected page shape, string/null cursor, tagged query keys, initialData/skipToken, controlled search. Reject wrong scalar/array/value callbacks and illegal free-text single inputValue. Use actual source imports not type casts to force inference.
- [ ] Implement infinite hook flattening selected pages/dedup, initial vs background vs isFetchingNextPage/error status, guarded fetchNextPage with concurrency policy compatible with Query refetch, error retry latch and key-generation safety. Preserve native query result for advanced consumers.
- [ ] Add real integration tests: query A resolves after B; no mixed A results; previous-key placeholder not selectable; same-search cached data remains; aborted signal observed by queryFn; selected object absent from pages retained; next page contains duplicate ID (first wins), fails, auto trigger suppressed, explicit retry succeeds, no same-tick duplicate load, no fetch during background refetch/closed/disabled.
- [ ] Mount public Autocomplete with actual autocompleteProps in all four modes and a compound Root/footer case. Hook binding restoration after selection blur/reset must not leave displayed labels diverging from committed values. Free-text single controlled search is actual submitted value; multi tags remain application-owned.
- [ ] Run focused patterns red-green, expand ordinary/infinite suites only once safe, and native typecheck. Cleanup Query clients/cache/timers/deferred requests and DOM even on assertion failure.

## Task 6: Autocomplete family manifest and optional Query boundary

**Files:** New UI/Query entries, registry core/Query/stories items, existing support imports, distribution tests, narrow `.agent/registry-distribution.md` family convention; generate artifacts.

**Interfaces:** UI index exports existing Autocomplete public UI/types plus feedback/pagination only. Query entry exports hooks/types only; neither core nor core stories requires Query. Family paths follow Task 1 proven strategy with consumer alias handling.

**Dependencies:** Tasks 1-5; target mutation blocked by GATE-CLI-PROBE only. **Acceptance:** Graph/parity/types + actual default/nondefault installation evidence from Task 8. **Invalidated by:** source/manifest/alias/barrel/dependency changes.

- [ ] Explicitly record approved family-stories exception to primitive no-target convention in distribution guide; primitives retain existing policy. Don't treat family moving as authorization to rewrite all registry targets.
- [ ] Build UI barrel using explicit exports from current modules, no runtime Query import. Optional barrel imports two hooks relatively. Provide client boundaries on hook/UI modules; ordinary server page can import client component while schema stays separate.
- [ ] Manifest adds full Loading registry dependency and optional Query item pinned to tested API version floor; any shared action primitive declared accurately. Verify no ErrorState/Empty and no omitted Loading CSS/license/support targets. Consumer customized dependencies require reviewed overwrite prompts, not forced overwrite.
- [ ] Register all supporting family files with proven file types/targets. Stories-only installs contain only colocated stories, no core dependencies or Storybook forced upgrade. Core registry name stays autocomplete, optional autocomplete-query, stable stories name.
- [ ] Generate via bounded registry:build; add manifest/file/content/dependency/entry isolation tests. Replace old flat-file count/no-target assertions with actual approved family contracts, not broad removal of checks. No handwritten public/r edits.

## Task 7: DataGrid/schema family migration without runtime redesign

**Files:** New `data-grid-index.ts`, `data-grid-schema-entry.ts`, registry DataGrid/schema/stories items, affected relative dependency imports, existing DataGrid distribution/types/generated-fixture tests. Discover docs/usage changes for Task 10.

**Interfaces:** Default import `@/components/data-grid`; server-only contract import `@/components/data-grid/schema`. Index exports existing UI/columns/controller symbols; schema-only item supplies schema entry/modules, compatible full item uses same target/content. Core schema must not indirectly import React/Query/Table.

**Dependencies:** Task 1 proven migration strategy; independent of autocomplete hook source aside from shared convention. **Acceptance:** DataGrid existing types/runtime regressions plus Task 8 CLI/server-schema/consumer evidence. **Invalidated by:** imports/entries/target/shared support changes.

- [ ] Enumerate actual public exports across DataGrid UI/columns/state/controller/schema before barrel creation; preserve names and intended server boundary. Explicit export example:

```ts
// data-grid-schema-entry.ts: re-export only actual existing schema symbols/types.
export * from "./data-grid-schema";
// UI barrel may export actual data-grid, data-grid-columns and use-data-grid;
// do not export server schema through a hook-containing barrel for server usage.
```

- [ ] Move only DataGrid-owned installation targets to family; keep Button/Checkbox/Select/Dropdown/InputSearch and error foundation dependencies at actual shared locations. Update installed cross-directory imports using supported CLI rewriting proven in Task 1. Never duplicate differing error-state-base targets.
- [ ] Update schema-only/stories manifests and compatible target graph. Server schema installation cannot pull whole grid; stories cannot reinstall it. Keep normal dependencies/version floors unchanged except changes justified by actual packaging boundary.
- [ ] Regenerate artifacts and strengthen target/conflict/cycle/source tests. Run focused DataGrid controller/render/selection/state/schema/columns types tests proportionally, source-entry typecheck and generated snippet compile. No UI behavior edits disguised as import fixes.

## Task 8: Real consumer family matrix and CI

**Files:** Expand `tests/fixtures/autocomplete-consumer/verify.cjs` and templates/README; Task 1 probe fixtures; CI existing driver step. Add permanent fixture cases for DataGrid/schema/optional Query and graph tests as necessary.

**Interfaces:** Driver consumes generated artifacts/declared dependencies only, creates owned /tmp/opencode fixture(s), actual CLI and isolated compiler/Next build, outputs separate PASS/FAIL/BLOCKED per case. Repo runtime imports or node_modules symlinks cannot supply missing consumer files.

**Dependencies:** Tasks 6-7 generated graph. Network failure blocks consumer gate but not local fixture authoring. **Acceptance:** Both families/default and divergent aliases/src, Query-free UI, schema-only server, installed Query/generated usage, independent stories checksums and client boundaries. **Invalidated by:** imports/manifests/artifacts/dependencies/fixture alias/layout.

- [ ] Replace driver's flat shared/ui assumptions with actual components family roots and distinct primitive alias. Add a default layout case and nondefault `@/shared` components vs `@/primitives` UI case, plus src; don't simply replace string imports while keeping hidden repository path fallthrough.
- [ ] Resolve local artifact dependency closure for not-yet-published URLs. Real CLI must consume locally generated supporting items; don't accidentally install deployed older registry versions. Reuse approved no-server path/config support proved in Task 1; if requires serving artifacts, ask user before server and record deferred scope, not silently launch it.
- [ ] Provision standalone minimal dependencies with pnpm network/child concurrency 1 and bounded deadlines. One consumer contains core Loading graph but **no TanStack Query**; another schema-only consumer contains Zod without React/Table/Query. Actual compile/module checks must prove both absent graphs, not a text grep alone.
- [ ] Full optional Query consumer typechecks four mode bindings/native options, installed docs/generated examples, own QueryClientProvider, Next Server Component import of UI and server schema entry. DataGrid consumer imports existing public UI/controller/columns using its actual dependencies; bounded Next RSC build, one worker.
- [ ] Customize installed core files for each family, hash all relevant modules, install stories-only items, prove every checksum preserved and story placed next to correct entry. Actual Storybook types compile. Query item normal dependency installation warns about core overwrite rather than promising it can never replace custom core.
- [ ] Assert no conflicting shared targets, missing Loading support/license, unwanted catalog for DataGrid beyond approved existing graph, Query accidentally in core, or React transitives in schema-only. Network timeout marks blocked evidence with scope, not SKIPPED PASS.
- [ ] Update existing CI driver step/name/deadline if measured bounded serial matrix needs it; root tests remain discovered. Do not silently exceed memory/deadline budgets. Record exact install/compile/build/checksum outputs, delete only owned fixtures.

## Task 9: Playground scenarios and executable Query examples

**Files:** Playground lib/adapter/tests/generated compile fixtures; new ordinary/infinite example files and deterministic service helpers inside examples if needed.

**Interfaces:** Preserve existing metadata/default/code exports; add hint/search/background/page-loading/page-error/more/end scenarios and LoadingProps customization using typed shared config. Generated snippets use installed family entry paths; provider-required Query examples explicitly include setup.

**Dependencies:** Tasks 2-5 core/hooks; entry signatures from 6. Missing network doesn't block authoring. **Acceptance:** Real preview/control/code/Reset parity, all four generated modes compile, actual hook example integration tests. **Invalidated by:** generator/config/examples/entries/types.

- [ ] Add failing parity tests for each new state/control including custom loading variant, page error Retry vs initial retry, automatic pagination toggle, hasNextPage, long labels and safely serialized messages. Preview and generated code must share configuration, not divergent handcrafted scenarios.
- [ ] Implement deterministic Query examples with consumer-owned provider/client and locally simulated cursor service accepting AbortSignal. Named exports `AutocompleteQueryDemo` and `AutocompleteInfiniteDemo` include controlled selected value, Query options factory, min search/debounce, explicit predictable initial/page failures and safe Retry. No random failures or hidden provider in core.
- [ ] Add ordinary free-text single binding and multiple selection/tag usage examples; show ownership through controlled search vs selected value, state feedback and customization using `loadingProps={{ variant: "dots", size: 16 }}`. Error/page state counts visible for demo diagnosis but not cluttered popup UI.
- [ ] Real Reset exercise clears configuration/transient input/selection/page scenario state, while documentation distinguishes mock playground pagination from actual API fetching examples. Query client cleanup prevents tests' retries/cache timers leaking.
- [ ] Compile complete generated TSX with family/index/query mappings, actual dependencies/options/types and quoted/newline inputs. Task 8 proves these paths against installed files independently. Run focused preview and generated checks/typecheck.

## Task 10: Docs, navigation and migration instructions

**Files:** Autocomplete MDX/docs definitions, DataGrid MDX/generator/examples import strings and schema guidance, docs navigation if optional integration page used, fixture README and distribution convention guidance.

**Interfaces:** Public documented imports match Task 6/7 UI/query/schema entries and Query provider prerequisites; registry names remain stable. Don't rewrite historical plans/specs or unrelated primitive docs.

**Dependencies:** Tasks 6-9 published interface/paths. **Acceptance:** Native types/generated snippets, docs renderer and processed Markdown/link/source checks. No new behavior unit tests for copy alone. **Invalidated by:** path/entry/renderer/install/version/content changes.

- [ ] Scoped grep finds every current autocomplete/DataGrid consumer import including generator/test consumer snippets; distinguish repository source imports from consumer examples before changing them. DataGrid schema/controller/column docs use correct public entry, server snippets avoid UI barrel.
- [ ] Document eligibility (`enabled`/skipToken/functions), query keys/search, debounce/minimum defaults, stale/placeholder/refetch behavior, AbortSignal and closed popup not guaranteed abort, custom error formatting, native query result escape hatch, committed ownership in all modes.
- [ ] Document initial vs page/background states, auto scroll plus button, no short-list drain, explicit next-page retry, safe/accessible compact messages, Loading component variants/full dependency graph. Infinite scroll is not virtualization.
- [ ] Installation uses correct family/core/optional Query/stories items, dependencies/manual source/support/CSS and existing provider setup. Explain core migration isn't automatic old-copy deletion; preserve customizations and reviewed overwrite prompts. Stories do not force Storybook install/upgrades.
- [ ] Update both rendered documentation and processed Markdown/LLM output if shared install/source generation needs changes for new family paths. Keep source lookup pointed at actual registry source, not consumer directory. Preserve gallery/default demo discovery and links.
- [ ] Run focused docs/discovery/native format checks and generated type fixtures, no redundant full build during wording iterations.

## Task 11: Portable core stories and UI coverage

**Files:** Existing `autocomplete.stories.tsx`, `data-grid.stories.tsx`, corresponding story tests and public imports.

**Interfaces:** Core Autocomplete stories Query-free; new agnostic hint/background/page-loading/page-error/loadmore/retry/loading-variant states. Colocated story imports use proven family entry; DataGrid stories keep runtime controls, only entry import adjustments. No site demos/styles/providers.

**Dependencies:** Core Task 2-4 plus family public entries; Query hook examples not required. **Acceptance:** Actual Meta/StoryObj + composeStories rendering/action tests, portable imported installed story compilation in Task 8 rerun if changed. **Invalidated by:** story/args/entry/parts changes.

- [ ] Add typed core stories with in-story local pagination data/callback state; controls change actual render, callback/render/accessor props non-editable. Disabled controls where mode/scenario fixed, no Query provider smuggled into ordinary installation.
- [ ] Compose actual stories, override label/loading variant/page flags and verify real output. Representative test:

```js
const { composeStories } = await import("@storybook/react");
const stories = composeStories(
  jiti("../registry/new-york/autocomplete.stories.tsx")
);
assert.equal(typeof stories.NextPageError, "function");
assert.match(
  renderToStaticMarkup(stories.NextPageLoading()),
  /data-slot="loading"/
);
```

- [ ] Mount page error/Retry/Load more stories for actual callback and retained option assertions, not just export existence. DataGrid stories compose against unchanged API and respect matching actual Storybook versions/global consumer CSS.
- [ ] Rerun story types/composition and consumer story path/checksum cases affected by imports. Report no Storybook UI server; do not start one.

## Task 12: Browser matrix and fresh integrated acceptance

**Files:** Evidence ledger, minimal owned fixes; no unrelated baseline cleanup.

**Interfaces:** Consume earlier evidence; deliver exact full-spec requirement-to-command/browser results plus branch/dirty status and limitations.

**Dependencies:** Earlier batch gates; browser URL only gates browser evidence. **Acceptance:** Fresh integrated checks and complete spec audit including both family real boundaries. **Invalidated by:** Every fix triggers relevant source/test/artifact/consumer/visual rerun.

- [ ] Ask user for primary URL if still unknown, open/snapshot actual autocomplete and DataGrid docs/gallery in OpenChamber. No guessed port, additional/restarted server, Playwright or server shutdown. After two failed same-target interactions inspect/report limitation.
- [ ] Browser test default compact loading/error/empty/hint, initial/page/background state differences, user near-bottom list scroll (not page scroll), short-list no auto-drain, Load more/Retry focus/keyboard/no submit, query change race, preserved selections/chips, footer while results selected. Inspect light/dark desktop/mobile, reduced motion, long content/Loading variants, overflow/collision.
- [ ] Exercise all playground controls/representative combinations, Reset and Copy, code/preview correspondence. Native form required/reset, static/floating labels and core keyboard regressions checked. DataGrid retains layout/pagination/select/filter behavior after import-only migration. Native requests/layout cannot be inferred from class snapshots.
- [ ] Run affected tests first; then full serial repository tests, registry build, native typecheck, check and bounded production build recipes sequentially. CI real consumer matrix executed sequentially and gate results reconciled. Generated/source changes after build require affected parity/type reruns.
- [ ] For real Query/CLI failures diagnose narrow case, do not pass with fake Query/mock CLI/materialized source-only consumer. Separate external blocked evidence and preexisting failures from implementation regressions.
- [ ] Full-spec audit lists every requirement and evidence: modes/types, state/cache/search/eligibility/select/infinite pages, core feedback/Loading, pagination/races/accessibility, original core/DataGrid regression, families/aliases/optional/no-Query/schema/RSC/stories, docs/examples/playground/CI and browser. No empty audit rows, missing gates or skip-as-pass.
- [ ] Inspect diff for unrelated changes/shared targets/generated churn/old files/customizations/licenses; ledger precise commands/versions/paths/checksums/browser captures/deviations. Screenshots only gitignored .openchamber, no private data staged. State “Storybook UI not verified: this project has no Storybook server”.
- [ ] Handoff only after gate evidence; if required URL/network/CLI capability unavailable, report BLOCKED/partial verified outcomes, not complete. Leave user's primary server untouched. Offer current branch or separately user-approved merge with source/target/dirty/ahead-behind/conflict report; never automatic push/merge/delete.

## Self-Review and Handoff Gate

- Spec maps to Tasks 1-12: native contracts 1/5, feedback 2, pagination 3, original invariants 4, Query 5, family core/optional 6, DataGrid/schema 7, real consumer/CI 8, preview/examples 9, docs/migration 10, stories 11, full audit/browser/integrated 12.
- Tasks assigned once: high-risk proof/hooks are one-task batches, normal core/family/surface batches three related tasks each, exactly one final full-plan gate.
- CLI capability/network uncertainty explicitly separated from independent core/hook/docs work; unsupported aliases return replan, no silent reduced scope or unexecuted PASS.
- Names/state/status and Loading types are consistent; early proof chooses native factory signatures and installation strategy before dependent code assumes them. Source entries are explicitly new paths; CLI/target mechanics not invented as production guarantees.
- Existing consumer driver/CI/build bounds confirmed; no new service/port/credential assumed. Baseline checks not claimed, Storybook UI absence explicit, browser and real CLI not replaced by DOM/source assertions.

Ask user to approve this written plan. After approval offer exactly Execute inline, Mars, Janus, Mercury, Jupiter unless user explicitly selects an alternative dispatch. Then branch gate: current branch/local main/new branch. Proposed new branch `alfarizi/feat/autocomplete-query-families` with user-approved base; preserve uncommitted spec/plan and unfamiliar work. No implementation while awaiting approval.
