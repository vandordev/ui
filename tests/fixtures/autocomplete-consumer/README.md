# Autocomplete isolated consumer

Run after `pnpm registry:build`:

```sh
NODE_OPTIONS="--max-old-space-size=512" timeout --signal=TERM --kill-after=5s 1200s node tests/fixtures/autocomplete-consumer/verify.cjs
```

Requires pnpm and package-network/cache access. Runs sequential bounded subprocesses,
with installation concurrency 1, a 1024 MiB CLI/compiler heap and a 2048 MiB,
one-worker Next build. Does not start a server. Creates and removes only its own
`/tmp/opencode/autocomplete-consumer-*` fixture.

Checks real local-artifact CLI installation under `@/shared/ui`, generated four-mode
consumer compilation, Next Server Component import, and optional stories installation
without modifying customized component/support files. Consumer CSS tokens are an
independent minimal setup. These checks do not establish visual appearance.
