# Vandor UI DateTimePicker and DateTimeRangePicker: design

Date: 2026-11-04

Status: draft, awaiting user approval.

## Goal and scope

Add two registry components that pick a date **and** a time of day:

- `DateTimePicker`: one `Date`.
- `DateTimeRangePicker`: a `{ from, to }` range of `Date`s.

Both follow the existing `DatePicker` / `DateRangePicker` conventions (trigger
button, Popover, Calendar, labels, controlled/uncontrolled, `disabled`,
`readOnly`, `motion`) so they read as one family.

Delivery is in two stages on local `main`, one commit per stage, no push:

1. Stage 1: shared time pieces + `DateTimePicker` (registry, docs, playground,
   examples, stories, tests).
2. Stage 2: `DateTimeRangePicker`, reusing stage 1 (same deliverables).

The name `DateTimeRangePicker` is used instead of `DateTimePickerRange` so it
matches `DateRangePicker`. The display component `DateTime` (read-only
formatting) is unrelated; the docs call this out.

## Public contract (expensive to change later)

- **Value type is `Date`** (`Date | undefined`; range is `DateRange` from
  react-day-picker, exactly like `DateRangePicker`). Date and time are read and
  written in the **device's local time zone**. The docs state this and that a
  server needs an explicit conversion; a `timeZone` prop can be added later
  without breaking this contract.
- **Precision:** `precision?: "minute" | "second"`, default `"minute"`. The
  emitted `Date` always has milliseconds `0`, and seconds `0` for `"minute"`.
  Nothing else (no stray seconds from a controlled value) leaks through.
- **Transactional, like `DateRangePicker`:** picking a date or time edits a
  draft. `onValueChange` fires only on **Apply** (and on **Clear** when
  `clearable`). Cancel, Escape, or an outside click discards the draft. This
  keeps `onValueChange` meaning "a complete value was chosen".
- **Empty value is `undefined`.** Range with only `from` is a draft state, never
  committed.
- Props mirror `DatePicker`: `id`, `label`, `placeholder`, `value`,
  `defaultValue`, `onValueChange`, `locale`, `dateFormat`, `disabled`,
  `readOnly`, `open`, `defaultOpen`, `onOpenChange`, `disabledDates`,
  `startMonth`, `endMonth`, `clearable`, `className`, `motion`; plus
  `precision`, `applyLabel`, `cancelLabel`, `clearLabel`, and `timeLabel`
  (range: `startTimeLabel`, `endTimeLabel`).
- **Display:** `dateFormat` default `"PPP p"` (date-fns, locale-aware). The
  native time field follows the OS 12/24-hour setting; the docs show
  `"PPP HH:mm"` for 24-hour display so the trigger and the field agree.
- **No native form submission** (no `name` / hidden input), same documented
  limitation as `DatePicker`. Not claiming native prop forwarding.

## Behavior

- Popover body: Calendar (single or range) above one time field (range: start
  and end time fields), footer with Cancel / Apply (and Clear when
  `clearable`).
- A date with no time yet gets `00:00` (range end: `23:59`). Not configurable in
  the first release.
- **Range validity:** Apply is disabled when `from` is after `to`, including the
  same day with end time before start time. The reason is shown in a polite
  live region linked to the time fields with `aria-describedby`, and the fields
  get `aria-invalid`.
- `disabled` blocks opening and forces the popup closed; `readOnly` shows the
  value but blocks every mutating control (same guards as `DatePicker`).
- `disabledDates`, `startMonth`, `endMonth` apply to the calendar only. Time
  constraints (min/max time) are not offered.
- Reduced motion: reuse the `motion` prop and the existing Popover/Calendar/
  Button behavior; no new animation.
- DST: a time that does not exist locally (spring-forward gap) resolves to the
  next valid local time, as `new Date(y, m, d, h, min)` does. Documented.

## Architecture

- Distributable files in `registry/new-york/`:
  - `date-time-picker-utils.ts`: pure functions (parse "HH:mm[:ss]", merge date
    and time, normalize precision, range validity). Unit-tested without a DOM.
  - `date-time-picker.tsx`: `DateTimePicker`, plus the internal `TimeField`
    (a styled native `<input type="time">`) used by the range picker.
  - `date-time-range-picker.tsx` (stage 2): imports from `./date-time-picker`.
- Registry items: `date-time-picker`, `date-time-range-picker`
  (`registryDependencies` includes `date-time-picker`, no duplicated source),
  and one `*-stories` item each. Ordinary `registry:ui` files carry **no fixed
  `target`**, so the consumer's `aliases.ui` applies (the defect fixed in this
  repository on 2026-11-04). Versions of shared packages are written the same
  way in every item (`@base-ui/react@^1.8.0`, `cn@^0.4.0`, `motion@^12.38.0`,
  `lucide-react@1.11.0`) to avoid the pnpm spec mix-up fixed on the same date.
- Integration points, following `DatePicker` / `DateRangePicker`:
  `lib/input-component-props.ts` and `components/input-family-playground.tsx`
  (playground and generated code), `lib/component-docs.ts`,
  `content/docs/components/*.mdx` and `meta.json`, `examples/`, portable
  stories, and tests under `tests/`.

## Verification

- Unit tests for the utils (precision, merge, same-day ordering, DST gap).
- Component tests in the existing happy-dom style: apply/cancel/clear commit
  semantics, controlled vs uncontrolled, `disabled` and `readOnly` guards,
  precision normalization of a controlled value, invalid range blocks Apply.
- Distribution tests: no fixed targets, stories import only installed pieces.
- Docs/playground tests: generated code matches the preview for every control.
- Fresh `tsc`, `registry:build`, oxfmt, and the focused tests per stage; the
  CI-equivalent network steps once at the end, serially and memory-bounded.
- Browser checks (light/dark, mobile width, keyboard, 12/24-hour) need the
  user's dev server URL; without it they are reported as not performed.

## Simplest alternative considered

Reuse `DatePicker` and put a plain `<input type="datetime-local">` next to or
instead of it. This is far less code and free native accessibility, but the
control cannot be styled consistently across browsers, ignores `disabledDates`,
`startMonth` and the Calendar's localization, has no range form, and its
popup differs per browser and OS. It does not meet the "polished and
consistent" bar of the rest of the family, so it is not enough. The chosen
design keeps one native piece (the time field) where native behavior is
strongest and builds everything else from existing components.

## Not doing

- ISO-string value and a `timeZone` prop (can be added without breaking `Date`).
- Segmented custom time field, 12/24-hour toggle, `minuteStep`, min/max time,
  configurable default times.
- Range shortcuts and two-month layout in the first release of the range
  picker (both are additive).
- Native form submission (`name`), `Temporal`, new dependencies.

## Built now on purpose

- The **value contract** (`Date`, local zone, precision normalization,
  transactional commit): changing it after release breaks consumers.
- **Unversioned-dependency consistency and alias-friendly targets** in the new
  registry items: retrofitting means republishing artifacts.
- **Accessibility wiring** (label association, `aria-invalid`/`aria-describedby`
  for range errors, named time fields): cheap now, easy to forget later.
