# Component documentation

Component pages use frontmatter to opt into shared sections. Other documentation pages remain ordinary MDX.

```yaml
---
title: Button
description: A tactile button with configurable press feedback.
component: button
credits:
  - name: shadcn/ui
    url: https://ui.shadcn.com/docs/components/radix/button
    contribution: Original Button implementation.
---
```

`component` must match an item in `registry.json`. Credits are optional; use HTTP(S) URLs and describe the actual contribution.

## Section order

1. Title and description, rendered by the page layout.
2. Playground, when an adapter is registered.
3. Installation, derived from the registry homepage and component name.
4. Dependencies, when the registry item declares packages.
5. Your MDX body: Usage, Examples, and Behavior & Accessibility.
6. Props, when shared prop definitions are registered.
7. Source, read from the item's registry UI file.
8. Credits, when provided in frontmatter.

Do not repeat the generated headings or installation/dependency/source data in the MDX body. Keep examples and behavior specific to the component.

## Adding a component

- Register its package dependencies, source file, and installation target in `registry.json`.
- Add its props and optional playground default code to `componentDocDefinitions` in `lib/component-docs.ts`. Use the same prop metadata as its playground controls rather than maintaining a second props list.
- Implement its live preview adapter and add it to `playgrounds` in `components/component-documentation.tsx`. The shared playground renderer handles controls, reset, and copy; the adapter handles component-specific composition.
- Create an MDX page with `component` frontmatter and its unique examples/behavior. Import only the examples used by that body.

The `remarkComponentDocs` transformer runs before Fumadocs heading and Markdown processing. Generated headings appear in the table of contents. The processed Markdown includes dependency commands, prop values, default playground code, source, and credits, not just empty React component tags.

After changing the registry, prop metadata, or source, verify with `pnpm build`. Check the page and `/llms.md/docs/components/<name>/content.md`; Copy Page uses this Markdown route. Also verify that ordinary documentation pages do not acquire component sections.
