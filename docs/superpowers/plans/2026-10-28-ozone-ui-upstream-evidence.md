# Ozone UI Upstream Execution Evidence

## Initial state

- Branch: `main`
- HEAD: `7e0e9ba29b1703c14a3aa2dc67ed99e76dcd5fd1`
- Initial dirty paths: approved spec and approved plan (both untracked).
- Browser URL: unknown; G-VISUAL pending user-provided primary URL.
- No verification has passed at initialization.

## Batch and task status

| Batch | Tasks | State | Evidence / blockers |
|---|---|---|---|
| 1 | 1–3 | LOCAL CHECKS PASS / HISTORY OPEN | Shell/Dropdown, tooltip, full-bleed/page teaching surfaces and public negative types verified; complete T2 test-before-integration history unavailable. |
| 2 | 4–6 | LOCAL CHECKS PASS / HISTORY OPEN | Naming/forms, whole-group notch focus, real overlays, code/Reset/stories/consumer checks pass; T4 initial RED history unavailable. |
| 3 | 7–9 | LOCAL CHECKS PASS / HISTORY OPEN | Counts 0–17, runtime/reduced motion, real StatsCard/password Reset, translated generated JSX, locale and token pass; T7/T8 initial RED history unavailable. |
| 4 | 10–12 | LOCAL CHECKS PASS / HISTORY OPEN | Strict parser/Intl, hydration/ref, real Reset, discovery/stories and family/artifact compilation pass; T10/T11 initial chronology incomplete, real installed Next boundary blocked. |
| 5 | 13–15 | LOCAL CHECKS PASS / HISTORY OPEN | Shared controller, both adapters, renderer, source lifecycle demo/story, old/new exports and types verified; pre-extraction inventory/RED chronology unavailable. |
| 6 | 16 | BLOCKED / PARTIAL | Fresh full suite 509/509, typecheck, scoped lint/format, registry and complete artifact parity pass; production build OOM, visual and independent CLI/Next gates remain blocked. |

## Requirements and gates

- R1–R10: LOCAL EVIDENCE / NOT FINALLY ACCEPTED; see requirement matrix below. No batch is accepted while its complete local checklist remains unresolved.
- G-VISUAL: BLOCKED — primary dev-server URL is unknown; no server started.
- G-CLI: BLOCKED — real independent package install timed out before actual CLI; offline consumer compilation passes but is not a replacement.
- G-BASELINE: BLOCKED (build only) — full tests, native types and scoped lint/format pass; production build was stopped by aggregate-memory OOM. No exemption or increased budget approved. `pnpm check` wrapper timed out; its native formatter/linter were checked directly with equivalent repository configuration and one worker.
- Storybook UI: not verified; repository has no Storybook server.

## Change and verification ledger

| When | Change/check | Result | Invalidations |
|---|---|---|---|
| 2026-10-28 | Changed PageContainer to `p-4 sm:p-6 lg:p-12`; removed AppShell main padding; added `showHeader=true`, localized shell labels, custom-control `ReactElement` TooltipTrigger composition, optional integrated user footer with `sidebarFooter` precedence; registered helper/Dropdown closure; added headerless/user stories and migration docs. | `pnpm typecheck` PASS; bounded `pnpm registry:build` PASS; `node --test --test-concurrency=1 tests/app-shell.test.cjs tests/page-container.test.cjs` PASS (13/13). Focused new user-footer test PASS. One intermediate AppShell artifact assertion failed against stale `public/r`; rebuilt artifacts and reran successfully. | T2 promise/link/cancellation/mobile selection lifecycle remains unverified. Custom-link hover/focus/ref behavior and responsive visual behavior remain pending. Browser and real CLI gates remain pending. |

## Current limitations

## Recovery continuation (2026-10-28, ordinary inline Build)

- Authority: approved plan, existing `main`, no new sessions/subagents/worktrees, commits or pushes. HEAD remains `7e0e9ba29b1703c14a3aa2dc67ed99e76dcd5fd1`. Prior dirty files preserved. Status table above is historical and not current acceptance evidence.
- Recovery inspection: `free -m` reported RAM 19696 total / 11418 used / 8277 available; swap 8191 total / 7256 used / 935 free. Bounded `ps` summary and verification-command process scan found no leftover Node tests/tsc/Next/shadcn/pnpm verification children. No processes killed, no servers started or restarted. This does not establish the previous hang's root cause.
- OS protection proven available: `systemd-run --user --quiet --wait --pipe -p MemoryMax=1G -p MemorySwapMax=0 -p TasksMax=32 -p RuntimeMaxSec=10s /usr/bin/true` passed. All subsequent checks run in a fresh transient service with `KillMode=control-group`, `TimeoutStopSec=5s`, finite `RuntimeMaxSec`, plus GNU timeout TERM/5s kill grace. Tests use `MemoryMax=1G`, no swap, `TasksMax=48`, inherited 512MiB V8 heap, `UV_THREADPOOL_SIZE=1`, serial Node runner, 120s deadline. No runaway reproduction attempted.
- systemd services defaulted to `/home/alfarizi` and Node 20; first focused invocation failed only because the relative test path was absent. A first pnpm invocation failed before compilation because systemd's Node 20 lacks `node:sqlite`. Corrected wrappers explicitly supply `--working-directory=/home/alfarizi/dev/vandor/ui` and `env PATH="$PATH"` (shell Node v24.18.0). These are environment failures, not OOMs/timeouts.
- Reconciliation: existing dirty work implements portions of Batches 1–4 (AppShell, fields, metrics/password/locale and DateTime), but teaching surfaces/fixtures and most generated outputs were incomplete; Batch 5 has not begun. None is accepted merely from existing edits.
- Added durable failing regression `AppShell user default async action preserves mobile owner until rejection is handled`: RED (`Pending action must not unmount its Dropdown owner`), then GREEN. Replaced AppShell's callback/link rewriting with a typed Dropdown `onSelectionComplete` seam. Native Dropdown owns cancellation, pending/errors, groups/submenus and session validity; async default selection may close the menu but retains drawer owner until fulfillment. Rejection leaves navigation mounted. Overlay activation does not notify selection.
- Added durable failing headerless rail/mobile regression (RED missing collapse control). Implemented sidebar collapse/brand keyboard reveal, headerless mobile brand tab/right drawer/translated close and safe-area clearance; footer render state now receives closeNavigation; root/background and sidebar tokens corrected. Headerless focused checks exposed incorrectly forwarded Drawer close label; fixed through public `contentProps` API. Removed unsupported `showSwipeHandle` content prop after native typecheck caught it; it remains a root prop.
- Exact focused commands use the protection wrapper above and `node --test --test-concurrency=1 --test-name-pattern='user action closes' tests/app-shell.test.cjs` (PASS 1); `'default async action'` (expected RED 1); `'user'` (PASS 3); `'headerless retains'` (expected RED 1); `'headerless'` (1 PASS/1 FAIL before public Drawer prop repair). Name-filter skips are diagnostic only, not full acceptance.
- Registry refresh: protected 1500MiB aggregate / 768MiB heap / 180s `pnpm registry:build` PASS. Generated files refreshed by generator only, including DateTime and prior source changes.
- Full local run: protected 1GiB aggregate / 512MiB heap / 120s `node --test --test-concurrency=1 tests/app-shell.test.cjs tests/page-container.test.cjs tests/dropdown.test.cjs`: 35 PASS / 1 FAIL / 0 SKIP. AppShell 13/13, PageContainer 4/4 pass. Dropdown overlay final-focus assertion fails at tests/dropdown.test.cjs:969; investigate next, do not accept Batch 1. Motion reduced-motion advisory present. No timeout/OOM.
- Latest source changes invalidate earlier AppShell/Dropdown type/artifact/consumer evidence. Current registry build is fresh, but typecheck has not rerun after correcting Drawer prop. Browser/real CLI remain unverified. Existing Batch 2–4 code/tests still require audit against every plan checklist. Batch 5 and final Batch 6 remain outstanding.

### Subsequent continuation evidence (supersedes stale limitation statements)

- Dropdown overlay failure diagnosed as obsolete test animation selectors (`dialog-content`/`dialog-backdrop`); updated to current public slots `dialog-popup`/`dialog-overlay`. Focus assertion retained; protected focused `overlay survives` test PASS (1/1).
- Protected AppShell grouped-user lifecycle PASS (7/7): sync, preventDefault, Base UI cancellation, throw, keep-open, rejection, stale fulfillment. Native link lifecycle PASS (4/4): ordinary, canceled, modifier, persistent. Real user submenu success and overlay/menu-Escape ownership/focus return PASS (2/2). These compose Dropdown's recursive completion seam rather than rewriting callbacks.
- Custom compact link test now checks actual mounted TooltipContent after pointer/focus events, not trigger metadata alone; focused PASS (1/1). Browser keyboard/hover geometry still unverified.
- Added AppShell account demo, API/migration/localization/headerless guidance and stories (custom link, pending, rejected, custom footer). Existing demos/docs still require completeness audit.
- FieldOutline now uses transparent labels and real fieldset/legend notch; Autocomplete shares it and group-focus state. Red notch regression reproduced before change. Real Drawer and Dialog suggestion selection plus notch/focus tests PASS (3/3). Full Select files PASS (16 tests in the earlier combined run; Autocomplete test fixture selector failures were repaired without changing source behavior). Browser painting remains unverified.
- DateTime default date/time regression RED (`08:03` missing calendar date), then fixed default options. Strict indexed-access consumer compilation exposed unsafe regex/array indexing; repaired. Utility/hydration plus overlay tests PASS (8/8). DateTime registered in documentation renderer; hostile generated JSX regression RED then fixed expression serialization. Actual preview/generated-code output parity PASS with locale, timezone, date/time format and hostile fallback vectors.
- DataGrid extraction: one shared `data-grid-controller.ts`, Query adapter retains real native result, source adapter requires no provider and exposes only data/error/refetch. New provider-free page/cursor/controlled request tests and existing Query regressions PASS. Pagination zero/one/many choices RED then fixed. Latest combined source/controls/DateTime playground run PASS (13/13). Added positive/negative source type fixture; fresh typecheck pending after fixture creation.
- Most recent protected `pnpm typecheck` PASS before new source type fixture. Protected registry build PASS before latest DataGrid extraction/DateTime utility changes; artifacts now stale and must regenerate. Installed consumer materialization last FAIL on DateTime indexed access; fix not yet rechecked against fresh artifacts.
- Protection for all listed tests: transient systemd service, aggregate 1GiB (consumer materialization 2GiB), no swap, 512MiB inherited heap, serial runner, 120s timeout plus 5s grace, whole-group cleanup. Typecheck: 2GiB aggregate/1024MiB heap/300s. Registry: 1500MiB aggregate/768MiB heap/180s. No OOM or deadline occurred.
- Current status: Batches 1–5 contain implementation but no complete local acceptance recorded yet. Plan checkboxes intentionally remain unchecked for unmet gates. Batch 6 not started. G-VISUAL BLOCKED (no primary URL/authorization); G-CLI pending real fixtures. No server/process stopped or started; no commits or branch changes.

### Further recovery continuation and current-tree reconciliation

- Full protected AppShell/PageContainer/Dropdown run PASS 49/49. Full selected Select/Autocomplete/Input form, focus and overlay group PASS 63/63. These supersede the stale 35/36 run and focused-only lifecycle evidence.
- Metrics/DateTime/family local group initially 19/20: old StatsCard playground assertion expected maximum two metrics. Expanded the real control and generated/preview cases to counts 1–7; this failure was a test expectation invalidated by the new approved teaching surface, not hidden. Later combined StatsCard/controller/distribution group passed all StatsCard cases; one Autocomplete artifact assertion failed because it assumed every supporting file belongs inside the family. Corrected it to verify shared UI `field-outline.tsx` content equals Select's copy and is not accidentally family-targeted.
- Source renderer now mounts real DataGrid/search/selection/pagination without QueryClientProvider. Additional tests cover apply validation, debounce/reset, sorting, page size, all-matching selection across immutable updates, same-identity refresh correction, real initial-error Retry, refreshing rows and background-error rows. Complete source file PASS 5/5.
- Added provider-free DataGrid demo/story and accurate source ownership/status docs. Existing playground remains Query-backed; no inert adapter selector was introduced. Story covers source ready/empty/error/loading and single-size navigation. Further completeness/self-review remains required.
- Added Select shared typed preview configuration and executable hostile-label/generated-JSX parity test (PASS). Initial fixture parse failure was missing Jiti JSX mode; fixed the fixture without altering production source. Added label-mode stories, field/helper guidance and Drawer/Dialog Autocomplete runnable example.
- StatsCard stories/playground now cover five/six/seven metrics; docs describe full-row balancing and complete three-file closure. Password playground now exposes translated action labels with generated code wiring; added Indonesian story and docs. Added real DayPicker Indonesian locale demo/story and upstream identity/display regression.
- Found Button distribution gap: component used `text-destructive-foreground` but Button item did not declare the token (focused RED). Declared light/dark + Tailwind theme token identical to existing Badge values and documented manual setup; focused token gate GREEN. Browser contrast is not established.
- Extended real CLI matrix with DateTime before Query families, AppShell closure, default/non-src-divergent/src-divergent layouts, source positive/negative types and customized-core story checksums. Added independent installed Next Server Component DateTime fixture and sequential CI steps. These fixtures are implemented, NOT accepted as executed.
- G-CLI BLOCKED: protected default-layout attempt timed out at its 240-second `pnpm install` deadline while resolving/downloading packages, before any CLI installation. Whole cgroup was cleaned up; no OOM. Do not retry undownloaded layouts or the same package-dependent Next fixture unchanged. Real CLI rewriting, checksums and installed RSC boundary remain unverified.
- `pnpm check` and `pnpm check --threads=1` hit EAGAIN because Ultracite did not forward the worker limit to formatter. Reduced diagnostic `taskset -c 0 pnpm check registry/new-york/date-time-utils.ts` ran safely with one worker and exposed lint errors. Scoped one-thread formatter and safe lint fixes applied only affected authored paths; current lint still has unresolved style/complexity/dependency findings, so G-BASELINE/lint is not PASS. Attempted read-only HEAD comparison in owned temporary copies failed in the linter's external-path traversal; no baseline exemption established.
- Formatting wrapped negative type cases, invalidating `@ts-expect-error` placement. Native typecheck correctly failed with unused directives plus expected errors; moved directives to the actual offending JSX/prop lines. Fresh native typecheck still required after that repair.
- Latest registry build PASS after safe lint fixes/token/locale changes. Latest protected group PASS 18/18: strict installed-artifact consumer compilation (ES2022 + indexed access + divergent aliases + generated Select/DateTime snippets + source negative types), Autocomplete/DateTime artifact parity, all five source tests, locale/story tests, DateTime parser/hydration and Select code parity. This is offline materialization with shared dependency installation, NOT actual CLI or RSC evidence.
- All changes remain uncommitted on `main`; no user-owned process/server stopped, no server started, no branch/session/worktree created. Required remaining work: authoritative task/batch checkbox reconciliation, teaching-surface gaps, lint/self-review, fresh native types/full integrated suite/build and external G-VISUAL/G-CLI.

## Latest integrated checkpoint

- Full serial suite: `systemd-run --user --quiet --wait --pipe --working-directory=/home/alfarizi/dev/vandor/ui -p MemoryMax=2G -p MemorySwapMax=0 -p TasksMax=48 -p RuntimeMaxSec=910s -p TimeoutStopSec=5s -p KillMode=control-group env PATH="$PATH" NODE_OPTIONS=--max-old-space-size=512 UV_THREADPOOL_SIZE=1 timeout --signal=TERM --kill-after=5s 900s node --test --test-concurrency=1 tests/*.test.cjs` PASS **499/499**, 0 fail/skip, ~242s. Includes actual stories-only divergent-UI CLI check and artifact-backed stories compilation. That narrow stories CLI success does not establish the new full family/core matrix.
- Native `pnpm typecheck`: PASS after correcting negative-fixture directive placement, protected 2GiB aggregate/1024MiB inherited heap/300s. It preceded the failed Next build; Next-generated type artifacts have not been rechecked after that build.
- Protected `pnpm build`: BLOCKED by real cgroup OOM. Used `MemoryMax=2500M`, `MemorySwapMax=0`, 1536MiB inherited heap, 600s timeout/610s unit deadline, TasksMax=64, CPU affinity one core, bounded Next config. Registry phase PASS, then Turbopack stopped during optimized compilation. Unit `run-p3678434-i3680014.service`: `Result=oom-kill`, `MemoryPeak=2621505536`, `MemorySwapPeak=0`, main terminated SIGTERM by unit cleanup. No rerun or limit increase authorized; no heavy checks launched after OOM. This is not evidence about the earlier laptop hang.
- Build warning exposed duplicate `dependencies` keys in DateRangePicker manifest. Removed duplicate, retaining explicit `react-day-picker` declaration. Lightweight duplicate-key parser PASS; manifest/generated `public/r/registry.json` semantic parity PASS; DateRangePicker generated dependency parity PASS. No manual edits to generated artifacts. The normalization changes no parsed registry content and does not resolve the build OOM.
- `git diff --check`: PASS after final manifest/plan edits. Authored files were formatted once with one-thread Oxfmt; subsequent safe lint fixes and final patches mean formatting must be rechecked. Remaining lint diagnostics saved in `/tmp/opencode/ozone-lint-after-fix.json` (diagnostic snapshot, not current acceptance). No baseline waiver established: follow-up temp HEAD check failed because pnpm required a package manifest.
- Plan checkboxes reconciled only for concrete implemented/verified substeps. Multi-part tasks with missing scenarios, true Reset evidence, red-before-change history, or complete publication audit remain unchecked. No constraint or unmet step was removed. T2 lifecycle tests intentionally live in existing `tests/app-shell.test.cjs`, rather than a separate file, to reuse the real shell harness; T14 source renderer tests live in `tests/data-grid-source.test.cjs` for provider-free composition. These flexible-scope path choices do not weaken acceptance.

### Requirement evidence and remaining acceptance

| Requirement | Current evidence | Still required |
|---|---|---|
| R1–R3 | Full shell/PageContainer/Dropdown lifecycle and link/overlay tests; native types; AppShell installed-artifact/story compilation | Full demo/spacing/tooltip publication audit; actual desktop/mobile/theme/safe-area browser checks; core CLI closure |
| R4 | Pure strict vectors, actual hydration/ref/native props, DateTime artifact parity and installed-artifact snippets | True playground Reset/control coverage audit; real installed Next boundary and three-layout CLI/checksum matrix; browser Intl |
| R5–R6 | Select naming/ref/form regressions, quote-safe code parity, complete Autocomplete suite and real Drawer/Dialog selection | Remaining label/chip/focus scenario audit and typed generated combinations; browser notch geometry/paint/overlays; CLI helper placement |
| R7 | Exhaustive 0–17 balanced-row invariants, runtime/reduced-motion tests, 1–7 playground code and stories | Browser row/separator widths and final teaching-surface audit |
| R8 | Native Query suite, five provider-free source tests including real renderer/Retry, positive/negative types, source demo/story | Source example refresh/error controls and complete shared contract/publication audit; real installed source matrix/browser |
| R9 | Translated password behavior/playground props, upstream Indonesian locale identity/display, declared Button theme token | Dedicated translated-code/Reset evidence, actual light/dark contrast and installed token check |
| R10 | Generated parity, complete suite/docs/gallery/story tests, CI matrix/Next steps added | Lint/format fixes, full spec/diff review, protected production build, real CLI and browser acceptance |

### Resume boundaries

- Preserve existing dirty/untracked work on `main`; HEAD `7e0e9ba29b1703c14a3aa2dc67ed99e76dcd5fd1`. No commit, merge, push, new branch/worktree/session or subagent authorized.
- Obtain primary dev-server URL before browser; no server starts/restarts or alternative automation without authority. Storybook UI not verified: this project has no Storybook server (accepted limitation).
- Do not retry memory-blocked production build or increase memory after OOM without explicit user approval. Resolve lint with a scoped single-worker workflow, not unbounded `pnpm check`; CPU affinity `taskset -c 0` successfully constrained formatter worker detection.
- Do not retry the unchanged independent consumer package downloads merely to burn the same timeout; G-CLI needs available dependency cache/network. Installed Next fixture and remaining layouts are unrun, not passing.
- Continue unchecked local publishing/Reset/scenario audit and lint repairs before accepting Batches 1–5; preserve exactly one final integrated Batch 6 and rerun invalidated gates. Project backlog records the remaining acceptance task; no completion claim or merge offer is appropriate yet.

## Final local reconciliation — 2026-10-28

This section supersedes the earlier 499-test checkpoint, stale lint snapshots and
open teaching-surface statements. It does not erase failures or claim external
acceptance. Work stayed in the approved ordinary session on dirty `main`; no
session/subagent/worktree, branch switch, commit, merge or push was created.

### Local changes reconciled

- R1–R3 / T1–T3: workspace and hierarchy page examples now apply PageContainer
  once; `app-shell-full-bleed-demo.tsx` deliberately omits it. Hierarchy's composite
  Dropdown moved to sidebarHeader; portable custom navigation remains one native
  forwarding root. Docs describe the spacing break, headerless hidden topbar and
  retained opt-in search shortcut, helper/Dropdown closure, sidebar theme tokens
  and custom-control contract. Added compact identity tooltip/pending coverage,
  malformed-menu negative type, and expanded/mobile no-open-tooltip assertions.
- R5–R6 / T4–T6: real Autocomplete chip/remove/clear/trigger focus checks supplement
  the notch and Drawer/Dialog selection checks. Initial chip test used the wrong
  mode and was corrected to selection/multiple/floating. Added explicit static,
  unlabeled, floating-multiple and manual-keyboard portable stories; no extra
  overlay dependency or Storybook addon was introduced. Actual Select Reset
  changes labels/mode/selection and restores generated code.
- R7/R9 / T7–T9: real StatsCard Reset verifies seven metrics, configured aria-label
  and code restoration. Initial test incorrectly looked for aria-label as visible
  text; corrected assertion targets the actual attribute. Password Reset verifies
  translated labels, visibility, native value and generated code return to defaults.
  Strict artifact consumer compilation includes hostile translated password JSX.
  Locale demo/story and declared Button light/dark token remain intact; browser
  contrast has not been established.
- R4 / T10–T12: added native ref/event and valid→invalid update coverage, broader
  calendar/offset/invalid-number vectors, and real controls/display/code Reset.
  Audit found explicit empty timezone silently discarded: focused `empty timezone`
  test failed RED, source changed to test undefined rather than truthiness, then
  complete parser/component tests passed. DateTime docs/renderer/metadata and
  automatic gallery discovery are covered by the full suite. Pure helpers remain
  React-free; installed Next boundary still has no execution evidence.
- R8 / T13–T15: shared controller presentation/pagination helpers, stable callbacks
  and effect dependencies were lint-reconciled without splitting request logic.
  The source demo now owns explicit Complete/Fail/Refresh/Retry/Restart transitions
  without network/timers/provider. Portable source story can recover via refetch.
  Docs and API metadata distinguish both adapters, source lifecycle/ownership and
  zero/one-size selector behavior; Query-backed playground remains unchanged in
  purpose. DataGrid stories install instructions now use the alias-aware wrapper.
- R10 / T16: native lint fixes confined to changed files, exact source/artifact
  parity, migration/manual/helper guidance and source/index API were audited.
  Explicit family exports preserve all prior runtime exports (new durable test)
  and the `DataGridController` type (negative/public installed type fixture).
  No Ozone imports, auth/router/backend implementation, new date dependency,
  standalone NavUser, clock, compatibility spacing switch or website redesign was
  added. Original six batches and exactly one final audit batch are preserved.

### Findings and verification corrections

| ID | Finding | Disposition / evidence |
|---|---|---|
| L-01 | Authored/inherited lint in modified scopes | CLOSED locally: direct Oxlint final JSON has zero diagnostics, 81 code files, 453 rules, one thread. No blanket baseline exemptions. HEAD-copy comparison was diagnostic only. |
| L-02 | Empty explicit DateTime timezone ignored | CLOSED: actual RED reproduced then GREEN; full 509-test run covers the repair. |
| L-03 | Stories docs required stock nested-family CLI | CLOSED: DataGrid instructions and executable docs assertion now require family wrapper. Initial integrated run was 508/509; corrected assertion then fresh full runs passed 509/509. |
| L-04 | Explicit grid index omitted old controller type | CLOSED: type restored, consumer import rewrite updated, native + installed-artifact strict compilation and full suite pass. Runtime export inventory test also passes. |
| L-05 | API metadata described only Query adapter | CLOSED: shared descriptions plus typed source/ownership entry; existing actual playground/code/Reset tests pass without adding an inert adapter control. |
| L-06 | Async rejection test stopped awaiting microtasks | CLOSED: synchronous act caused React warnings, restored async act with an explicit microtask await; final full run has no act warnings. |
| L-07 | Expanded tooltip test assumed disabled Trigger loses its slot | TEST CORRECTED: public Trigger remains mounted but disabled; assert actual absence of tooltip popup after focus/hover instead. No production workaround; focused and complete shell tests pass. |
| H-01 | Original RED-before-implementation and ordering evidence incomplete | OPEN process evidence: T2 complete preintegration set; T4 initial label RED; T7/T8 original RED; T10 original parser RED; T11 failing preparation and before-story sequence; T13 pre-extraction inventory/RED. Current tests pass, but history cannot be recreated and these composite checkboxes remain unchecked. |

### Fresh checks on the reconciled tree

All resource-intensive checks were sequential transient user systemd services with
explicit working directory and inherited PATH, `MemorySwapMax=0`,
`KillMode=control-group`, `TimeoutStopSec=5s`, finite unit and GNU-timeout deadlines,
`UV_THREADPOOL_SIZE=1` and `taskset -c 0`. No user-owned process was stopped.

- Full `node --test --test-concurrency=1 tests/*.test.cjs`: **509/509 PASS**, zero
  fail/cancel/skip, 327226.638963ms. 2GiB aggregate, inherited 512MiB heap,
  TasksMax=48, 900s command / 910s unit. Log: `/tmp/opencode/ozone-suite-final.log`.
  This final run follows the last source/type/metadata/test changes; only plan and
  evidence bookkeeping follows it. Earlier 499/499 and 508/509 are historical.
- Final focused revalidation: **37/37 PASS** for complete AppShell, component docs,
  grid playground, consumer compatibility and public API files, including true
  Reset and latest type/publication changes. Same protection, 180s / 190s.
  Log: `/tmp/opencode/ozone-final-revalidation.log`.
- Publication group: **20/20 PASS** for consumer compatibility, family preparation,
  grid artifacts/API/docs/playground and DateTime artifacts, after index type
  restoration. Log: `/tmp/opencode/ozone-final-publication.log`. Offline consumer
  materialization uses fresh artifacts and repository-installed dependencies; it
  is not independent installation or Next RSC proof.
- Native `pnpm typecheck`: PASS after final grid API metadata/codegen, negative
  AppShell type and source/index fixtures. 2GiB aggregate, 1024MiB heap,
  TasksMax=48, 300s / 310s. This also rechecks post-build generated Next types.
- `pnpm registry:build`: PASS after final distributable index change. 1500MiB
  aggregate, 768MiB heap, TasksMax=48, 180s / 190s.
  Log: `/tmp/opencode/ozone-registry-final.log`.
- Lightweight unique-key parser plus complete semantic manifest/source/dependency/
  CSS parity: PASS for **77 items / 163 files**. Artifacts generated only by the
  registry builder, with no obsolete outputs or manually edited artifact content.
- Scoped `pnpm exec oxlint --threads=1 --format json`: PASS, zero warnings/errors,
  81 code files; scoped `pnpm exec oxfmt --threads=1 --check`: PASS, 96 authored
  files. 768MiB aggregate, 512MiB heap, TasksMax=32, 90s / 100s each. Native config
  MODULE_TYPELESS_PACKAGE_JSON advisory remains; no unrelated package-mode edit.
  Logs: `/tmp/opencode/ozone-lint-final.json`, `/tmp/opencode/ozone-format-final.log`.
- `pnpm check` wrapper timed out at 90s after printing its invocation; did not
  repeat unchanged. Minimal direct one-file Oxfmt check passed before expanding
  safely to the equivalent separate native formatter/linter gates above. The
  wrapper itself is not labeled passing; exact hang cause is unestablished.
- Last read-only memory sample before final suite: 4879MiB available RAM, 14MiB
  swap free. Whole-tree verification remained inside its no-swap cgroup. Full swap
  alone and the prior build OOM do not establish the earlier laptop hang cause.

### Remaining acceptance and invalidation map

- G-VISUAL remains BLOCKED: primary URL unknown; no browser inspection, alternate
  automation, Playwright, guessed port or server start/restart. Required shell/
  themes/safe-area/keyboard, field popup painting, StatsCard geometry, contrast,
  browser Intl and playground Copy/rendering checks remain unperformed.
- G-CLI remains BLOCKED: independent default-layout dependency installation timed
  out after 240s before the CLI; remaining layouts, existing full autocomplete
  consumer and installed DateTime Next boundary are unrun. No repeated unchanged
  downloads. CI fixtures are wired and type/syntax-reviewed, not claimed executed.
- G-BASELINE/build remains BLOCKED by historical cgroup OOM at 2500MiB aggregate
  / 1536MiB heap. No retry or budget increase occurred. Current runtime/artifact
  changes invalidate that old attempted build as current-tree acceptance evidence;
  it remains failure evidence only. Fresh production build requires approval and
  a safe resource decision.
- Local R1–R10 implementation, teaching surfaces, types, tests, artifacts, lint and
  format have current evidence. No known local runtime/publication repair remains.
  H-01 history gaps, required browser/independent installation/build gates prevent
  overall acceptance and full batch completion claims. Unchecked historical steps
  were neither weakened nor retroactively marked RED.
- Runtime/source changes invalidate the affected focused/full suites, native types,
  registry artifacts, artifact-backed compilation and future browser/CLI/build
  evidence. Index/type-only changes invalidate types/artifact/API gates; docs/API
  metadata changes invalidate docs/codegen/format gates. Final current local gates
  were rerun; later bookkeeping alone does not invalidate code gates.
- Storybook UI not verified: this project has no Storybook server. User-owned
  servers were left untouched. No successful-finalization merge offer is due.

### Final Git and handoff state

- Branch `main`, HEAD `7e0e9ba29b1703c14a3aa2dc67ed99e76dcd5fd1`, local
  ahead/behind recorded `0/0` against existing `origin/main` (no fetch/push).
- Working tree remains deliberately dirty: 119 porcelain entries (80 tracked
  modified paths, 39 untracked entries; one entry represents the new fixture
  directory). No staging/commits, deletion/relocation of user work, or branch
  operations occurred. These counts include approved spec/plan/evidence files.
- `git diff --check`: PASS after plan/evidence reconciliation. Registry directory
  inventory has no obsolete JSON outputs outside the manifest plus registry index.
- Existing project todo `b8154b31-2f04-461c-af4b-016714aefe56` remains open with
  updated external/history blockers. This ledger is the durable handoff; temporary
  `/tmp/opencode` logs support it but are not required to understand gate states.
- Stop condition is the remaining authority/environment/history boundary, not a
  batch boundary. Do not claim the plan complete, retry unchanged downloads,
  increase build budgets, start a server, or fabricate historical RED evidence.
