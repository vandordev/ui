# Family CLI capability probe

Run from the repository root:

```sh
NODE_OPTIONS="--max-old-space-size=512" timeout --signal=TERM --kill-after=5s 300s node tests/fixtures/component-families/probe.cjs
```

This invokes the installed **real shadcn CLI** for a dry-run and actual installation
in each owned disposable fixture: default aliases, divergent components/UI aliases,
and divergent aliases under `src/`. Minimal local artifacts have no dependencies,
so this isolates path placement and import rewriting without installing packages,
starting a server, or resolving imports through repository modules. CLI network
errors remain BLOCKED, not proof of a capability failure.

Exit 0 means the probed family layout resolves. Exit 2 means actual installation
demonstrates an unsupported layout and requires a design amendment before migration.
Exit 1 means the probe is blocked or its own assertions failed. Import rewriting
alone is insufficient: the rewritten nested module must actually be installed there.

Each layout additionally probes **explicit consumer-resolved targets** and verifies
all nested files and alias-rewritten entry imports. This establishes a possible
amendment's CLI boundary only. The probe computes paths from its own known fixture
configuration, not arbitrary real consumer configs. A production alias-aware wrapper
and local dependency-closure handling would require approval and separate tests.
`--overwrite` is used only for this disposable probe's own test modules, never user
files or consumer customizations.

This probe is not a consumer typecheck, runtime check, or proof that the real
Autocomplete/DataGrid dependency graph installs. Those remain separate plan gates.

## Full family acceptance matrix

`verify.cjs` is the independent package-install/real CLI gate, separate from the
historical capability probe above. It runs default, non-src divergent, and
src-divergent layouts sequentially using the approved alias-aware family wrapper.
It installs DateTime before Query families, checks AppShell and shared field
closure, compiles source-adapter positive/negative types, and verifies customized
DateTime/core files plus package/config checksums survive stories-only installs.
Every dependency and compile subprocess has a finite deadline and owned-tree
cleanup. Run it only inside the aggregate memory/no-swap protection specified in
`.agent/frontend-workflow.md`; do not run heavy checks concurrently.

The installed Next Server Component → DateTime client boundary is a separate gate
in `../date-time-consumer/verify.cjs`. It independently installs packages and the
registry item, then performs a single-CPU Next build without a listening server.
Neither fixture may fall back to repository runtime source or dependency symlinks.

Current local evidence: the default-layout matrix stopped at its 240-second
dependency-install timeout, before CLI installation. The other layouts and Next
fixture are unrun. Offline artifact-backed consumer compilation is useful but
does not accept these gates. Do not repeat unchanged downloads or raise a build
memory budget after OOM without the required approval.
