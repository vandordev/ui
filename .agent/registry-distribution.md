# Registry distribution standard

Read this guide when adding or changing registry items, distributable source,
installation instructions, or distribution checks. Use it together with
[`component-implementation.md`](component-implementation.md) and
[`frontend-workflow.md`](frontend-workflow.md).

The website and the installed component are different products. A passing website
build or a test importing repository source does not prove that the registry
artifact works in a consumer project.

## 1. Inspect the complete installation graph

- Treat `registry.json` and the registered source files as the inputs to generated
  artifacts. Review every supporting file, runtime package, and registry dependency
  required by the changed item, including transitive dependencies.
- Resolve imports against their installed targets, not merely their repository
  paths. Include supporting modules and license files where required. Website-only
  modules must not become accidental consumer dependencies.
- Before introducing a registry dependency, inspect the additional installed files,
  packages, and overwrite targets. Foundation components should not pull in a large
  feature catalog without an explicit product reason. Installed file count and
  production bundle size are different measurements; do not equate them.
- Check shared targets for conflicts and dependency cycles. Two items installing
  the same target must supply compatible content; do not silently overwrite a
  consumer's customized primitive to satisfy a new component.

## 2. Declare the consumer environment

- State the supported React, styling, and framework requirements relevant to the
  component. Use public dependency APIs and declare minimum versions or version
  ranges when required APIs are not available in older versions.
- Identify required theme tokens, animation CSS, and other styling setup. Register
  necessary CSS through supported registry mechanisms or document the setup;
  never rely implicitly on `styles/globals.css` from this website.
- Check imports and installation targets with the consumer's configured aliases.
  Do not assume that the repository's `@/` alias proves compatibility with a
  different UI alias or directory layout.
- Verify client boundaries for Next.js-compatible modules. A client playground
  parent must not conceal a module that fails when imported from a Server Component.
- Distinguish the repository directory name, actual upstream primitive/preset, and
  Vandor customizations. When the foundation changes, update affected setup and
  product guidance instead of treating an old component as an unquestioned spec.

## 3. Verify artifacts in an isolated consumer

- For changes to packaging, dependencies, targets, CSS setup, or client boundaries,
  verify the affected generated item and its dependency graph in a minimal consumer
  fixture. Use only files supplied by the installation and declared dependencies;
  do not resolve missing imports back into this repository.
- Prefer a real shadcn CLI installation for installability evidence. A fixture that
  materializes artifact files can verify content and compilation, but does not
  prove CLI target rewriting, dependency resolution, or overwrite behavior.
- Include a non-default alias/layout when import or target rewriting is affected.
  Include a Server Component import when a Next.js client boundary is affected.
  Check styling and interactions through the approved browser workflow when they
  are part of the changed consumer contract.
- Keep disposable fixtures in `/tmp/opencode`; follow the existing approval rules
  for servers and browsers. Add permanent focused regression fixtures to the
  repository when they protect a meaningful distribution contract.
- Scope checks to affected items and their shared dependencies. Report separately
  what artifact validation, consumer compilation, CLI installation, and browser
  verification established. If a required check cannot run, record the missing
  evidence rather than claiming installability.

## 4. Keep installation guidance executable

- Automatic installation instructions must reference the correct registry item and
  explain material overwrite risks or additional setup.
- Manual installation must list every necessary source/supporting file, registry
  dependency, runtime package, styling requirement, and required license notice.
  A single Source block is insufficient for a multi-file component.
- If complete manual instructions are unavailable, direct users to CLI installation
  and explicitly state that copying the displayed Source alone is insufficient.
- Check both rendered documentation and its processed Markdown/LLM representation
  when changing shared installation generation. A custom website renderer must
  not hide missing dependency guidance in the text exposed to agents.
- Describe inherited native/primitive props accurately for each component. Shared
  documentation must not promise generic prop forwarding for a restricted API.

## 5. Keep generated outputs reproducible

- Generate `public/r/` using `npm run registry:build`; do not patch generated component
  content manually. Compare the affected artifact contents and metadata with their
  manifest/source inputs.
- When renaming or removing an item, inspect obsolete artifacts, dependency URLs,
  docs metadata, demos, and discovery links. Remove only outputs confirmed to be
  obsolete within the approved scope; a successful build need not remove old files.
- Before committing distribution changes, inspect the generated diff for unrelated
  changes, missing support files, target changes, and license loss.
- Durable regression tests must run in CI. Building and typechecking do not replace
  runtime or distribution tests; adding an unexecuted test is not an acceptance gate.

## 6. Required stories, optional installation

- Every public UI component must have a portable stories file and a separate
  `<registry-name>-stories` registry item. Follow the Button pilot: item type
  `registry:item`, with the stories file registered as `registry:ui` and no fixed
  target so the CLI places it in the consumer's configured UI directory.
- Keep the ordinary component item free of stories files and Storybook packages.
  Authoring stories is mandatory; installing them is the consumer's choice.
- Stories-only items must not reinstall the component or its transitive registry
  dependencies, overwrite component targets, or modify `.storybook/` configuration.
  Require the component to be installed first and document that prerequisite.
- Do not force-install or upgrade a consumer's Storybook packages. State required
  type/runtime packages and require Storybook package versions to match the
  consumer's existing setup. Declare any additional example dependencies without
  coupling stories to website-only code.
- Use relative public component imports for colocated stories. Verify stories-only
  CLI installation with a non-default UI alias/layout when introducing or changing
  packaging, and confirm an existing customized component remains unchanged.
- Generate stories artifacts through `npm run registry:build`. Check manifest/source
  parity, consumer compilation, and meaningful story composition as applicable.
  A Storybook server and Storybook UI verification are not required in this project;
  report that limitation without claiming visual verification.
- Provide executable separate-install guidance and story discovery/CSS/theme setup
  in the component docs. Never imply the standard shadcn CLI offers an interactive
  "also install stories" prompt; an optional combined command, if provided, must
  explicitly name both registry items.
