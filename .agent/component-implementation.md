# Component implementation standard

This guide applies to new registry components and substantive improvements to
existing components. Read it together with
[`frontend-workflow.md`](frontend-workflow.md). A component is not finished when
it renders: the distributable implementation, documentation, playground, examples,
and verification must form one polished, coherent product.

## Quality baseline

Use the original Accordion, Button, Drawer, Loading, and Select as references for
completeness and attention to detail, not as templates to copy blindly:

- `registry/new-york/`: public component implementation.
- `components/*-playground.tsx`: interactive preview adapters.
- `lib/*-playground.ts`: prop metadata, defaults, and generated code.
- `content/docs/components/`: usage, scenarios, and behavioral guidance.
- `examples/` and `tests/`: runnable examples and regression protection.

Prefer Button for preview/code synchronization and focused examples, Select for
public API and composition guidance, Drawer for complex ownership and form
integration, and Loading/Accordion for animation and reduced-motion behavior.
These references are not exempt from review; do not reproduce an existing defect.

Match completeness to component complexity. A simple field does not need a
Drawer-length page, but it still needs a real playground, usable examples,
accurate API guidance, consistent states, and evidence for its behavior.

## 1. Inspect before implementing

- Read the relevant existing components, shared tokens, documentation generator,
  registry entries, and tests before choosing an API or visual treatment.
- Keep distributable components in `registry/new-york/` separate from the site's
  internal `components/ui/`. Do not silently change internal UI to make a registry
  component look correct.
- Use the repository's established primitives and styling conventions. Check
  public dependency exports and types rather than relying on undocumented APIs.
- Identify applicable states and scenarios before coding: empty, populated,
  controlled/uncontrolled, disabled, read-only, invalid, loading, long content,
  keyboard, mobile, light/dark, and reduced motion.
- Do not expand the task into unrelated redesigns, API migrations, or dependency
  replacements without approval.

## 2. Public component contract

- Make common usage concise; expose advanced composition where justified. State
  which element each prop affects, especially for compound components.
- Specify defaults, controlled/uncontrolled behavior, empty-value representation,
  callback timing, and whether changes are immediate or transactional.
- Preserve native element semantics and relevant attributes. Do not claim generic
  native-prop forwarding for a component with a deliberately restricted API.
- Add `"use client"` to distributable modules requiring a client boundary, such as
  modules using state/effect hooks. A client-only documentation parent must not
  hide a broken consumer import from a Next.js Server Component.
- Preserve public refs. Merge consumer and internal refs when both are needed;
  never accept a ref in the type and then overwrite it with an internal ref.
- Preserve and compose caller event handlers. Respect cancellations where the
  underlying primitive supports them. Avoid unnecessary synthetic-event casts.
- Use repository-standard `cn` merging so consumer classes can override defaults.
  Avoid copying the same style string across variants when a shared foundation
  can prevent visual drift.
- Document installation targets and all runtime/registry dependencies. Avoid
  website-only imports in distributed files; register required supporting files.
- Verify native form behavior where applicable: `name`, submitted values, reset,
  validation, and focus through a consumer ref. Explain unsupported contracts.
- For dates, money, secrets, or normalized values, document display versus public
  value, locale/timezone assumptions, precision, and security limitations.

## 3. Visual polish and state consistency

Use established theme tokens for surfaces, borders, text, focus, and validation.
Do not introduce unrelated colors, radii, shadows, or motion just to decorate a
new component.

- Align heights, padding, type scale, radii, and icon sizes with sibling controls.
  Any deliberate difference must have a product reason.
- Keep labels, hints, errors, and controls consistently spaced. Ensure a row of
  different field types looks intentional, not like separate libraries.
- Anchor icons and action buttons to the control, not the combined label/control
  wrapper. Check static and floating labels, with and without adornments.
- Check empty and populated floating labels, focus/blur, autofill, and native form
  reset. Labels and placeholders must not overlap.
- Give hover, focus, active, disabled, read-only, invalid, and loading states a
  coherent treatment. Read-only is not interchangeable with disabled.
- Handle long labels/values, narrow containers, and zoom without clipping useful
  content or causing page-level horizontal overflow.
- Verify overlay placement, collision handling, layering, scrolling, and dismissal.
  Keep focused controls visible and provide an accessible exit.
- Make motion purposeful, interruptible, and reduced-motion aware. Follow sibling
  interaction conventions; do not force animation onto every component.
- Check light and dark themes together. A correct token name is not proof of good
  contrast, floating-label backgrounds, or visible focus in both themes.

## 4. Accessibility is part of implementation

- Use native controls or established accessible primitives rather than recreating
  keyboard and focus behavior unnecessarily.
- Associate visible labels with their controls; placeholders are not labels.
- Give icon-only actions meaningful names and hide decorative icons from assistive
  technology. Keep actionable controls independently keyboard-accessible.
- Support appropriate keyboard behavior, visible focus, and overlay focus return.
- Connect invalid state and error/help text using the appropriate ARIA attributes.
  Provide supported hooks for application-level error descriptions.
- Announce relevant asynchronous feedback without announcing sensitive content.
  Handle unavailable/denied clipboard access without exposing secrets elsewhere.
- Use appropriate autocomplete, input mode, and input type. Preserve paste and
  password-manager behavior unless a documented security contract requires more.
- Keep localization coherent across visible text, accessible labels, formatting,
  and calendar behavior. For example, week-start configuration must affect both
  shortcut calculations and the displayed calendar.

## 5. A real playground, not only a demo

Use `components/component-playground.tsx` as the standard shell. Each component
must provide a typed preview adapter, metadata/defaults, and code generator using
the established `lib/*-playground.ts` pattern. Shared family infrastructure is
allowed if it preserves this full contract; do not duplicate the shell.

The playground must include:

1. A clearly framed live preview with suitable space for the component.
2. Labeled controls for meaningful public configuration.
3. Reset to a fresh default configuration.
4. Generated code reflecting the configuration shown in the preview.
5. Copy code and a complete, runnable demo with required imports, state, handlers,
   and types. Include a client directive when required by the target environment.
6. Brief guidance for non-obvious behavior or demo limitations where needed.

Choose useful controls, not every possible native prop. Examples:

| Family                 | Meaningful controls/scenarios                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| Input/TextArea         | Label, placeholder, label style where supported, disabled, read-only, invalid, adornments/rows          |
| Password/Search/Secret | Shared field states, clearability where supported, visibility/copy behavior                             |
| Amount                 | Separators, prefix/suffix, decimal scale, fixed decimals, negative values                               |
| Phone                  | Default country, locale, disabled/read-only, visible normalized-value feedback                          |
| OTP                    | Length, alphabet, disabled/invalid, completion feedback                                                 |
| Popover                | Placement, alignment, open state, dismissal/composition examples                                        |
| Calendar/Date pickers  | Selection mode where supported, locale, bounds/disabled dates, clearability, week start, range features |

Requirements:

- Preview and generated code must share configuration/defaults. Do not maintain
  unrelated hardcoded snippets that drift from the preview.
- Distinguish configurable props from transient user interaction. Specify what
  Reset restores; reset transient state too when necessary for a predictable demo.
- Generated JSX must safely serialize strings and omit unsupported props.
- Keep the configured behavior reproducible. If transient values are not serialized
  into code, make that limitation clear rather than implying an exact snapshot.
- Do not call a single fixed preview a playground. Do not discard generated-code
  children through a custom documentation renderer.
- Verify Customize, Reset, Copy, and representative combinations on mobile too.

## 6. Documentation completeness

Use the shared generator in `lib/component-docs.ts` and the
`ComponentDocumentation` renderer. Preserve the standard order:

```text
Playground
Installation
Dependencies (when applicable)
Usage
Examples / component-specific guidance
Behavior & Accessibility
Props
Source
Credits (when applicable)
```

The MDX supplies Usage, examples, and behavioral guidance between the generated
sections. Do not manually duplicate Installation, Props, or Source.

### Usage and examples

Use the unified preview-and-code frame supplied by `ComponentPreview` for every
runnable documentation example: one rounded border, centered preview, divider,
and collapsible source. Do not add a second border, presentation padding, or
centering wrapper in MDX or a demo just to style its surrounding preview. Layout
wrappers inside demos remain appropriate for related controls, hints, and output;
keep these inside the preview. `name` or `src` identifies the source, and `title`
supplies the filename:

```mdx
<ComponentPreview name="input-phone-demo" title="input-phone-demo.tsx">
  <InputPhoneDemo />
</ComponentPreview>
```

- Provide the simplest valid usage and enough context to reproduce it. Clearly
  distinguish an illustrative fragment from a complete runnable example.
- Add focused, runnable examples through `ComponentPreview` and `examples/`.
  Select scenarios by actual API and complexity, not by a fixed example count.
- Cover materially different states/configurations, controlled versus uncontrolled
  usage where supported, validation and helper text for fields, and composition or
  form integration where relevant.
- Explain behavior beside the example: what happens, when callbacks fire, and any
  important limitation. Do not leave these facts buried in Source.
- For transactional controls, show draft, commit, cancel, dismissal, and clearing.
- For normalized values, show what the application receives, not only the formatted
  appearance. Never expose real secrets or private data in examples.

### Props reference

- Document every component-specific public prop, required props, and selected
  native props essential to using the component. Do not enumerate the entire React
  API merely to make the table longer.
- Include value/defaultValue/change callbacks, configuration, labels, and relevant
  open-state/composition APIs. Explain which subcomponent owns each prop.
- Match types and defaults to the implementation, including optionality and
  readonly collections. Never invent a default from the demo configuration.
- Do not present a CSS property as a supported React prop.
- State inherited primitive/native API boundaries and link relevant upstream docs.
  Scope generic forwarding statements accurately for restricted APIs.

### Attribution and navigation

- Add truthful credits for adapted code and upstream contributions where applicable;
  distinguish dependency usage from copying/adapting source and preserve licenses.
- Register the component consistently in `registry.json`, docs metadata, and any
  existing discovery surfaces. Inspect existing discovery tests rather than assuming
  a new registry entry automatically provides a polished gallery preview.
- The home gallery discovers `examples/<registry-name>-demo.tsx` automatically.
  Export the matching `<ComponentName>Demo` (case-insensitive after removing name
  hyphens), and keep that default demo suitable for a narrow gallery card. Missing
  demo files retain the documentation fallback; existing demos with invalid exports
  or import failures must not silently fall back.

## 7. Verification and acceptance

Follow `frontend-workflow.md`: use the agreed primary dev server and OpenChamber
browser panel. Do not guess ports, start another server, or run Playwright without
approval. If the server is unavailable, report the missing visual evidence.

Choose fresh checks proportional to risk:

- Typecheck public APIs and consumer usage. Include client-boundary and registry
  integration checks when relevant; a client playground alone is insufficient.
- Add focused runtime tests for meaningful state transitions, normalization,
  validation, callbacks, ref/event composition, security, and regressions.
- Test code-generator/preview parity, default state, reset-relevant logic, and safe
  serialization for configurable playgrounds.
- Test names must match assertions. A test claiming Cancel or failure behavior
  must actually exercise and verify it.
- Check formatting/lint and production/registry build when packaging or route
  integration changes. Documentation-only edits need formatting and link checks,
  not an unnecessary full application build.
- Inspect rendered desktop/mobile and light/dark states, keyboard flow, long
  content, and reduced motion where applicable. Do not claim visual verification
  from reading class names or running DOM-only tests.

### Definition of done

- [ ] Public API, native semantics, client boundary, refs, and callbacks are correct.
- [ ] Registry entry, install targets, dependencies, and supporting files are complete.
- [ ] Visual states match sibling components and supported themes/layouts.
- [ ] Labels, errors, focus, keyboard, and asynchronous feedback are accessible.
- [ ] A real playground provides controls, Reset, synchronized code, and Copy.
- [ ] Usage and focused examples cover the component's meaningful scenarios.
- [ ] Props, defaults, behavior, limitations, and attribution are accurate.
- [ ] Fresh automated checks and browser evidence cover the applicable risks.
- [ ] Handoff separates verified results from remaining limitations or blockers.

Do not present a minimally wired component as polished or fully complete while
these applicable gates are unmet. When scope intentionally omits a gate, explain
the omission and obtain agreement rather than silently lowering the standard.
