# Autocomplete Query implementation evidence

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

- `NODE_OPTIONS="--max-old-space-size=512" timeout --signal=TERM --kill-after=5s 60s pnpm exec oxfmt --threads=1 --check tests/fixtures/component-families/probe.cjs tests/fixtures/component-families/README.md docs/superpowers/plans/2026-10-07-autocomplete-query-evidence.md`: PASS.
- `NODE_OPTIONS="--max-old-space-size=512" timeout --signal=TERM --kill-after=5s 60s pnpm exec oxlint --threads=1 tests/fixtures/component-families/probe.cjs`: PASS, 0 errors/warnings.
- Earlier scoped Ultracite check identified formatting/lint issues in the new probe;
  repaired, then verified with its underlying repository formatter/linter directly
  to explicitly limit native workers to one. Package module-type advisory remains.
- No runtime components changed. Repository tests, typecheck, registry/production
  build, and full consumer matrix were not run and are not claimed PASS.
