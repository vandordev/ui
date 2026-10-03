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

## Library integration and staged checks

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
