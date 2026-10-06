# Vandor UI Toast: approved design

Date: 2026-10-06

Status: approved; presentation amended by user feedback on 2026-10-06.

## Goal and scope

Deliver a smooth, modern, premium Toast registry component with adaptive morphing,
plus an optional TanStack Query v5 adapter in the first release. Preserve the
existing Vandor documentation surface and follow the repository's component and
distribution standards.

Implementation is intended for local `main`. The selected workflow is direct,
inline implementation after design approval, without subagents or a worktree.
The user subsequently requested this written spec as a durable record; that does
not automatically authorize an implementation plan, commit, or implementation.

## Architecture and ownership

- Use public Base UI Toast APIs for state, lifecycle, interaction, and the
  accessibility foundation. Use Motion for the custom visual renderer.
- Build the renderer independently. Sileo and Toastiva are visual references,
  not source-code dependencies. Do not copy their source. Credit visual inspiration
  truthfully, without claiming adapted code or an unverified upstream license.
- Keep distributable source separate from the website's internal UI.
- Expose `ToastProvider`, `Toaster`, and an imperative `toast` API.
- Mount the provider and toaster once at the application root, above route-owned
  components. The imperative API must work from event handlers and non-component
  code without recreating Sileo's custom notification store and timer engine.
- Establish the public Base UI manager/provider integration from actual dependency
  exports and types before coding. If the approved API cannot be supported safely,
  report the conflict instead of silently changing the architecture.
- Core Toast must not depend on TanStack Query. Distribute its v5 adapter as a
  separate, optional registry item.

## Adaptive presentation

1. A title-only notification remains a compact pill. Never expand an empty body.
2. A notification with description or action appears as a pill and smoothly opens
   a continuous stepped body, matching the user's second visual reference. There
   is no narrow neck or gap: the header sits on the outer edge of the body and a
   concave shoulder joins the wider body. Right/left placements mirror the header;
   bottom placements open upward. Center placement uses a centered header.
3. Once opened, the body stays visible until dismissal. Do not run an automatic
   expand-collapse-dismiss cycle or require hover to read the message.
4. Loading starts as a pill and updates in place to success/error. Open a body only
   when the resulting content needs one. Do not create a second toast for the result.
5. Motion communicates entry, exit, content changes, and stack changes. It must be
   interruptible and honor reduced-motion preferences, including SVG animations.
   Avoid excessive bounce or decorative choreography.

## Stack

- Show one active notification. Older notifications wait without rendering cards.
- No hover/focus expansion and no scrolling list of notifications.
- Queued notifications are represented by a compact stack icon/count beside a
  separate close-all button in the free header area, matching the third reference.
- Closing or expiry of the active notification reveals the next queued message
  immediately through content crossfade inside a persistent shell. Hover/focus pauses expiry.
- Notifications beyond the visible limit remain queued; a visual cap is not
  permission to discard messages. Older notifications and their actions must be
  reachable by sequential dismissal of newer messages.
- Ensure bounded rendering and predictable dismissal under bursts. Exact overflow
  layout and timer behavior for queued, not-yet-presented notifications must be
  resolved explicitly during implementation review before declaring completion;
  messages must not expire unseen.

## Placement and responsive behavior

- Default desktop position: top-right.
- Default mobile position: top-center.
- Support explicit top-left, top-center, top-right, bottom-left, bottom-center, and
  bottom-right placement overrides.
- Respect safe areas and viewport edges. Long titles/descriptions and action
  controls must fit narrow viewports without horizontal page overflow.
- Use the project's existing responsive conventions rather than introduce an
  arbitrary new breakpoint without checking surrounding code.

## Visual treatment

- Use contrasting surfaces: dark toast in light theme, light toast in dark theme.
- Keep text neutral and readable; status color is primarily conveyed through
  icons/badges, with colors selected for contrast on both surfaces.
- Cover success, error, warning, info, loading, and action-bearing notifications.
- Maintain Vandor typography, spacing, icon vocabulary, and purposeful depth.
  Morphing supplies the distinctive character; avoid decorative glow or glass.

## Duration and dismissal

| Content/state | Default |
| --- | --- |
| Title only, including error | 3 seconds |
| Description or action, including error | 4 seconds |
| Loading | Persistent until resolved or explicitly dismissed |

- Only loading is persistent by default; explicit `duration: 0` remains supported.
- A 2px inset countdown line follows the pill/body bottom, pauses with the timer,
  resets on presentation, and is omitted for loading or explicit persistence.
- Shell and controls stay mounted during arrivals and queued dismissal/swipe.
  Content crossfades; new arrivals use a small content shift and one badge pulse.
  Only empty-to-first and last-to-empty transitions animate the whole shell.
- Allow per-toast duration overrides. After a loading toast resolves, apply the
  resulting state's duration unless the caller supplies an override.
- Hover/focus pauses automatic dismissal. Do not dismiss a toast while its action
  is being used.
- Provide an accessible close control on every toast and swipe-to-dismiss.
- A completed swipe exits in its swipe direction from the existing drag offset;
  never recenter before removal. Swipe exits must not create page scrollbars.
- Explicit dismissal during an asynchronous operation must not cause its later
  resolution to unexpectedly resurrect the dismissed notification.

## Navigation and overlay guarantees

- Preserve live notifications and loading-to-result updates across client-side
  page changes while the root provider remains mounted.
- Full reload persistence, session storage, and notification history are out of
  scope. A full reload resets toast state.
- Version one guarantees visibility and interactive close/actions above Vandor
  Dialog and Drawer, including a toast created before the modal opens and
  notifications created while the modal is open.
- Do not rely on a large z-index alone: address portal ownership, modal inertness,
  focus behavior, and overlay layering using supported APIs.
- Preserve modal semantics and focus restoration; solving toast access must not
  make the rest of the background interactive.
- Native HTML dialogs, browser popovers/top-layer elements, and third-party modal
  libraries do not receive a universal compatibility promise. Document integration
  boundaries and verify any additional support separately.

## Public API direction

Common usage stays concise and familiar:

```tsx
toast.success("Perubahan tersimpan");

toast.error("Gagal menyimpan", {
  description: "Coba kembali beberapa saat lagi.",
});

toast.promise(saveChanges(), {
  loading: "Menyimpan…",
  success: "Perubahan tersimpan",
  error: "Gagal menyimpan",
});
```

- Provide equivalent status methods for info, warning, and loading, plus supported
  update/dismiss operations needed by async workflows.
- Preserve identity when updating a notification. Document identifiers, action
  configuration, callbacks, defaults, and return values from the implemented API.
- This snippet fixes the common API shape, not every advanced type signature.
  Any substantial API departure requires renewed user approval.
- Action and close controls must be independently keyboard-accessible, without
  nested interactive elements.
- Use appropriate asynchronous announcements without duplicate announcements or
  unwanted focus stealing. Status must not rely on color alone.

## Optional TanStack Query v5 adapter

Include the adapter in version one, as a separate registry installation. Integrate
through supported TanStack Query APIs and opt-in query/mutation metadata.

### Mutations

- Configured mutations create one loading notification, then update that same
  notification to success or error.
- Support text messages and message functions derived from results/errors.
- Preserve application cache callbacks and per-operation callbacks. Do not
  overwrite existing application behavior or change operation results.
- Keep overlapping mutations independent and avoid duplicate notifications.

### Queries

- Notify only when explicitly configured; no default success toast for background
  refetch and no automatic loading toast for every query.
- Report configured query errors after retries are exhausted, with deduplication.
- Prefer skeletons or inline indicators for normal query loading. Optional query
  notifications must not turn routine background work into notification spam.

### Error safety and lifecycle

- Do not display raw errors, stack traces, server payloads, or potentially sensitive
  details by default. Use safe fallback wording and explicit caller message mapping.
- Mount integration with the long-lived application QueryClient/root provider, not
  a page-local observer whose unmount would lose feedback during navigation.
- Document retry, deduplication, concurrent operation, dismissal, callback
  composition, and error-message behavior in the actual adapter contract.

## Required delivery

- Public Toast implementation, all supporting distributable files, core registry
  item, and separate optional TanStack Query adapter registry item.
- Typed portable Toast stories and separate optional stories registry item; normal
  installation must not install Storybook packages.
- A real playground using the established shared shell, meaningful configuration,
  Reset, Copy, and generated runnable code synchronized with the preview.
- Documentation in the existing generated structure: installation/dependencies,
  usage, focused examples, behavior/accessibility, public props/API, source, and
  truthful credits.
- Focused examples for compact and detailed notifications, actions, async outcomes,
  stack bursts, navigation persistence, Dialog/Drawer integration, and adapter
  usage. Keep the default gallery example usable inside a narrow card.
- Document root placement, theme/styling requirements, supported dependency versions,
  and complete installation graphs without website-only dependencies.

## Acceptance evidence

Follow `.agent/frontend-workflow.md`, `.agent/component-implementation.md`, and
`.agent/registry-distribution.md`, including strict memory safety and serial heavy
checks. No new server, alternative browser, or Playwright without user approval.

- Fresh TypeScript checks against public dependency APIs and consumer imports.
- Focused durable runtime tests for toast identity, duration selection, dismissal,
  async transitions, queued feedback, adapter opt-in/deduplication, callback
  preservation, concurrent operations, and safe error messages where meaningful.
- Playground configuration/code parity, Reset, and safe serialization checks.
- Registry generation, artifact validation, isolated consumer compilation and
  applicable real CLI installation checks, including optional stories targets.
- Primary-browser evidence for desktop/mobile, both themes, long content,
  keyboard/action access, queue progression/close-all, reduced motion, Dialog/Drawer layering,
  and client-side navigation persistence.
- Storybook types and meaningful portable composition checks. Storybook UI is not
  verified because this repository has no Storybook server; state this limitation.
- Report missing evidence and any integration limitations rather than claiming
  universal compatibility or completion from typechecking alone.

## Out of scope

- A separately published npm toast library or complete Sileo fork.
- Copying Sileo/Toastiva source or relying on an unverified source license.
- Website redesign, unrelated component/API migrations, audio, or haptics.
- Automatic toasts for every query/refetch.
- Persistence across full reloads or guaranteed compatibility with all modal systems.

## Written-spec review

The agreed feature decisions above are durable. Two implementation details require
careful resolution using the actual APIs: compact-stack overflow/timer mechanics
and modal-safe placement/focus integration. If resolving them requires changing an
approved behavior, stop and ask the user. This spec does not claim either mechanism
has already been implemented or verified.
