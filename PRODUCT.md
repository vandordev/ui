# Vandor UI

## Register

brand

## Users

React developers evaluating components, inspecting source code, and installing registry items into their own projects.

## Product Purpose

Vandor UI is Vandor's public component registry and documentation website. Components are distributed as editable source through the shadcn CLI. The first pilot is Button: its shadcn foundation now includes Motion press feedback and a subtle raised finish through vertical gradients and thin borders, without decorative shadows. The registry imports class merging directly from the cn package.

## Brand Personality

Technical, clear, practical. The display name is Vandor UI; package names, registry namespaces, and URLs use vandor-ui.

## Anti-references

Do not redesign the existing startercn documentation surface during component work. Preserve the shadcn foundation; add custom behavior only when explicitly requested. Motion should convey interaction, not decorate the interface.

## Design Principles

- Preserve the existing documentation layout and theme tokens.
- Show working previews alongside source and installation instructions.
- Keep distributable components separate from the website's internal UI components.
- Start from official shadcn components; identify customizations explicitly when they are introduced.

## Accessibility & Inclusion

Preserve shadcn's native button/link semantics, keyboard focus behavior, disabled states, and accessible names for icon-only buttons. Button press feedback scales to 0.96 and respects reduced-motion preferences. Registry buttons add no audio or haptics. Verify previews in both supported themes and at narrow viewport widths.
