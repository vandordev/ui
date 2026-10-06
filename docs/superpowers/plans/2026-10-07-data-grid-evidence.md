# DataGrid execution evidence

## Execution authorization

- User selected direct inline execution on current `main`, in the existing checkout.
- No Atlas, managers, subagents, Goal Mode, worktree, implementation commits, merges, or pushes.
- Initial tree was clean; `main` ahead of `origin/main` by two commits.
- Approved specification and complete 14-task / 7-batch plan read before implementation.
- Repository and ancestor instructions read, including all three `.agent` guides.

## Dependency/API observations

- npm public metadata: `@tanstack/react-table` stable 9.2.6, React peer `>=18`, Node `>=20`.
- Installed with `NODE_OPTIONS="--max-old-space-size=1024" timeout --signal=TERM --kill-after=5s 180s pnpm add @tanstack/react-table@9.2.6`, exit 0.
- Four packages added; existing Query/Zod retained. Two deprecated transitive packages reported by pnpm.
- Public declarations inspected: `useTable`, `createColumnHelper`, `tableFeatures`, `ReactTable`, `ColumnDef`, `CellContext`, feature registration and native Query options overloads.
- Manual sorting/pagination supported; omit processing factories. Core row model preserves remote order.
- UI context loader: PRODUCT.md valid, DESIGN.md absent. Product surface follows approved spec and existing theme tokens; image probes unnecessary for this scoped component integration.

## Task ledger

- [x] 1. Dependency API/inference proof — PASS
- [x] 2. Server-safe contracts and typed columns — PASS, codec amendment approved
- [x] 3. Atomic requests, draft validation, cursor history — pure-helper evidence PASS
- [x] 4. Selection membership/exclusions — pure-helper evidence PASS
- [x] 5. Query/Table controller — PASS local runtime/native type gate
- [x] 6. Native table primitives — PASS local composition/ref/override/type gate
- [x] 7. Typed controls and selection UI — PASS local real-control/type gate
- [x] 8. Localization and async feedback — PASS local feedback/override gate
- [x] 9. Runnable examples — PASS strict example compilation/service cases
- [ ] 10. Playground/code parity — adapter/control/generated types and selection/preferences/cursor Reset PASS; final sort/debounce/Copy/browser acceptance pending
- [x] 11. Documentation — generated sections and processed live Markdown installation guidance PASS; full integrated build remains Task 14
- [ ] 12. Portable stories — real types/composed page/cursor/controlled states PASS; packaging acceptance pending Task 13
- [ ] 13. Registry/consumer installation and safe CI
- [ ] 14. Final audit/integrated acceptance

## Batch gates

| Batch | Status      | Evidence                                                                                    |
| ----- | ----------- | ------------------------------------------------------------------------------------------- |
| 1     | PASS        | Native declarations, positive/negative spike, tRPC factory, mounted Query/Table smoke       |
| 2     | PASS        | Schema/column/pure-state/type checks; codec inverse policy approved and tested              |
| 3     | PASS | 20 mounted controller cases and native strict consumer compilation |
| 4     | PASS | 3 rendering + 5 real-control + 4 feedback cases; strict bindings/overrides; visual gate deferred |
| 5     | IN PROGRESS | Examples, adapter/control parity, generated types, docs assembly, composed stories; remaining gates below |
| 6     | NOT RUN     | Depends on Batch 5                                                                          |
| 7     | NOT RUN     | Depends on Batch 6                                                                          |

## External gates

- DG-DEPS: PASS, Table 9.2.6 verified.
- DG-CLI: not run.
- DG-BROWSER: primary server URL not yet requested; required at final browser gate.
- Storybook UI not verified: this project has no Storybook server.

## Batch 1 verification

- Disposable `/tmp/opencode/data-grid-spike.tsx` and `data-grid-spike-tsconfig.json`: `NODE_OPTIONS="--max-old-space-size=1024" timeout --signal=TERM --kill-after=5s 120s pnpm exec tsc -p /tmp/opencode/data-grid-spike-tsconfig.json`, exit 0. Includes real native declarations and experimental domain declarations (not distributable implementations).
- Wrong output must be checked after native factory inference. Directly constraining native `UseQueryOptions` output lets raw query data evade validation when `select` is absent. An inferred factory plus conditional call proof rejects it without consumer casts or extra props. Production must preserve this negative test.
- Heterogeneous native column values are invariant. Native `.columns` proves integration; production helper will close over accessor value types and normalize native definitions internally so consumers keep ordinary arrays.
- tRPC 11.19.0 installed only in `/tmp/opencode/data-grid-trpc`, with its actual peer Query 5.104.1, React 19.2.5 and TS 6.0.3. Its `createTRPCOptionsProxy` factory compiles against spike, including error-shape inference.
- `NODE_OPTIONS="--max-old-space-size=512" timeout --signal=TERM --kill-after=5s 120s node --test --test-concurrency=1 --test-name-pattern='native Table v9' tests/data-grid-integration.test.cjs`, exit 0, 1 pass, 0 skips. Query `select`, raw cache ownership, computed/display cells, stable IDs, backend order and no client pagination established.
- Earlier compilation failures were reduced fixture issues (absolute-directory imports ignored export maps; native value invariance; overly narrow Query contextual typing). No OOM/timeouts or memory escalation.
- Source state: initial docs commit plus dependency/lockfile changes and new evidence/smoke test. No implementation commit.

## Batch 2 local verification and narrow replan

- Production schema and column helpers implemented; ordinary consumer arrays compile without casts/repeated generics. Cell values and backend sort keys remain distinct.
- Pure transition helpers preserve normalized filters on sort/page/size transitions; filter input is parsed once. Validation returns field/form errors. Cursor helpers store only success-associated cursors, never rows. Selection helpers deduplicate IDs/exclusions and snapshot filters.
- `NODE_OPTIONS="--max-old-space-size=512" timeout --signal=TERM --kill-after=5s 120s node --test --test-concurrency=1 tests/data-grid-state.test.cjs tests/data-grid-selection.test.cjs tests/data-grid-schema.test.cjs tests/data-grid-columns.test.cjs`: exit 0, 15 passed, 0 skipped (before the additional schema-only import case).
- Additional fresh schema run: same wrapper, `tests/data-grid-schema.test.cjs`, exit 0, 6 passed, 0 skipped. Child process rejects React/Query/Table runtime loading and schema still works.
- Production inference fixture: `NODE_OPTIONS="--max-old-space-size=1024" timeout --signal=TERM --kill-after=5s 120s pnpm exec tsc -p /tmp/opencode/data-grid-production-tsconfig.json`, exit 0. Includes page/cursor/default/row-transform/selection/columns/state positives and negatives.
- Focused oxfmt run exit 0. Existing package module-type warning disclosed; no unrelated configuration repair.
- Narrow unresolved contract: arbitrary one-way filter transforms cannot reconstruct raw control draft values from externally restored normalized controlled state. Re-parsing normalized output applies transforms twice. Example `search => ':' + search` proves non-idempotence. This affects Task 2's transform policy and Task 5's external draft rebasing, not Table v9 or Query availability.
- Proposed bounded amendment: unchanged filters use captured raw draft; external normalized rebase uses public Zod v4 codec encode for transformed filters. Require reversible codecs only when inverse reconstruction is needed; fail clearly for unsupported one-way inverse rather than double-transforming. Row/transport transforms and ordinary schemas remain unchanged. Await user decision before controller implementation.

## Approved codec amendment and Batch 3 progress

- User explicitly approved codec restoration after discussing the long-term API. Spec/plan amended without a commit. Raw bindings use `z.input`; requests/query factories use `z.output`.
- Public Zod encode probe: one-way transform throws ZodEncodeError; reversible codec returns raw `Ada` from normalized `:Ada`, without decoding again.
- State file fresh safe run: 8 pass, 0 skips. External restoration codec and cursor branch from first page regression covered.
- Controller fresh safe file run: 12 pass, 0 skips. Atomic page reset, independent debounces, Apply validation, authoritative controlled request, native select/raw cache, selection/filter reset, inactive state, failed cursor/retry, placeholder guards, controlled codec restoration, page correction, and background failure retaining rows covered.
- Production strict fixture compilation with inherited 1024 MiB / 120s deadline: exit 0 after real hook integration. Positive/negative native selected output, row/accessor/filter/sort inference and page-only actions established.
- Fixture CJS/ESM Query provider context mismatch diagnosed and repaired in test-only setup. Query notification after refetch explicitly settled before assertions. No OOM/timeout or raised memory budget.
- Public Query options are passed to one useQuery invocation without rewriting caller keys/select/retry/enabled/placeholder settings. Table data directly comes from selected Query data.

## Composition and delivery evidence (current uncommitted tree)

- Fresh sequential affected run: `NODE_OPTIONS="--max-old-space-size=512" timeout --signal=TERM --kill-after=5s 120s node --test --test-concurrency=1 tests/data-grid-controller.test.cjs tests/data-grid-rendering.test.cjs tests/data-grid-controls.test.cjs tests/data-grid-feedback.test.cjs tests/data-grid-schema.test.cjs tests/data-grid-state.test.cjs tests/data-grid-selection.test.cjs tests/data-grid-columns.test.cjs`: exit 0, 50 pass, 0 skips.
- Controller coverage includes rejected controlled filter proposals retaining selection until actual acceptance, synchronous request/selection actions, native cancellation/late-response isolation, offline pause, unmount cleanup, stale metadata, and background errors. Controlled cursor scope changes reset history on actual filters/sort/size changes.
- Restored visibility normalizes obsolete IDs and forces non-hideable columns visible. DOM checks cover real Select page-size resets, Dropdown visibility, mixed Checkbox state/all-matching exclusions, page/cursor distinctions, native refs/events, spreadable override props, three-state/Shift multi-sort and backend order.
- Localization/error feedback uses real Empty/ErrorState base composition. Minimal `error-state-base.tsx` supporting split preserves all public ErrorState exports while avoiding Details/Accordion in the DataGrid import graph. Registry support added; refreshed `ErrorState stories` regression case passes with the new three-file artifact graph.
- All six examples compile without consumer casts/repeated domain generics. Two simulated service cases pass for filtered counts, stable sorting, disjoint page/cursor results and AbortSignal cancellation.
- Every exposed playground control affects the actual adapter and generated syntax. Actual Reset clears configuration/search draft. Expanded reset of selection/order/visibility/history is not yet exercised. Generated page/cursor TSX across five async scenarios compiles against real repository public modules; this is NOT isolated installed-consumer evidence.
- Playground test hit two deadline exits after assertions passed because Query GC timers survived provider cleanup. Inspected native observer removal scheduling. Changed only example-scoped QueryClient to `gcTime: Infinity` plus unmount clear; fresh reduced 30s run and whole file pass in ~5.5s. No memory-budget increase or OOM. Generated empty scenario implicit-any array was fixed by deriving an empty slice from typed records.
- Actual Storybook 10.6.1 types compile. Composed portable stories cover default/compact/Apply/allMatching/error/inactive/empty/cursor/controlled; fresh story file exit 0. Controlled navigation test now waits for its actual 80ms simulated request before asserting rows. No Storybook server/browser verification.
- Focused strict compilation: `NODE_OPTIONS="--max-old-space-size=1024" timeout --signal=TERM --kill-after=5s 120s pnpm exec tsc -p /tmp/opencode/data-grid-production-tsconfig.json`, exit 0; includes schema/column/state/hook inference, examples, playground and stories. Disposable config explicitly locates repository Node types rather than assuming /tmp type lookup.
- Shared docs metadata/navigation/renderer are wired. Focused `DataGrid documentation` assembly test passes; complete processed MDX/Markdown and route/browser checks remain pending.
- Focused oxfmt ran on 45 changed source/test/metadata files, exit 0; existing module-type warning unchanged. Registry build with 1024 MiB/180s wrapper exit 0 and generated DataGrid/schema/stories/ErrorState artifacts. Actual CLI installation, safe CI wiring, lint and final integrated build/typecheck/browser checks have NOT run.

## Bounded distribution amendment needed

- Read-only local manifest traversal proves `data-grid -> button -> loading`; InputSearch also requires Button. Existing Loading installs 50 files for its 47 animation variants. Button uses only the default Arc spinner but imports the complete Loading catalog.
- Current DataGrid graph therefore violates the approved no-unrelated-feature-catalog requirement. Do not silently accept it or modify the public Button beyond authorized scope.
- Proposed smallest amendment: extract a shared default Arc loading primitive/supporting module used by Button, preserve Button's public API and loading/reduced-motion behavior, retain the full Loading item unchanged for explicit installation, include any required upstream license, and update only affected manifests/docs/regression/distribution gates.
- User approved the recommended supporting split through the packaging decision tool. Added licensed `loading-arc.tsx`, reused by Button and public Loading's default Arc branch; retained every full catalog variant. Button now declares only its supporting module, no Loading catalog dependency. Shared source content prevents target conflicts. Button docs updated; actual consumer CLI graph still pending.
- Focused new Button loading test passes; combined `tests/button-loading-distribution.test.cjs tests/loading.test.cjs` fresh safe run: exit 0, 8 pass. Default Loading/Arc markup is identical and all 47 variants still render. Reduced-motion runtime behavior and affected artifact/story/distribution gates need refresh.
- No implementation commits, merges, pushes, new servers, browsers, or subagents.

## Real CLI alias finding and approved correction

- Prepared isolated pnpm consumer at `/tmp/opencode/data-grid-consumer`, UI alias `~/shared/controls`, its own declared packages. Relocated only registry dependency URLs to local generated artifact paths to test unpublished checkout artifacts without a new server. Artifact file content/targets/packages are unchanged.
- Real shadcn CLI installed 19 files and no Loading catalog. Initial alias layout exposed existing fixed Button/Input/InputSearch targets splitting their relative imports across `src/components/ui` versus `src/shared/controls`.
- User explicitly approved removing only those three fixed targets. Default aliases keep the same destination; non-default aliases now colocate the graph. Clean fixture rerun pending.

## Latest bounded gates and remaining blockers

- After approved target correction, regenerated registry artifacts, then prepared a fresh isolated fixture `/tmp/opencode/data-grid-consumer-alias` with independent pnpm dependencies and `~/shared/controls` UI alias. Real shadcn CLI created exactly 19 core/supporting files, all colocated in that alias. No Loading catalog/Accordion/calendar/Storybook files installed with core.
- Added a consumer customization to installed DataGrid before real stories-only CLI installation. CLI created exactly one colocated stories file, no dependency installation; byte comparison confirms customized core unchanged.
- Fixture `NODE_OPTIONS="--max-old-space-size=512" timeout --signal=TERM --kill-after=5s 120s pnpm exec tsc --noEmit`: exit 0. Consumer domain/helper/controller/UI and installed stories compile without any repository import fallback. Server-like import fixture compiles, but this is NOT a real Next.js RSC build/client-boundary validation.
- Production dependency versions in fixture: Table 9.2.6, Query 5.104.1, Zod 4.3.6, React/ReactDOM 19.2.5; actual Storybook React 10.6.1 types. Local artifact dependency URLs were relocated for unpublished-source CLI verification; public deployed registry URLs are not yet publication evidence.
- Fresh affected packaging/regression run with 512 MiB/120s/serial workers: `tests/data-grid-distribution.test.cjs tests/button-motion.test.cjs tests/button-loading-distribution.test.cjs tests/button-stories.test.cjs tests/loading.test.cjs tests/error-state.test.cjs tests/component-docs.test.cjs`: 40 pass, no skips, exit 0. Added durable assertions that Button/Input/InputSearch follow configured UI aliases.
- Playground expanded Reset case actually changes cursor mode, allMatching selection, page, and visibility, then restores fresh default page configuration/visible name/no selection; focused 512 MiB/30s run passes. Sort/pending-debounce Reset and actual Copy still need final browser/acceptance coverage.
- User supplied primary URL `localhost:3000`. Browser opened `/docs/components/data-grid` and snapshots show working populated playground, generated code and assembled sections. Desktop resize returned success. Capture and subsequent snapshot both timed out after 20s; no screenshot, mobile/theme/keyboard/Copy/Customize/sticky-scroll evidence. Stopped retries; no alternate browser/server.
- Live processed `/docs/components/data-grid.md` fetched successfully via bounded curl. Explicit content check confirms standard Installation/Dependencies/Props/Source, schema/stories commands, QueryClientProvider and complete manual-install warning survived processing.
- Focused ultracite check (20 files) now clears formatting, but exits 1 with **309 errors and 3 warnings**. Predominant errors: function-expression convention, sorted keys/import style, curly blocks, nested ternaries; effect dependency warnings require deliberate review rather than suppression. This is an implementation lint failure, not a pass or an accepted exception. Full repository lint not yet run.
- Disposable read-only-source-copy lint-fix investigation under `/tmp/opencode/data-grid-lint` failed with oxlint native panic `path is expected to be under the root`; no repository source autofix applied. Original focused diagnostics retained by harness. Investigate path/root handling before using that diagnostic approach again.
- Latest memory observation: 19,696 MiB total, 2,728 MiB available; swap 7,445/8,191 MiB used. Deferred production build/repository-wide checks under current resource pressure. No budgets raised, no user process stopped, no commits/merges/pushes.
- CI commands now explicitly bound lint/build/typecheck heap/deadlines; Node tests inherit 512 MiB, 900s process-tree deadline and serial concurrency. CI execution itself and full local integrated suite/build/typecheck remain unverified. **Batch 6 provisional distribution evidence only; Batch 7 NOT RUN. Work is not complete.**

## Post-format regression checkpoint

- Oxlint safe fixes applied to the agent-authored DataGrid/example/playground source, then reformatted serially with one worker. Remaining diagnostic file `/tmp/opencode/data-grid-lint-after-safe-fixes.json`: 220 diagnostics (includes three effect warnings and added example paths), dominated by function-style/sorted-key conventions and deliberate callback forward references. Lint is still failing; no rules were disabled.
- Safe fixer renamed the codec catch binding and accidentally converted `{ cause }` to invalid ErrorOptions `{ error }`. Fresh focused tsc caught this immediately; restored `{ cause: error }` through an explicit patch. Subsequent focused strict tsc under **512 MiB/120s** exits 0; budget was reduced, not raised.
- Fresh sequential 512 MiB/120s regression run after the fix: controller/state/rendering/controls/feedback/playground/stories/generated-types files, **45 pass, 0 failures/skips**, exit 0 in ~64s. This is focused evidence, not the repository-wide integrated gate.
- Regenerated artifacts after source formatting with **512 MiB/120s**, exit 0. Earlier isolated consumer CLI/type evidence predates these lint-only source edits; artifact parity and final consumer refresh remain required before Task 13 closure.
- `git diff --check` previously passed before the latest formatting; final full diff check pending. Do not mark Batch 7 PASS or offer merge until outstanding acceptance blockers are resolved.
