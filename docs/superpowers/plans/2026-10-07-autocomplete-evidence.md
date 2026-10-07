# Autocomplete execution evidence

## Execution

- User selected direct inline execution on current `main`. No delegation, worktree,
  additional session, server, or Goal Mode.
- Initial working tree: only approved spec and plan untracked. Preserved both.
- Read applicable AGENTS instructions and all three `.agent/` standards; read
  approved spec and plan in full.
- Browser URL not supplied. GATE-BROWSER: BLOCKED (visual checks only).
- GATE-CONSUMER: PASS (real isolated CLI, compilation, RSC build, stories preservation).
- Storybook UI not verified: this project has no Storybook server.

## Batch 1: PASS (contracts and feasibility)

- Inspected installed Base UI 1.8 public autocomplete/combobox root, input, item,
  chips, chip and remove declarations and input behavior.
- Public chip route: Combobox multiple string values plus separate draft. Default
  Base UI empty-input Backspace deletes immediately; adapter must cancel it and
  focus the last chip first. Public handlers and refs support this, no private import.
- Helper red: bounded 512 MiB, serial 120-second test invocation, all three tests
  failed against deliberate empty implementations (normalization/identity/grouping).
- Types initially tested as contracts, not a claim of completed public runtime.
- Helper green: all three tests PASS, 512 MiB inherited heap, serial, 120s deadline.
- Public primitive probe PASS: independent draft, created string values, first
  Backspace focuses chip without deleting, subsequent Backspace removes chip.
  Public `preventBaseUIHandler()` is necessary in addition to preventDefault.
  Chips are programmatically focusable with tabindex -1; the probe explicitly
  refocuses the input after its Enter transition before testing chip focus.
- `pnpm typecheck` PASS under 2048 MiB inherited heap and 300s deadline.
- Impeccable context loader found existing PRODUCT.md; approved spec owns shape
  and sibling Input/Select tokens. No DESIGN.md. No new image/design required.
- `pnpm exec shadcn docs combobox autocomplete` exited 1: upstream registry has no
  autocomplete item. Installed public Base UI declarations are authoritative.

## Batch 2: local behavior gate PASS

- Test-first red against empty public assembly: 12 runtime/form cases failed.
- Real public Base UI mounted tests now PASS: free text changes, original objects,
  retained absent selection, blur/Escape, trimmed/deduplicated tags, comma draft,
  IME guard, insertion order, first-focus Backspace and chip deletion, status
  precedence, external filter, merged refs, handler cancellation and read-only.
- Additional red/green regression: clicking an existing tag cannot toggle it off.
- Compound multiple flow and controlled owner/query/reset tests PASS.
- Native FormData covers all four modes, empty entries, disabled/read-only,
  external ownership; reset and required-selection validity PASS in Happy DOM.
- 19 affected tests PASS sequentially, 512 MiB heap, concurrency 1, 120s deadline.
- Public runtime imports replace contract-only fixture. Native typecheck PASS.
- File deviation: runtime behavior cases live in autocomplete-behavior.test.cjs
  while autocomplete-runtime.test.cjs retains the public primitive feasibility
  probe. This keeps the early probe independent from the completed adapter.
- Root shares typed common configuration with convenience assembly; Items use
  string IDs in the primitive bridge, returning original source objects publicly.
- Visual appearance, collisions, themes, native browser validity still pending.

## Batch 3: local delivery gate PASS

- Playground parity red: empty generator failed the mode-control assertion.
- Typed shared config drives actual preview and code. Every control is checked at
  a nondefault value, including mode, multiple and status combinations.
- Shared shell Reset restores default configuration, displayed code and transient
  input. Generated 16 mode/multiple/status combinations compile with public
  imports and escaped quotes/newlines/JSX-like strings.
- Async example red/green: 300ms debounce, aborted timer/stale response protection,
  deterministic delayed response and error. Example cleanup runs on unmount.
- Four-mode, rich/grouped, compound and form examples use standard ComponentPreview.
- Gallery discovery suite PASS (4 checks); native tsc/production MDX integration PASS.
- Portable Storybook composition checks all 15 stories, meaningful label/disabled
  args and live tag creation. Mode/multiple Controls initially exposed state-shape
  reuse; red/green regression now remounts the appropriate story state boundary.
- Storybook UI not verified: this project has no Storybook server.

## Batch 4: installation gate PASS

- `pnpm registry:build` under 1024 MiB/180s generated entry, all three support files,
  stories, and catalog. Only new autocomplete artifacts/catalog entries changed.
- Artifact parity test compares all file metadata/content, declared dependencies,
  client boundaries, public relative imports and independent stories installation.
- Real driver: `NODE_OPTIONS="--max-old-space-size=512" timeout --signal=TERM
--kill-after=5s 1200s node tests/fixtures/autocomplete-consumer/verify.cjs`.
- Own temporary fixture under `/tmp/opencode/autocomplete-consumer-*`, no repository
  node_modules link or source alias fallthrough. pnpm dependency installation is
  network concurrency 1, child concurrency 1; bounded subprocess output/deadlines.
- Real shadcn 4.5.0 CLI installed four files into nondefault `@/shared/ui`. Consumer
  tsc compiled four generated mode demos against installed sources only.
- Isolated Next 16.2.4 webpack production build PASS with public `experimental.cpus: 1`,
  2048 MiB inherited heap, 360s process-tree deadline and one native worker thread.
  Server Component page imports the installed client module. Tailwind 4 and local
  theme tokens compile; no consumer visual inspection claimed.
- Installed a custom comment in consumer entry; actual stories-only CLI installation
  preserved SHA-256 hashes of entry and every support file. Final consumer tsc
  checked installed stories with real Storybook React 10.6.1 types.
- Provisioning initially failed because shadcn does not export package.json, then
  consumer CSS declarations were missing. Driver now discovers bin from the
  installed public entry's manifest and supplies standard Next environment types.
  These failures were not counted as PASS. One user-interrupted invocation was
  inspected for remaining processes before resuming.
- CI now invokes the actual network-required consumer driver; root tests already
  discover every new regression test. Fixtures are cleaned in driver finally.

## Batch 5: BLOCKED (not fully accepted)

### Fresh integrated evidence

- Affected suite: **30/30 PASS** after final changes, with inherited 512 MiB heap, serial concurrency,
  finite deadline and kill grace. Full production build regenerates artifact output.
- Repository suite: **385/386 PASS**, 512 MiB, concurrency 1, 900s deadline;
  `/tmp/opencode/autocomplete-integrated-tests.log` records 168080ms completion.
  Failing unchanged test: `Dropdown overlay survives popup unmount and waits for
Motion exit before opening`, `tests/dropdown.test.cjs:969`, Dialog focus-return.
  Focused reproduction also FAIL. Read-only git diff confirms no changes in that
  test, dropdown/dialog source, dropdown playground or its config. No baseline
  repair attempted and no clean full-suite claim made.
- Native repository `pnpm typecheck`: PASS, 2048 MiB/300s.
- Owned TypeScript/JavaScript lint: PASS, oxlint one thread, zero warnings/errors.
- Owned source/documentation formatting: PASS, oxfmt one thread.
- `pnpm check`: FAIL on nine unchanged formatting files: frontend workflow,
  checkbox playground, toast docs, data-grid evidence, toast spec, checkbox demos
  (two), data-grid component, button/loading distribution test. None modified.
- Production `pnpm build`: PASS with `VANDOR_BOUNDED_BUILD=1`, `RAYON_NUM_THREADS=1`,
  `UV_THREADPOOL_SIZE=1`, telemetry disabled, 2048 MiB/600s. User approved the
  environment-gated public Next one-worker setting; ordinary dev config unchanged.
  Output confirms page collection/static generation use one worker. Compilation,
  MDX routes and tsc succeeded. Warnings: existing dynamic NFT tracing from shared
  registry/read-file pipeline; relative typography utilities without font-size.
- Final audit red/green repairs: compound filtering now omits filtered-out items
  and resolves refreshed instances by stable ID; grouping keyboard commit returns
  the highlighted original object; native reset preserves explicit initial query.
  InputGroup uses the whole convenience control as the public popup anchor.
- Latest local checks include highlighted tag selection vs ordinary free-text
  native Enter, disabled suggestion rejection and custom filtering.
- Repository build precedes the final stories-only Controls remount/test and
  showTrigger metadata correction; these invalidate story/type/artifact checks,
  rerun separately, not website runtime compilation. After those changes:
  registry build, 30 affected tests, native typecheck, actual isolated consumer
  driver (including Next build and stories compilation), owned lint and owned
  formatting all PASS again. No React key-spread warning remains in stories.

### Full-spec audit

| Requirement                                                                                | Evidence / status                                                                                             |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Four literal-mode value shapes, readonly collections, required object accessors            | Public `autocomplete.types.tsx` with positive/negative tsc fixtures: PASS                                     |
| Committed/query separation, original objects, absent choice retention                      | Real Base UI mounted behavior/parts suites: PASS                                                              |
| Stable identity for refreshed objects and grouped keyboard order                           | Focused regression cases: PASS                                                                                |
| Trim/deduplicate, comma preservation, IME, Enter, focus-first chip deletion                | Helper and real behavior/primitive probe tests: PASS                                                          |
| Disabled/read-only, refs, cancellation, label/help ownership                               | Behavior/parts/FormData tests and public prop exclusions: PASS locally                                        |
| Filtering, error/loading/empty precedence, async ownership                                 | Actual component/status tests and deterministic example: PASS locally                                         |
| Four-mode native serialization, repeated entries, external form, required/reset            | FormData/Happy DOM tests: PASS; native browser validation BLOCKED                                             |
| Compact and named compound APIs, complete supporting modules/client boundary               | Public entry types, mounted composition, artifact parity and isolated RSC build: PASS                         |
| Sibling styling, wrapping/long content, light/dark, collisions, interrupted/reduced motion | Implemented with public primitives/tokens/Motion; visual evidence BLOCKED                                     |
| Playground controls, reproducible code, Reset                                              | Actual preview/shell tests and generated TSX compilation: PASS; browser Copy/mobile BLOCKED                   |
| Docs, four modes, forms, grouped/custom/compound/async examples, gallery                   | Native tsc, discovery and production MDX build: PASS                                                          |
| Portable typed stories and optional independent installation                               | Actual types/composition/CLI/checksums: PASS; UI not verified per repository exception                        |
| Distribution dependencies/aliases/license/client imports and CI                            | Manifest parity, real installed consumer and reviewed CI wiring: PASS; no copied upstream source/license loss |
| Integrated full suite/check                                                                | FAIL on reproduced untouched Dropdown test and nine untouched format files                                    |
| Primary website/browser acceptance                                                         | GATE-BROWSER BLOCKED: user selected unavailable URL; no guessed port, server operation or Playwright          |

### Handoff boundaries

- Keep work uncommitted on user-selected `main`; no merge/push/branch deletion.
- Approved spec and plan remain preserved/untracked, unchanged by implementation.
- No server launched, restarted or stopped. No issue or pull request opened.
- No browser/consumer appearance or full-plan acceptance claim. Batch 5 stays
  BLOCKED until missing browser evidence and integrated failures are resolved or
  explicitly handled by the user.
