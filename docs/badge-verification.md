# Badge verification

## Scope

Direct inline implementation on `main`, approved by the user. ReUI Base UI Badge
adaptation, independent registry item, portable stories, playground, examples,
documentation and discovery. No internal Badge replacement or DataGrid integration.
No commit, push, merge, additional server or browser launched.

## Contract

- `variant`, `size`, `radius`, Base UI `render`, native span attributes and React 19 refs.
- Full upstream MIT notice is retained inside the installed source file.
- ReUI-specific style radius is replaced by Vandor's theme radius. Focus variants
  use primary tokens; invert variants use foreground/background.
- Semantic solid foregrounds and light/outline text tokens are distributed using
  registry `cssVars` for both themes. Ordinary installation supplies one TSX file;
  stories installation supplies one additional file with no component dependencies.
- Dot, icon and spinner are child composition, not domain/status props. Async state
  and live-region ownership belong to the application. Reduced-motion spinner
  composition uses `motion-safe:animate-spin`.

## Observed evidence

- Initial focused composition test failed because the registry Badge was missing,
  then passed against the implementation.
- Fresh affected suite: **26 passed, zero failed/skipped**, covering native refs,
  link refs/handlers, actual playground controls, Reset, Copy callback payload,
  all variant/size/radius/indicator adapters, safe generated strings, composed
  stories, artifact/license/token parity, generated-code compilation and existing
  documentation/gallery/preview/Button/DataGrid distribution regressions.
- Tests: inherited 512 MiB Node heap, serial execution, 120s process-tree deadline
  with 5s forced-kill grace. Generated consumer TSX compilation uses a nested 90s
  deadline at 512 MiB. Happy DOM uses Motion's JS fallback because its native
  WAAPI cancellation rejects on teardown; these tests do not establish animations.
  Copy uses a test clipboard sink, not the operating system clipboard.
- Repository strict TypeScript: exit 0, 1024 MiB heap / 120s deadline. New component,
  stories, adapter, metadata and four examples: lint **zero warnings/errors** with
  one worker. Touched shared documentation files retain one existing `sort-keys`
  diagnostic at the DataGrid-first metadata map; repository-wide lint not claimed.
- Registry build: exit 0 at 512 MiB / 120s. Generated Badge and stories artifacts
  match their manifest and source. Existing distribution graphs remain unchanged.
- Actual shadcn 4.5.0 CLI installed the local generated artifacts in the independent
  `/tmp/opencode/badge-consumer` Next.js project, with UI alias `~/shared/controls`.
  Badge installation added one file and updated theme CSS; stories installation
  added one file and preserved the agent-customized Badge SHA-256 byte-for-byte.
  Latest source and installed implementation emit identical TSX after excluding
  comments/formatting. This proves local-artifact installation, not deployment.
- Consumer Next.js 16.2.4 webpack production build: exit 0, one worker, 1024 MiB
  heap / 120s deadline. A real Server Component imports the installed client Badge,
  and compilation includes installed portable stories and distributed theme CSS.
- Website webpack production build: exit 0; TypeScript and **116 static pages**
  generated with one worker. Used `CIRCLE_NODE_TOTAL=2` (installed Next config
  derives one worker), `RAYON_NUM_THREADS=1`, 1536 MiB heap / 180s deadline.
  Badge HTML and processed Markdown were emitted. Markdown retains installation,
  token/manual-setup guidance, stories prerequisites, accessibility, props, source,
  and credits. Build warnings concern existing dynamic-import cache invalidation
  in jiti/fumadocs and relative typography utilities; they did not fail the build.

## Outstanding visual evidence

The approved primary server `http://localhost:3000/docs/components/badge` returned
`chrome-error://chromewebdata/` in the OpenChamber browser panel. Website visual
verification, mobile/theme/keyboard/contrast inspection and real clipboard checks
remain unverified. No replacement server or Playwright was started.

Storybook UI not verified: this project has no Storybook server. Portable stories
were compiled against Storybook React 10.6.1 and composed with its real public API.
This is the accepted repository limitation, not evidence of Storybook appearance.
