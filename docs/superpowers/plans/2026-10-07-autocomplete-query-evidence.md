# Autocomplete Query implementation evidence

## Verification continuation after checkpoint `fa04f79`

User authorized up to 1 GB RAM for verification. All checks ran sequentially in
`systemd-run --user --scope --quiet -p MemoryMax=1G -p MemorySwapMax=0`, with finite
`timeout --signal=TERM --kill-after=5s` deadlines. Node tests retained 512 MiB
heap and `--test-concurrency=1`; compiler heap was 768 MiB to leave native headroom.
No memory limit was increased beyond the user's authorization.

- Added consumer stage labels and `FAMILY_VERIFY_LAYOUT` case selection. Individual
  runs report `GATE-FAMILY-CASE`, not full matrix acceptance.
- Three individual real CLI cases PASS: `schema-only`, `default`, and
  `src-divergent`. Schema-only compiles without React/Query/Table; other cases
  compile UI without Query, then optional Query native selected-data/page types,
  DataGrid/schema and installed stories with customized-core checksums.
  These runs used artifacts before the subsequent hook type repair/formatting;
  fresh final consumer acceptance remains pending. Plain divergent consumer with
  Query/DataGrid is not covered by these three cases.
- First affected suite PASS: 107/107, no skips. Registry artifacts regenerated.
- Typecheck exposed native infinite options' selected `InfiniteData<Page>` using
  unknown page-param metadata, while the adapter incorrectly required `Param` in
  selected data. Separated selected metadata from native request `Param`; no
  runtime fetch behavior changed. Typecheck then PASS.
- Full serial repository suite after regeneration: **393 PASS / 2 FAIL / 0
  skipped**, 395 tests. Full output in disposable
  `/tmp/opencode/autocomplete-verification-tests.log`.
  One failure was obsolete DataGrid installation-command expectation. Updated
  only that expectation to the approved wrapper; focused docs test PASS (1/1).
  The other, Dropdown overlay focus restoration, also FAILS in isolation (1 test,
  0 pass). No Dropdown source/test assertions were changed; root cause remains
  unproven and no baseline PASS or unrelated-regression diagnosis is claimed.
- `pnpm check` FAIL: 42 formatting files, including task-owned and other existing
  files. Formatted only checkpoint-owned non-generated files using repository
  `oxfmt` config with one thread, plus the changed docs assertion. Initial shell
  argument expansion formatted only one file; corrected explicit argument list
  formatted 41 files. Did not modify unrelated formatting offenders.
- Separate scoped lint FAIL: **141 errors / 0 warnings** in 36 selected code
  files, including task-owned files and existing violations in touched files.
  No lint acceptance claimed and no blanket disable or broad autofix applied.
  Disposable diagnostics: `/tmp/opencode/autocomplete-verification-scoped-lint.log`.
- After formatting, registry regeneration PASS and repository typecheck PASS.
  Latest typecheck scope peak was 759.6 MiB per systemd. Full tests and consumers
  were not rerun after this final formatting/regeneration.

### Production build safety stop

Command: `VANDOR_BOUNDED_BUILD=1 NODE_OPTIONS="--max-old-space-size=768"
UV_THREADPOOL_SIZE=1` with the same total 1 GiB scope, executing
`timeout --signal=TERM --kill-after=5s 600s pnpm exec next build --webpack`.
One configured build CPU. Build output reached optimization and repeated retry
messages but never reported successful compilation. Tool reported SIGTERM.
Read-only systemd journal confirmed scope `run-p587230-i594076.scope` ended
with **`oom-kill`, 1 GiB memory peak, about 51 seconds elapsed**. This was NOT a
600-second timeout. No build worker remained in the process listing afterward.
Build is BLOCKED. No heavy verification rerun, heap increase, swap allowance,
heap dump, alternative build or server restart followed the OOM.
Disposable build log: `/tmp/opencode/autocomplete-verification-build.log`.
The repository uses `next/font/google`, but retry source/network causality was
not proven; do not label this solely a font/network failure.

Current verification is incomplete: lint, Dropdown focus failure, bounded
production build, fresh post-format consumer/full-test gates, outstanding spec
coverage and browser verification remain. Primary browser URL is still unknown;
no server was started. No issue/PR was identified to link to this session. Work
is included in a user-requested verification checkpoint on `main`; no push or
merge performed. Commit does not close failed or blocked gates. Automatic mutating
pre-commit checks are disabled for this checkpoint after the recorded OOM stop;
fresh staged whitespace checking is the only additional check before committing.

## Execution authority and initial state

- User selected direct execution in this session on `main`, without subagents,
  extra sessions, worktrees, or Goal Mode, and explicitly requested commits.
- Initial `git status --short --branch`: clean `main...origin/main [ahead 1]`.
- Initial HEAD: `77f67d9`, approved spec and plan documentation commit.
- Approved spec and plan read in full, together with repository frontend,
  component implementation, distribution, and personal workflow instructions.
- No baseline checks claimed. No primary browser URL supplied yet. No server
  started, stopped, or restarted. Storybook UI not verified: this project has no
  Storybook server.

## Batch and gate ledger

### Approved amendment follow-up

User approved the consumer-resolved explicit-target amendment. The approved plan
now records this narrow change without weakening alias/consumer acceptance gates.
Checkout rechecked: clean `main`, HEAD `2dbe922`, ahead 2 before follow-up edits.

Added initial `scripts/component-family-artifacts.cjs` preparation utility. It
reads actual components aliases and TypeScript paths (including inherited config),
rejects ambiguous mappings and paths outside the consumer, maps canonical family
source paths to explicit `~/` cwd-relative targets, and recursively rewrites
registry dependency URLs from the actual `vandor-ui.vercel.app` registry to local
generated artifacts. Unknown remote registry dependencies and cycles fail closed.
It does not launch CLI, force overwrite, start a server, or modify consumer files.

Focused command:

```sh
NODE_OPTIONS="--max-old-space-size=512" timeout --signal=TERM --kill-after=5s 120s node --test --test-concurrency=1 --test-name-pattern='family targets' tests/component-family-artifacts.test.cjs
```

Result: PASS, 1 test, 0 failures, 0 skipped. Covers divergent src targets, primitive
alias resolution, locally generated dependency closure and rejecting an escaping
alias. This is only initial utility evidence: wrapper CLI entry, broader resolution
tests, formatting/lint, real CLI integration and family migration remain pending.
Historical FAIL below remains valid for stock no-target behavior; approval alone
does not close GATE-CLI-PROBE. Native Query contracts and all subsequent batches
remain pending.

| Batch                             | Status          | Evidence / remaining acceptance                                   |
| --------------------------------- | --------------- | ----------------------------------------------------------------- |
| 1: Public contracts and CLI proof | REPLAN REQUIRED | Actual CLI alias capability FAIL; native Query type proof not run |
| 2: Agnostic feedback/pagination   | NOT STARTED     | Depends on Batch 1 public contracts                               |
| 3: Typed Query hooks              | NOT STARTED     | Depends on Batches 1 and 2                                        |
| 4: Installed families             | BLOCKED         | Requires resolved GATE-CLI-PROBE                                  |
| 5: Delivery surfaces              | NOT STARTED     | Depends on local contracts and confirmed family entries           |
| 6: Integrated acceptance          | BLOCKED         | Earlier gates and browser evidence required                       |

| Gate           | Status  | Exact evidence                                                            |
| -------------- | ------- | ------------------------------------------------------------------------- |
| GATE-CLI-PROBE | FAIL    | Real shadcn dry-run and installation flatten divergent family directories |
| GATE-CONSUMER  | NOT RUN | No real family artifacts implemented yet                                  |
| GATE-BROWSER   | BLOCKED | Primary server URL requested; not supplied                                |

## Safety and proof boundaries

Probe children inherit a 512 MiB Node heap, serial execution, individual 90-second
process-tree deadlines and 5-second forced-kill grace. Outer invocation is bounded
at 300 seconds. Disposable files are restricted to a freshly created owned
`/tmp/opencode/component-families-probe-*` directory, cleaned in `finally`.
No runtime modules are symlinked into consumers. No network-dependent consumer
install or build has run. Primitive bounded assertions only.

## CLI source analysis (not executable proof)

Installed shadcn 4.5.0 resolves `registry:component` against components alias, but
its no-target path function trims source paths at the consumer destination's last
directory basename. If absent, it uses only the source filename. Fixed `target`
paths are cwd/src-relative, not components-alias-relative. Import rewriting does
honor separate components/UI aliases. This suggests flattened files paired with
nested imports for divergent directory names; the real probe must establish it.

## Requirement coverage

Only early CLI feasibility is being investigated. Modes/native Query inference,
feedback/public Loading, pagination, hook cache/race/cancellation behavior, legacy
Autocomplete/DataGrid regression, family/schema/Query-free/RSC installation,
customized stories checksums, playground/examples/docs/CI, and the full browser
matrix are all **unverified**. No batch or full-plan acceptance is claimed.

## Executed CLI evidence

Command (initial capability, explicit-target alternative, then final pre-commit
verification after lint repairs; no OOM/timeout or resource increase):

```sh
NODE_OPTIONS="--max-old-space-size=512" timeout --signal=TERM --kill-after=5s 300s node tests/fixtures/component-families/probe.cjs
```

All three invocations exited **2**, the probe's explicit capability-failure status, not a
network failure. Every CLI dry-run and actual install child exited 0. Version:
installed shadcn **4.5.0**. Actual paths from the final invocation:

| Layout                              | No-target family files                                                                                                    | Rewritten Query import            | Result                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ----------------------------------- |
| `@/components`, `@/components/ui`   | `components/autocomplete/index.ts`, `components/autocomplete/query.ts`, `components/data-grid/schema.ts`, colocated story | `@/components/autocomplete/query` | PASS for this minimal path probe    |
| `@/shared`, `@/primitives`          | `shared/index.ts`, `shared/query.ts`, `shared/schema.ts`, `shared/autocomplete.stories.tsx`                               | `@/shared/autocomplete/query`     | FAIL: nested imported module absent |
| Same divergent aliases under `src/` | `src/shared/index.ts`, `src/shared/query.ts`, `src/shared/schema.ts`, `src/shared/autocomplete.stories.tsx`               | `@/shared/autocomplete/query`     | FAIL: nested imported module absent |

Primitive alias rewriting succeeded in all three layouts. This does not rescue
the missing family targets. No production source/manifest migration was attempted.

### Smallest proposed amendment, awaiting user approval

Allow a thin alias-aware installation wrapper to read the consumer's real
components/UI aliases and TypeScript paths, generate disposable local artifacts
with **consumer-resolved explicit targets**, then invoke the real stock shadcn CLI.
Keep public family APIs, optional Query/schema/stories boundaries, primitive
locations, reviewed overwrite prompts, and local generated dependency closure.
No private CLI APIs, default-only paths, server, or source fallthrough.

The additional explicit-target probe **PASSed all three layouts** for nested UI
entry, Query entry, schema entry, colocated story, primitive target, and rewritten
entry imports. Concrete targets included `shared/autocomplete/index.ts`,
`shared/data-grid/schema.ts`, `primitives/primitive.ts`, and their `src/` variants.
The CLI's own src handling did not double-prefix `src/`.

This proves only the proposed mechanism's CLI path boundary. It is **not** approval
to implement that wrapper and **not** proof of arbitrary alias resolution, actual
dependency closure, typed consumer compilation, stories checksum preservation,
or the full component families. Those require implementation and fresh evidence
after approval. Packaging-dependent work is stopped at the plan's mandatory
replan gate; no installation contract is silently weakened.

## Narrow pre-commit checks

## Follow-up implementation and current safety blocker

Implementation is **partial**, not complete. User explicitly requested a checkpoint
commit after the OOM blocker was reported. No full batch
acceptance is claimed by the following focused results. Earlier status tables
describe the initial probe checkpoint; this section records subsequent work.

### Implemented locally

- Shared search/open/debounce state and pure eligibility/configuration/dedup helpers.
- Ordinary and infinite native Query hooks and optional Query entry; UI-only entry.
- Compact feedback using the actual public Loading component, hint and background
  state, agnostic footer, guarded user-scroll pagination and accessible button.
- Family entries/manifests and alias-aware local-artifact wrapper; DataGrid runtime
  source is unchanged. Wrapper remaps cross-directory primitive imports and the
  full Loading graph including catalog/license for separate consumer aliases.
- Initial Query examples, pagination/status playground controls, portable stories,
  documentation and generated-code family imports. Surface work remains incomplete.

### Fresh results obtained

- Native repository typecheck passed after real selected ordinary/infinite page
  inference fixtures were added. Early conditional factory typing failed select
  inference and was replaced with native public generic options signatures.
  Remaining limitation: object-ID accessor is currently runtime-required rather
  than statically mandatory; callback fixtures use explicit annotations where the
  original JSX union context loses callback narrowing. These are not full-spec PASS.
- Focused feedback and pagination tests each PASS (1/1): public Loading, blocked
  old options for hint, retained background options, no mount draining, duplicate
  near-bottom scroll lock, error suppression and explicit Retry button.
- Real QueryClient ordinary/infinite focused tests PASS (1/1 each): closed popup,
  debounce, controlled authority, enable/skipToken retry guard; next-page error
  latch, same-tick duplicate guard, retained items and first-ID-wins dedup.
- Serial eight-file core/Query regression command PASS: **26/26**, 0 skipped:
  `NODE_OPTIONS="--max-old-space-size=512" timeout --signal=TERM --kill-after=5s 180s node --test --test-concurrency=1 tests/autocomplete-behavior.test.cjs tests/autocomplete-form.test.cjs tests/autocomplete-parts.test.cjs tests/autocomplete-query.test.cjs tests/autocomplete-infinite-query.test.cjs tests/autocomplete-query-state.test.cjs tests/autocomplete-pagination.test.cjs tests/autocomplete-feedback.test.cjs`.
- Registry build PASS before later story edits (not fresh for final stories).
- Expanded affected suites: **103 PASS / 4 FAIL**, 0 skipped. Failures were obsolete
  flat import fixture aliases and old no-target/Loading-dependency assertions.
  Those fixtures were updated to the approved family contract. Both generated-type
  suites rerun PASS (2/2), including all ten Autocomplete scenarios and four modes.
  Distribution suites not yet rerun after assertion changes.
- Real existing isolated consumer driver PASS after Loading graph target repair:
  `NODE_OPTIONS="--max-old-space-size=512" timeout --signal=TERM --kill-after=5s 1200s node tests/fixtures/autocomplete-consumer/verify.cjs`.
  Establishes core family through actual CLI with local Loading closure, generated
  four-mode TSX, Next Server Component webpack build (one worker), story installation,
  all customized core checksums and actual Storybook types under nondefault aliases.
  Its printed GATE-CONSUMER PASS is **that driver's case only**, not the full matrix.
  Later playground/story/source changes invalidate final fresh-consumer acceptance.

### Full-family matrix failure and OOM

New `tests/fixtures/component-families/verify.cjs` targets default, divergent src,
and schema-only consumers with real CLI, core without Query, optional Query native
types, DataGrid/schema and story checksums. It is not yet accepted or added to CI.

Command:

```sh
NODE_OPTIONS="--max-old-space-size=512" timeout --signal=TERM --kill-after=5s 1200s node tests/fixtures/component-families/verify.cjs
```

1. Initial FAIL: CLI combined duplicate unversioned/versioned foundation specs;
   pnpm tried `lucide-react@^0.4.0`. Wrapper normalizes the three known foundation
   package specs consistently. No Query/React consumer upgrade was forced manually.
2. Second FAIL: fixture ES2022 lib lacked existing DataGrid `toSorted`. Fixture
   target changed to ES2023; runtime DataGrid behavior was not altered.
3. Third run **BLOCKED by V8 heap OOM at 512 MiB** in a child Node command. Final
   primitive report: exit status null, `Allocation failed - JavaScript heap out of
memory`, followed by timeout's process-abort report. Driver does not yet print
   stage labels, so exact child stage has not been proven. Disposable fixture
   removed in finally; no known-RAM-exhausting rerun or heap increase was attempted.

Heavy verification stopped after OOM per mandatory memory safety. Before any
retry, add bounded stage labels and split compilation into smaller family/type
surfaces without changing assertions. Increasing compiler heap requires explicit
user approval; no automatic increase. OOM does not count as a capability PASS,
consumer PASS, or a proven component regression.

### Remaining acceptance (all explicit)

All-six-batch completion remains unverified. In particular: expanded hook races,
cancellation, native enabled functions, placeholder/background/selection/form
combinations and all four mounted bindings; static object accessor/type-error
contracts; core page-promise failure/reset/keyboard focus details; complete playground
actions/parity and portable story coverage; all consumer matrix cases/schema-only
absence and Next boundaries; installation docs/Markdown/story discovery consistency;
CI matrix integration; formatting/lint repairs; fresh generated artifacts; full
serial integrated suite/typecheck/check/bounded production build and full-spec audit.
No primary browser URL was supplied. Browser gate remains BLOCKED, not waived.
Storybook UI not verified: this project has no Storybook server.

### User-requested checkpoint commit

Commit all task-owned partial changes, including this ledger, without claiming
acceptance. Fresh `git diff --check` passed before staging. No heavy check was
repeated and no heap limit was increased after OOM. Formatting/lint and final
artifact regeneration remain pending. Generated registry files reflect the last
successful registry build, not subsequent source/story edits, so source/artifact
parity is not claimed. Disable the automatic mutating pre-commit formatter for
this explicit checkpoint: it must not silently change source after recorded checks
or introduce unverified artifact drift. No push, merge, branch change or user-file
discard is authorized. Remaining gates above still apply.

- `NODE_OPTIONS="--max-old-space-size=512" timeout --signal=TERM --kill-after=5s 60s pnpm exec oxfmt --threads=1 --check tests/fixtures/component-families/probe.cjs tests/fixtures/component-families/README.md docs/superpowers/plans/2026-10-07-autocomplete-query-evidence.md`: PASS.
- `NODE_OPTIONS="--max-old-space-size=512" timeout --signal=TERM --kill-after=5s 60s pnpm exec oxlint --threads=1 tests/fixtures/component-families/probe.cjs`: PASS, 0 errors/warnings.
- Earlier scoped Ultracite check identified formatting/lint issues in the new probe;
  repaired, then verified with its underlying repository formatter/linter directly
  to explicitly limit native workers to one. Package module-type advisory remains.
- No runtime components changed. Repository tests, typecheck, registry/production
  build, and full consumer matrix were not run and are not claimed PASS.
