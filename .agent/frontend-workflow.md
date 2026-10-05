# Frontend development and verification

These rules apply only to Vandor UI. Preserve the existing documentation surface,
theme tokens, and separation between distributable registry components and the
website's internal UI components.

## One primary dev server

- Use the user's primary dev server for this checkout. If its URL is not known,
  ask for it before browser verification; do not guess a port.
- Do not start an additional server, restart a server, change its port, or stop
  it without explicit user approval. Report an unavailable server or stale preview
  instead of silently creating another one.
- Prefer hot reload for visual iteration. Do not repeatedly build and start
  production previews for small changes.
- If approved to start a temporary server, record its URL and ownership. Agree
  on cleanup permission before starting it and stop only that agent-owned server
  when no longer needed. Never stop unrelated or user-owned processes.

## Browser-first verification

- In OpenChamber, use its browser panel as the primary path for visual and
  functional verification. Open the agreed URL, take a scoped snapshot, and use
  the returned selectors to interact with the page.
- Check relevant desktop and mobile layouts, supported themes, and changed
  interactions. For drawers, this includes opening and closing, long-content
  scrolling, accessible close controls, and applicable directions or snap points.
- Use computed-style inspection when rendering is unclear and screenshots for
  visual evidence. Inspect actual results rather than describing expected behavior.
- After two failed attempts at the same interaction, inspect the target and
  report any tooling limitation. Do not keep retrying the same approach or
  silently switch to another browser automation system.
- In Codex or another runtime without the OpenChamber browser tool, report that
  limitation and ask for an available browser tool or user-assisted visual checks.
  Never claim browser verification that was not performed.

## Playwright requires approval

- Do not install or run Playwright, or launch an alternative automated browser,
  without explicit user approval for the current task. Existing installations do
  not imply permission.
- Do not create Playwright scripts as a default part of frontend work. If the
  browser panel cannot establish a necessary behavior, explain the missing
  evidence and ask permission for a focused additional check.
- Browser-first does not replace meaningful unit tests or typechecking. Keep
  runtime logic and regression protection covered by repository-native checks.

## Storybook stories without a server

- Every public registry UI component must provide portable stories as defined in
  [`component-implementation.md`](component-implementation.md).
- This project has no Storybook server. Do not require Storybook UI verification
  for completion or ask for a server URL solely to verify stories. Do not install
  or launch a Storybook server unless the user explicitly requests it.
- Verify stories using actual Storybook types, meaningful composition/rendering
  checks, and the applicable registry/consumer checks. These do not establish
  appearance or interaction inside the Storybook UI.
- Report Storybook UI verification as not performed because no server exists;
  this is an accepted limitation, not a gate requiring a separate waiver.
- This exception is only for Storybook UI. Continue to verify changed website and
  playground surfaces through the approved primary dev server/browser workflow.

## Library integration and staged checks

### Strict memory safety for verification

These rules are mandatory. Keeping the laptop responsive takes priority over
finishing a verification command. A blocked check must be reported, not retried
with unsafe resource settings.

- Run Node tests with `NODE_OPTIONS="--max-old-space-size=512"` so Node child
  processes inherit the heap limit, and use `--test-concurrency=1`. Start with one
  affected file and a focused name pattern; expand only after that check is safe.
  Do not run bare `node --test` or bare `pnpm test` without these safeguards.
- Give every test/check invocation a finite wall-clock deadline and terminate its
  owned process tree on timeout. For focused tests, default to 120 seconds with a
  5-second forced-kill grace period. A shell/tool timeout alone is insufficient
  unless it also terminates descendants. On Linux, an example is:

  ```sh
  NODE_OPTIONS="--max-old-space-size=512" timeout --signal=TERM --kill-after=5s 120s node --test --test-concurrency=1 --test-name-pattern='overlay survives' tests/dropdown.test.cjs
  ```

- A V8 heap limit is NOT a total-RAM limit: native allocations, buffers, and child
  processes consume additional memory. For suspected runaway memory, use an
  available OS-enforced process-tree memory limit (for example a configured
  cgroup), with a default budget of 1 GiB for focused test reproduction. If such
  isolation is unavailable, do not rerun a known memory-exhausting reproduction
  unchanged; use read-only inspection or a bounded, reduced diagnostic instead,
  and disclose the limitation. Never claim the heap flag guarantees a RAM cap.
- Run tests, typechecks, registry builds, and production builds sequentially, not
  in parallel with each other. Do not start multiple diagnostic test processes.
  Account for existing servers and other workloads; do not stop user processes.
- For other Node-based checks, set an explicit inherited heap budget (at most
  2048 MiB by default), a finite deadline, and conservative worker concurrency
  where supported. These are per-process budgets, not permission to consume all
  available RAM. If a check needs a larger budget or additional parallel workers,
  explain why and obtain explicit user approval first.
- On OOM, abnormal memory growth, or timeout, stop the owned diagnostic process
  tree and investigate the smallest failing case. Do not automatically retry,
  increase heap limits, disable safeguards, generate heap snapshots/core dumps,
  or launch another heavy check. Report the failure and available evidence.
- Never pass DOM nodes, Happy DOM windows/documents, React fibers, synthetic
  events, or similarly connected runtime objects directly to assertions that
  format actual/expected values (`assert.equal`, `strictEqual`, `deepEqual`, etc.).
  For identity, compare a boolean with a short explicit message:

  ```js
  assert.ok(
    document.activeElement === triggerRef.current,
    "Focus must return to the trigger"
  );
  assert.ok(document.querySelector('[role="menu"]') === null, "Menu must unmount");
  ```

- Assert small primitive snapshots for content/attributes/state instead. Do not
  log, stringify, or deeply inspect entire DOM/React graphs on failure; diagnostics
  must be bounded (for example tag name, ID, selected attributes, or truncated text).
  Preserve the actual behavioral assertion; never hide a failure to avoid OOM.
- Clean up mounted roots, timers, observers, animations, and DOM environments in
  test teardown, including failure paths. Cleanup does not replace safe assertion
  output or execution limits.

### Integration and acceptance checks

- Check public library exports and TypeScript declarations before implementing
  an integration. Confirm uncertain APIs with a minimal focused check; do not
  depend on undocumented internals merely because they exist at runtime.
- During iteration, run focused tests and typechecks proportional to the change.
  Use the dev server for rendering and interaction checks.
- Before claiming completion or committing implementation work, run fresh
  integrated checks proportional to risk: repository tests, typecheck, relevant
  formatting/lint, and a production build when compilation, packaging, or route
  integration needs verification.
- Avoid repeating expensive checks when no relevant code has changed. Production
  builds are acceptance checks, not the default visual iteration loop.
- For documentation-only changes, use formatting, link/path checks, and diff
  checks rather than unnecessarily running the application test/build pipeline.
- In the handoff, distinguish what passed from what was not verified, mention
  meaningful warnings or blockers, and identify any server intentionally left running.

## Verification artifacts

- Project screenshots may be stored in `.openchamber/`, which is gitignored.
  Never force-add this directory or stage screenshots containing private session data.
- Keep other disposable experiments and scripts in `/tmp/opencode` unless a
  project-local temporary location has been agreed upon.
- Put permanent regression tests in the repository's test directories. Temporary
  verification scripts do not count as durable regression coverage.
- Do not delete or overwrite unfamiliar artifacts or stop processes just to clean
  up the workspace. Clean up only agent-owned temporary work within the agreed scope.
