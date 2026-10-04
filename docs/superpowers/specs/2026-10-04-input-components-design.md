# Vandor UI input components specification

Date: 2026-10-04

Status: Written specification approved by the user on 2026-10-04.

Workflow: Specification only. This document is not an implementation plan and does
not authorize implementation, dependency installation, migration, or publication.

## Purpose and reference

Add a reusable family of form inputs and date selection controls to Vandor UI's
installable registry. Use the user's production application at
`/home/alfarizi/dev/work/ozone/valcentra/packages/components/src/base/` as a
behavioral reference, not as code to copy without adaptation.

The selected approach is selective adaptation: retain useful Valcentra patterns
while defining explicit public contracts appropriate for Vandor's existing React,
Base UI, Motion, and theme-token conventions.

Important intentional differences from the reference:

- InputAmount gains formatting through react-number-format instead of merely
  decorating a native decimal-text input.
- DateRangePicker uses an explicit Apply/Cancel transaction.
- OTP completion notifications are tied to user value changes, not rerenders.
- Application-specific theme props and CSS variables are not carried over.
- InputPhone retains Valcentra's public digits-without-plus value convention.

## Scope

Twelve primary components:

| Export          | Registry item     | Responsibility                            |
| --------------- | ----------------- | ----------------------------------------- |
| Input           | input             | Native input with optional label and icon |
| TextArea        | textarea          | Native multiline text input               |
| InputGroup      | input-group       | Composable adornments and input actions   |
| InputPassword   | input-password    | Password entry with visibility toggle     |
| InputSearch     | input-search      | Search entry with optional clearing       |
| InputAmount     | input-amount      | Formatted decimal-text entry              |
| InputPhone      | input-phone       | Country-aware phone entry                 |
| InputOTP        | input-otp         | One-time code entry with visual cells     |
| InputSecret     | input-secret      | Secret entry, visibility, and copying     |
| Calendar        | calendar          | Calendar date selection                   |
| DatePicker      | date-picker       | Single-date popup selection               |
| DateRangePicker | date-range-picker | Transactional date-range selection        |

One supporting component, Popover (`popover`), supplies reusable Base UI popup
composition and is independently installable and documented.

Each item must be installable without requiring unrelated input components.
Transitive registry dependencies are permitted and must be declared explicitly.

Excluded: business validation, mandatory form-library integration, authentication
or OTP delivery, backend services, file upload, rich text, time selection, manual
date-text parsing, and migration of Valcentra or the website's internal inputs.

## Repository integration and dependencies

- Distributable components live in `registry/new-york/` and install into consumers'
  `components/ui/` directory.
- Preserve separation from `components/ui/`, which serves the Vandor website.
  Do not replace its existing Input as a side effect of this work.
- Register source targets, package dependencies, and registry dependencies in
  `registry.json`; regenerate distribution artifacts using repository commands.
- Existing Button and Select are reused through their public APIs. Popover uses
  public Base UI APIs, not undocumented internals.
- Use Vandor theme tokens, `cn`, and existing styling conventions. Do not add
  `theme="app" | "pay"` or Valcentra-only component variables.
- Package APIs and compatible versions must be verified before implementation;
  this specification does not assert an unverified version pin.

| Package             | Consumers                           | Purpose                                       |
| ------------------- | ----------------------------------- | --------------------------------------------- |
| react-number-format | InputAmount                         | Formatting, editing, and caret management     |
| libphonenumber-js   | InputPhone                          | Country metadata and phone formatting/parsing |
| react-day-picker    | Calendar                            | Calendar engine and accessible day selection  |
| date-fns            | DatePicker, DateRangePicker         | Date display and calendar shortcuts           |
| @base-ui/react      | Popover and existing primitives     | Accessible popup behavior                     |
| motion              | Animated labels/popups where needed | Reduced-motion-aware transitions              |

Additional packages are declared only for the items that need them; dependencies
of referenced registry items remain transitively available.

## Shared public contracts

- Native-value wrappers retain native `value`, `defaultValue`, and `onChange`.
- Transformed-value components use `value`, `defaultValue`, and `onValueChange`.
- Value-bearing components support controlled and uncontrolled usage. Controlled
  changes and external resets update the display without emitting callbacks just
  because props changed. Control mode does not switch during a mounted lifetime.
- Wrappers preserve applicable native props, event handlers, `id`, `name`,
  `aria-*`, and refs. Button actions always use `type="button"`.
- Caller-supplied accessible names take precedence over generated defaults.
  Visible labels associate with the actual editable control or trigger.
- Disabled, invalid, focus, and readOnly states are distinguishable and consistent
  with existing tokens. Invalid styling alone does not imply business validation.
- Description/error text can be associated through `aria-describedby`.
- Native form reset restores uncontrolled values and corresponding visual state;
  controlled resets remain the caller's responsibility.
- Controls with transformed values document the distinction between their callback
  values and native form submission. Applications submit transformed values from
  state or their own hidden fields; automatic hidden-field serialization for
  amount, phone, and date pickers is not part of this scope. Do not present a
  formatted native input value as equivalent to the raw callback value.
- Responsive layout must avoid clipped labels, actions, or popup content. Motion
  is restrained and respects prefers-reduced-motion.

## Component behavior

### Input

Accept native input props plus `label`, `labelStyle`, `icon`,
`containerClassName`, and `labelClassName`.

`labelStyle` supports `floating` and `static`, defaulting to floating when a label
is present. Without label or adornments, render a normal input without unnecessary
field layout. Floating labels stay elevated while focused or nonempty, including
default values, external controlled replacements, browser autofill, and resets.
Hidden placeholders must not collide with resting labels. Static labels and icons
must align correctly together. The forwarded ref points to the native input.

### TextArea

Export `TextArea` from `textarea.tsx`, with native textarea props, an optional
static label, and field/label class overrides. Preserve native resizing and refs.
Floating labels and automatic height measurement are not part of this scope.

### InputGroup

Provide InputGroup, InputGroupInput, InputGroupTextarea, InputGroupAddon,
InputGroupText, and InputGroupButton composition. Addons support inline-start,
inline-end, block-start, and block-end alignment. Grouped editable controls retain
native input/textarea semantics; the group is not a replacement value owner.
Noninteractive decoration must not add keyboard stops. Interactive addons retain
their own accessible names and correct button types. Group focus/invalid styling
must not create doubled borders or rings.

### InputPassword

Build on Input's native-value contract. Hide the password by default and provide
an accessible show/hide action reflecting its state. Toggling must not erase the
value, move the caret unnecessarily, or submit the form. Preserve caller-provided
autocomplete attributes and password-manager behavior. No built-in strength or
policy validation. Disabled disables visibility actions; readOnly permits them.

### InputSearch

Build on Input with search semantics and a decorative search icon. `clearable`
defaults to false. When enabled, a clear button appears for nonempty values;
clearing emits the native change contract with an empty value and returns focus
to the input. In controlled usage the parent owns the final value. Disabled or
readOnly prevents clearing. Debouncing, submission, loading, and fetching belong
to the application.

### InputAmount

Use NumericFormat's public integration surface from react-number-format, paired
with Vandor's input styling. Public `value`, `defaultValue`, and `onValueChange`
use raw decimal strings, never floating-point numbers. Empty is `""`; the decimal
separator in raw values is always `.`. Editing transients must remain editable
without coercion to zero or premature numeric conversion. Do not emit a callback
for a prop-only formatting update.

Expose `thousandSeparator`, `decimalSeparator`, `prefix`, `suffix`,
`decimalScale`, `fixedDecimalScale`, and `allowNegative`. Defaults: no thousands
separator, decimal separator `.`, empty prefix/suffix, no explicit decimalScale,
fixedDecimalScale false, allowNegative false. Reject conflicting configured
separators. Decimal scale limits accepted fraction digits; fixed scale is a display
option, not an authorization to convert or round stored money values. Changes to
formatting props do not silently alter externally owned values. Document that
callers must supply values compatible with their scale constraints.

Use library-supported caret and paste behavior instead of reimplementing it.
Provide Rupiah and other currency examples using explicit separator configuration.
There is no automatic locale/currency resolution, money arithmetic, exchange-rate
conversion, or minor-unit conversion.

### InputPhone

Use libphonenumber-js and Vandor's Select/InputGroup. Public values are
international digits including the calling code without `+`; empty is undefined.
Accept values with `+` when initializing or replacing controlled values, but emit
only the selected public convention. `defaultCountry` defaults to `ID`.

Expose locale and country-picker accessible-label customization. The picker
displays calling codes and localized country names; default naming locale is `en`.
Preserve partial drafts, caret position, and draft formatting when a controlled
parent echoes the emitted value. External replacements/reset synchronize draft
and country. A draft that cannot yield an international candidate emits undefined
without discarding the draft; parsable candidates are not necessarily valid.
Indonesian leading-zero and calling-code normalization follows the reference.
Changing country reinterprets the existing national-number draft with the selected
country and emits the resulting candidate. Do not claim formatting validates
existence, reachability, or business rules. readOnly prevents country changes.

### InputOTP

Use a single native input with aria-hidden visual cells rather than independent
focusable inputs. Support length (default 6), numeric (default) or alphanumeric
characters, controlled/uncontrolled values, paste, mobile one-time-code autofill,
native selection/editing, and a ref to the input. Length must be a positive integer.
Filter disallowed characters and truncate to length; empty is `""`.

`onValueChange` emits changed sanitized user values. `onComplete` fires when a
user edit produces a complete value different from the previous value. It does
not fire on mount, prop synchronization, or unchanged complete values. Clearing
and reentering the same complete code is a new completion. Preserve caller event
handlers and native disabled/readOnly behavior. Visual cells communicate focus
and selection without exposing duplicate screen-reader content.

### InputSecret

Build on Input's native-value contract. Start hidden; offer show/hide and copy.
Copy reads the current input value, including uncontrolled edits. Report success,
empty content, unavailable clipboard, and write failure through a polite live
status region. Never include the secret in status text, logs, errors, or URLs.
Clear stale copy status on value changes. No copy fallback that exposes content
in another UI. Disabled prevents all actions; readOnly still allows showing and
copying. Preserve the consumer's input ref.

### Calendar

Wrap react-day-picker's documented API, retaining discriminated props for single,
multiple, and range modes rather than weakening them to untyped objects. Support
locale, disabled-date matchers, start/end navigation months, caption configuration,
and consumer class/component overrides. Navigation bounds do not implicitly make
dates invalid: callers use disabled matchers for selection restrictions.
Use Vandor Button styles and local theme tokens. Keyboard day navigation and
accessible month/day announcements must remain intact.

### Popover

Expose Popover, PopoverTrigger, PopoverContent, and PopoverClose
composition using Base UI public APIs. Support controlled/uncontrolled open state,
custom trigger rendering, placement/alignment, portal rendering, and dismissal.
Opening, Escape, outside dismissal, and focus return must follow the documented
primitive behavior. Keep content within mobile viewport bounds; support reduced
motion without introducing a second animation lifecycle that prevents unmounting.

### DatePicker

Use Calendar in single mode inside Popover. `value`/`defaultValue` are
`Date | undefined`; `onValueChange` receives the same. Selecting an allowed date
commits immediately and closes the popup. Optional clear action (`clearable`,
default false) emits undefined; cancelling/dismissing without selection emits
nothing. External values synchronize selection without callback loops.

Support locale, dateFormat (default `PPP`), label/placeholder customization,
disabled dates, navigation bounds, disabled and readOnly states, and
controlled/uncontrolled open state. Focus moves into the calendar when opened and
returns to the trigger on keyboard dismissal/selection. Trigger display formatting
does not change the underlying date. No manually typed date parser.

### DateRangePicker

Use `DateRange | undefined` for public values; committed ranges must include both
from and to. Internally maintain a separate, possibly partial draft while open.
Opening copies the current committed value to the draft. Calendar selection and
shortcut selection update only the draft. Apply commits once and closes; Cancel,
Escape, and outside dismissal discard changes. On close, return focus according
to Popover semantics. External committed-value replacements while open replace
the draft, preventing application of stale external state.

Apply is disabled until the draft is complete, ordered, and selectable. Endpoints
are inclusive; a same-day range is allowed. Ranges may not include disabled dates;
shortcut results are subject to the same check and are not silently truncated.
Clearing is optional (`clearable`, default false); when used inside the popup it
creates an explicit cleared draft that Apply can commit as undefined. An untouched
empty or merely partial draft is not an applicable clear action.

Expose `features` containing optional `twoMonths` and `shortcuts`; default neither.
Two-month layouts adapt to available viewport space rather than forcing horizontal
overflow. Support configurable shortcut subset and labels. Default enabled shortcut
set: last7Days, last14Days, last30Days, thisWeek, lastWeek, thisMonth, lastMonth.
Recent-day shortcuts include today; week start defaults to Monday and is configurable.
Current week/month shortcuts cover their complete calendar periods, including
future dates unless caller constraints disable them. Resolve today when activating
a shortcut, with injectable `now` for deterministic behavior and testing.

Support the same relevant locale, display formatting, labels, disabled/readOnly,
date constraints, and open-state contracts as DatePicker. Distinguish disabled
control props from Calendar's disabled-date matchers using `disabledDates`
so the picker API cannot confuse disabling a control with disabling individual days.

## Date and localization semantics

Dates represent local calendar days. Do not serialize through UTC conversion or
silently call `toISOString()` for date-only values. Equality, ranges, shortcuts,
and form serialization use local calendar-date components. Formatting is presentation
only; no automatic timezone translation is provided. Callers own transport and
timezone decisions when serializing local date values.

UI labels default to English and are customizable, including action labels,
placeholder text, copy-status messages, country naming, and shortcut labels.
Calendar locale and week-start configuration are explicit. Do not assume Indonesian
labels globally just because the reference application uses them.

## Documentation surface

Follow `docs/component-documentation.md` and preserve its shared generated sections.
Each item gets a component MDX page, registry-matching frontmatter, public prop
metadata, and a component-specific live preview/playground adapter where applicable.
Do not duplicate generated Installation, Dependencies, Props, Source, or Credits
sections in MDX. Source credits reflect actual contributions.

Examples cover basic use, controlled/uncontrolled ownership, relevant disabled,
readOnly and invalid states, accessible labels/descriptions, ref usage, and form
composition. Include advanced examples for formatted amount, international phone
entry, OTP paste/autofill, secret copying, date constraints, and range shortcuts.
Document empty-value conventions and intentional differences from Valcentra.
Verify generated Markdown/Copy Page routes as well as rendered documentation.

## Acceptance evidence

This section defines acceptance criteria, not execution batches or a task plan.

- Focused repository-native automated tests protect meaningful runtime contracts:
  controlled/uncontrolled/reset behavior; floating label/autofill state; search
  clear; amount raw values, separators, precision, caret and paste; phone parsing,
  country changes, partial drafts and external resets; OTP sanitization/completion;
  secret clipboard success/failure; date shortcut calculations; and range
  Apply/Cancel/dismissal behavior with constrained dates.
- Native form examples distinguish submitted display text from raw callback values
  and demonstrate caller-owned serialization where needed. Disabled native controls
  do not submit.
- Fresh TypeScript checks, repository tests, applicable formatting/lint, registry
  generation, and production build pass before implementation completion is claimed.
- Use the user's agreed primary dev-server URL and OpenChamber browser panel to
  verify desktop/mobile, supported themes, focus/keyboard interactions, popup
  scrolling/dismissal, long labels/adornments, and reduced motion.
- Follow `.agent/frontend-workflow.md`: do not guess a server port, start/restart
  another server, or run Playwright without explicit approval. If a browser tool
  cannot establish caret/autofill behavior, report missing evidence and request
  permission for a focused additional check rather than claiming it passed.
- Registry consumers resolve only declared dependencies and compile against
  documented public package APIs. Verify installable targets and generated
  documentation/Markdown remain consistent with source and prop metadata.
- Final reporting distinguishes passed checks from unverified behavior. No new
  automated tests are required solely for static documentation or styling.

## Approval boundary

The user approved the scope, selective-adaptation approach, explicit amount
formatting, Valcentra-compatible phone values, structural design, and behavior
summary before this document was written, and subsequently approved the written
specification. Approval of it does not select an implementation workflow or authorize an
implementation plan; the selected workflow remains specification only.
