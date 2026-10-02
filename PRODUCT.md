# Vandor UI

## Register

brand

## Users

React developers evaluating components, inspecting source code, and installing registry items into their own projects.

## Product Purpose

Vandor UI is Vandor's public component registry and documentation website. Components are distributed as editable source through the shadcn CLI. The first pilot is Button: establish the uncustomized shadcn baseline before introducing Vandor-specific changes.

## Brand Personality

Technical, clear, practical. The display name is Vandor UI; package names, registry namespaces, and URLs use vandor-ui.

## Anti-references

Do not redesign the existing startercn documentation surface during baseline component work. Avoid decorative changes, new button variants, custom motion, or additional interaction effects before the baseline is established.

## Design Principles

- Preserve the existing documentation layout and theme tokens.
- Show working previews alongside source and installation instructions.
- Keep distributable components separate from the website's internal UI components.
- Start from official shadcn components; identify customizations explicitly when they are introduced.

## Accessibility & Inclusion

Preserve shadcn's native button/link semantics, keyboard focus behavior, disabled states, and accessible names for icon-only buttons. The initial Button pilot adds no audio, haptics, or custom animation. Verify previews in both supported themes and at narrow viewport widths.
