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
