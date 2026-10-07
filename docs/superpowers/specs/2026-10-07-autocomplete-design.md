# Autocomplete registry component

Date: 2026-10-07
Status: Written specification approved by the user in conversation.

## Goal

Add a polished Vandor UI registry autocomplete with concise common usage and an
advanced composable API. Use ReUI's Base UI autocomplete as a design reference,
not as an obligation to copy its API or styling. Preserve Vandor's tokens, field
appearance, component documentation system, and distribution conventions.

The component supports free text and constrained selection, each with single and
multiple values. The public API must distinguish application values from search
queries, infer item types, and avoid consumer casts to `unknown`.

## Approved decisions

- Ready-to-use `Autocomplete` plus named compound components.
- `mode="free-text"` by default; `mode="selection"` for constrained selection.
- `multiple` is supported in both modes, not just selection.
- Selection callbacks return original items rather than IDs.
- Single selection retains its committed item while searching. Blur/Escape restores
  its label if no replacement was selected.
- Free-text tags commit on Enter, not blur or comma. Paste is not split into tags.
- UI follows Vandor Input/Select rather than introducing a separate visual system.
- Application-owned fetching, with grouping, custom items, and async state support.

## Public value contract

| Mode      | Multiple      | Application value | Empty value |
| --------- | ------------- | ----------------- | ----------- |
| free-text | false/omitted | `string`          | `""`        |
| free-text | true          | `string[]`        | `[]`        |
| selection | false/omitted | `Item \| null`    | `null`      |
| selection | true          | `Item[]`          | `[]`        |

Use discriminated generic props/overloads so these combinations determine
`value`, `defaultValue`, and `onValueChange`. Literal mode/multiple settings must
produce correctly inferred callbacks; invalid combinations must fail typechecking.
When flags are runtime unions, consumers must narrow them or handle the resulting
union explicitly. Do not hide an unsafe broad callback behind a type assertion.

`value` means committed application value in all combinations. Controlled values
are authoritative; callbacks request changes rather than mutating supplied values.
`defaultValue` initializes uncontrolled state. Arrays passed by consumers must not
be mutated, and readonly item collections must be accepted.

### Basic usage

```tsx
<Autocomplete items={["React", "Vue", "Svelte"]} label="Framework" />

<Autocomplete
  mode="selection"
  items={users}
  getItemLabel={(user) => user.name}
  getItemValue={(user) => user.id}
  value={assignee}
  onValueChange={setAssignee}
  label="Assignee"
/>

<Autocomplete
  multiple
  items={suggestedTags}
  value={tags}
  onValueChange={setTags}
  label="Tags"
/>

<Autocomplete
  mode="selection"
  multiple
  items={users}
  getItemLabel={(user) => user.name}
  getItemValue={(user) => user.id}
  value={assignees}
  onValueChange={setAssignees}
  label="Assignees"
/>
```

These are API fragments, not complete runnable consumer demos. Delivered examples
must include imports, state, types, and client directives where necessary.

### Items and identity

- `items` accepts a readonly flat collection; strings work without accessors.
- Object items require `getItemLabel` and `getItemValue`. The latter returns a
  stable string ID used for equality, React keys, and form serialization.
- Free-text suggestions commit their label string, not their object or ID.
- Selection commits the original item from the current source collection.
- Matching a selected object to newly fetched instances uses its stable ID.
  Consumers must supply unique IDs; duplicate labels are allowed in selection.
- Multi selection preserves insertion order and rejects duplicate IDs.
- Free-text tags are trimmed on commit and reject empty strings and exact,
  case-sensitive duplicate committed strings. Choosing a suggestion follows the
  same tag normalization rule.
- `renderItem(item)` customizes visual content without changing label, identity,
  filtering, or submitted value.
- `groupBy(item)` supplies a string group label. Preserve first-seen group order
  and source order within each group; omit groups without matching items.
- `isItemDisabled(item)` disables individual suggestions without changing identity.

### Query and callbacks

For free-text single, `value` is also the input text. Do not expose a second
competing controlled query for this combination.

For selection and both multiple combinations, expose `inputValue`,
`defaultInputValue`, and `onInputValueChange` for the separate query/draft.
Changing a query alone must not call `onValueChange`.

`onValueChange(nextValue)` fires for a real edit/commit/removal/clear affecting the
application value. Highlighting, opening, failed duplicate commits, or searching
without selecting are not value changes. Controlled query cleanup is requested
through `onInputValueChange`; consumers must update their state to reflect it.
Do not promise an additional cancelable event-details contract unless it is
explicitly designed and documented in the implementation plan.

Selection values remain renderable and serializable when absent from a new
`items` collection. Use the committed object and accessors for its label/ID;
never silently clear it when async results change.

### Configuration and prop ownership

Provide useful configuration without making the convenience API an arbitrary
pass-through for every underlying root prop:

- Field: `label`, `labelStyle` (`static` default, or `floating`), `placeholder`,
  `size` (`default` or `sm`), `disabled`, `readOnly`, `required`, `name`, `form`.
- State: `invalid`, `loading`, `error` (displayable error content),
  `emptyMessage`, `loadingMessage`, and accessible clear/remove labels.
- Interactions: `clearable` (false default), `showTrigger` (true for selection,
  false for free-text), `autoHighlight` (false default), controlled/uncontrolled
  `open` and its change callback.
- Filtering: default label-based, case/accent-insensitive matching;
  `filter(item, query)` for custom matching, `filter={null}` for externally
  filtered/server results. Do not create a separate fuzzy-search engine.
- Popup: `animated` (true default); `contentProps` owns positioning and popup
  styling. Portal, collision handling, and available-height scrolling use Base UI.
- `className` owns the outer field container. `inputProps` owns input-native
  attributes, handlers, ARIA descriptions, and ref; `contentProps` owns the popup.
  Types must exclude conflicting managed state/children/behavior props rather
  than allowing two sources of truth.
- The top-level ref targets the editable input. Merge it with `inputProps.ref`
  and internal refs. Document this target and all class/prop ownership.
- Without `label`, require consumers to supply an accessible name through input
  ARIA attributes. Placeholder alone is not a label.

The Vandor `mode` must not be forwarded to Base UI's unrelated inline-completion
`mode` prop. Inline autocomplete is not part of this initial public contract.

## Interaction contract

### Free-text single

Typing changes the string value immediately. Selecting a suggestion replaces the
text and closes the popup. Blur retains typed text and does not force a selection.
Clear resets the value to `""`. No selected-object state is exposed.

### Selection single

Typing changes only the query. The last committed choice remains the value until
a new item is chosen or Clear is used. Selecting an item commits it, displays its
label, and closes the popup. Blur/Escape discards an uncommitted query and restores
the committed label, or an empty input when there is no choice. Clear resets both
the selection and query.

### Multiple, both modes

Committed values appear as removable chips. Choosing/creating a valid new value
appends it, clears the draft, and keeps the popup open. Existing values are not
reordered or mutated. Selection multiple offers only known items; free-text
multiple can create strings. Clear removes every committed value and the draft.

Free-text multiple retains an uncommitted draft on blur and popup dismissal.
Selection multiple discards its uncommitted query on blur/Escape. Drafts are never
submitted as form values.

### Keyboard, focus, and composition

- Prefer accessible Base UI behaviors rather than recreating list navigation.
- Arrow keys navigate available suggestions; Enter chooses the highlighted item.
- In free-text multiple, Enter with no highlighted suggestion commits a valid
  trimmed draft. With an unavailable/disabled highlighted item, do not fall
  through to accidentally committing its label as a new tag.
- During IME composition, Enter does not select or create a tag. Guard the
  composition-ending key event as appropriate for browser behavior.
- A handled selection/tag Enter must not also submit the owning form. Ordinary
  free-text single Enter without a highlighted suggestion retains native form
  submission behavior.
- Escape dismisses the popup with the mode-specific query behavior above.
- Tab follows normal focus flow; it does not create tags.
- When draft is empty, first Backspace focuses the last removable chip rather
  than deleting immediately. A subsequent Delete/Backspace on that chip removes
  it and moves focus to the prior chip or input. Nonempty draft edits text normally.
- Chips and removal actions support accessible keyboard focus. Removal keeps focus
  predictable. Icon-only buttons have meaningful accessible names.
- Disabled prevents interaction and follows native disabled form exclusion.
  Read-only preserves values/submission/focus but blocks edits, choosing, clear,
  removal, and value-changing shortcuts.
- Consumer refs and event handlers are preserved and composed. Respect caller
  cancellation where supported; no decorative wrapper intercepts native typing.

## Async and status contract

The application owns requests, debounce, cancellation, stale-response prevention,
and caching. Examples demonstrate deterministic request behavior with cleanup,
including an error case, without random network failures.

`loading` and `error` suppress committing suggestion results that may be stale;
they do not disable the editable input or erase committed choices. Free-text
users can still edit/create their own text. Status presentation has precedence
error, then loading, then empty results, then populated results. Never display
"no results" while loading or error is active. Use an accessible status region for
async feedback, not repeated announcements on every unrelated render.

`filter={null}` prevents secondary filtering of server results. Error text can
coexist with the field's invalid state but must not silently redefine the value.
The initial release does not own retry fetching; an application can use advanced
composition to provide a retry action.

## Forms and reset

- Single free-text submits its string; single selection submits the stable ID.
- Multiple values submit repeated entries under the same `name`, preserving order.
  Empty multiple values produce no entries; empty singles submit an empty string.
- Required selection checks committed choice, not a nonempty uncommitted query.
  Required multiple checks at least one committed value, not draft length.
- Form ownership supports the external `form` attribute.
- Native reset restores uncontrolled default committed values and their initial
  query/draft; closed popup, cleared temporary highlight, and correct floating
  label state follow reset.
- Controlled state remains application-owned on reset. Documentation includes a
  working controlled reset example rather than pretending native reset can
  overwrite controlled props.
- Consumer input refs can focus the control. Help/error descriptions are associated
  through ARIA; invalid and read-only are not treated as disabled.

## Architecture and composition

Use the installed public `@base-ui/react` APIs. Base UI 1.8 provides autocomplete,
combobox, and combobox chips primitives. Validate public exports/types before
implementation; do not import its private `AriaCombobox` internals.

- Free-text single uses autocomplete semantics.
- Selection single/multiple use combobox semantics.
- Free-text multiple uses a bounded adapter for string tags and draft commits,
  built on public primitives with focused behavioral regression tests.
- Share field, popup, item, status, and chip styling/ownership where possible.
  Avoid two implementations drifting between convenience and compound usage.
- Named exports include `AutocompleteRoot`, `AutocompleteInput`,
  `AutocompleteContent`, `AutocompleteList`, `AutocompleteItem`,
  `AutocompleteGroup`, `AutocompleteGroupLabel`, `AutocompleteEmpty`,
  `AutocompleteStatus`, `AutocompleteClear`, `AutocompleteTrigger`,
  `AutocompleteChips`, `AutocompleteChip`, and `AutocompleteChipRemove`.
- Compound components honor the same Vandor mode/value/query contract, with chip
  parts supported only under a multiple root. Advanced docs must include actual
  typed, runnable compositions, not incompatible primitive parts from two roots.
- Keep pure identity/normalization/state helpers separately testable if extraction
  improves clarity. Register any supporting distributable files.
- Require a client boundary and preserve consumer class overrides through `cn`.
  Avoid website-only imports or dependency expansion into an unrelated catalog.

## Visual design

Follow sibling Input/Select tokens and surfaces: default field height 36px, compact
32px, existing border/radius/text scale/focus/invalid treatment. Static labels are
default; floating labels support empty/populated/focused/reset states without
overlap. Icons/clear/trigger actions anchor to the control, not label wrapper.

Popup width follows the field, with a bounded scrollable list, concise spacing,
clear keyboard highlight, muted group headings, and readable custom rich items.
Use restrained reveal/exit motion consistent with Vandor, interruptible and
reduced-motion-aware. Do not animate ordinary query edits.

Multiple chips wrap within the field; input retains usable room. Long text and
labels must not cause page overflow, obscure removal actions, or hide accessible
content. Check narrow containers, zoom, touch interaction, light/dark contrast,
overlay collisions/layering, and long result lists.

## Delivery

- Public source in `registry/new-york/`, separate from internal `components/ui/`.
- `autocomplete` registry item with complete runtime/support dependencies.
- Portable typed `autocomplete.stories.tsx`, distributed as an independent
  `autocomplete-stories` item; component installation stays Storybook-free.
- Standard playground adapter and typed metadata/code generator. Expose mode,
  multiple, label/style, placeholder, size, disabled/read-only/invalid,
  clearability, trigger, grouping, animation, and status scenarios with meaningful
  preview/code effects. Reset restores configuration and transient values/draft.
- Shared generated documentation order: Playground, Installation, dependencies,
  Usage, examples, Behavior & Accessibility, Props, Source, truthful credits.
- Runnable examples cover all four value contracts, custom rich/grouped items,
  controlled/uncontrolled ownership, deterministic async/error behavior,
  validation/form submission/reset, and advanced composition.
- A narrow-card-friendly `examples/autocomplete-demo.tsx` exports
  `AutocompleteDemo` for automatic gallery discovery.
- Attribute ReUI as a design/reference source; preserve upstream license notices
  if code is actually adapted, and distinguish dependency usage from copied code.
- Generate artifacts through `registry:build`, never hand-patch `public/r/`.

## Verification and acceptance

Follow `.agent/frontend-workflow.md`, `.agent/component-implementation.md`, and
`.agent/registry-distribution.md` throughout implementation.

1. Typecheck all four combinations, object inference, readonly items, controlled
   callbacks, and intentional invalid API combinations. Verify public/client imports.
2. Focused durable tests cover value/query separation, blur/Escape restoration,
   tag normalization/duplicates, stable-ID selection, chips/focus/keyboard/IME,
   disabled/read-only, refs/event composition, status gating, forms and reset.
3. Test playground exposed controls, real adapter/code parity, safe serialization,
   and fresh Reset. Typecheck runnable generated consumer examples, not just syntax.
4. Typecheck stories with actual Storybook types and use portable composition for
   representative behavioral/rendering checks. No Storybook server is present;
   Storybook UI verification is not performed and is not a blocker.
5. Validate generated items and dependency graph. Use isolated consumer compilation
   and real shadcn CLI installation with a nondefault alias/layout; verify the
   stories-only item preserves an already customized component. Include a Next.js
   Server Component import to establish client-boundary compatibility.
6. Fresh formatting/lint, repository typecheck, relevant regression checks, registry
   build and production build, sequentially with bounded resources/deadlines.
7. Browser inspection via OpenChamber at the user's agreed primary server URL:
   desktop/mobile, light/dark, keyboard/touch, labels/chips/long content, popup
   positioning, status scenarios, and playground Customize/Reset/Copy.

Ask for the existing primary server URL before browser verification. Do not guess
ports, start/restart servers, launch Playwright, or stop user processes. Report
missing evidence rather than upgrading DOM/type tests into visual claims.

Tests inherit `NODE_OPTIONS="--max-old-space-size=512"`, use one worker, begin with
one focused file/pattern, and have a process-tree deadline. Other Node checks use
explicit budgets at most 2048 MiB and finite deadlines. Heavy checks never run in
parallel. No large DOM/React assertion output, automatic OOM retries, or increased
heap limits. Distinguish artifact validation, consumer compilation, CLI installation,
browser verification, and accepted Storybook UI limitations in the handoff.

## Non-goals

Virtualization, draggable/reordered chips, comma delimiters, splitting pasted text,
inline text completion, application-owned data fetching inside the component,
creating arbitrary new objects in selection mode, unrelated component redesigns,
and installing/launching Storybook or alternate browser tooling.

## Next gate

Review and approve this written specification before producing the implementation
plan. The plan groups atomic tasks into explicit execution batches with goals,
dependencies, and acceptance gates. Exactly one final batch owns the full-plan
audit and repository-wide integrated gate. Branch/execution mode selection occurs
before implementation, not implicitly while writing this specification.
