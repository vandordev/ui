# Ozone-informed Vandor UI improvements

Date: 2026-10-28

Status: consolidated written spec approved by the user on 2026-10-28.
Implementation planning is authorized.
No implementation or branch changes are authorized by this specification alone.

## 1. Goal and authority

Bring the reusable improvements from `/home/alfarizi/dev/work/ozone/ozone-core`
back into Vandor UI, with public, framework-independent contracts, complete
documentation, portable stories, and consumer-installation evidence.

The user explicitly permits breaking changes. Do not introduce compatibility
switches solely to preserve the old shell/page spacing. Preserve unrelated public
behavior and the existing documentation website design.

References are Ozone's `packages/ui/src/components`, `packages/ui-utils/src/date.ts`,
`packages/ui-utils/src/react.ts`, and BO shell/navigation compositions. Ozone is a
reference, not a dependency or a second implementation target. Do not modify it.

## 2. Scope

- R1: AppShell layout, surfaces, controls, localization and footer integration.
- R2: Collapsed navigation tooltips, including custom router controls.
- R3: NavUser functionality integrated into AppShell, not a standalone item.
- R4: DateTime as a new independently installable component family.
- R5: Select static/floating labels and accessible naming.
- R6: Autocomplete floating outline, group focus and popup layering.
- R7: Balanced responsive StatsCard rows and separators.
- R8: DataGrid consumer-owned source adapter and single-size pagination treatment.
- R9: InputPassword translated visibility labels, Button destructive foreground
  token, and DateRangePicker Indonesian locale export.
- R10: Registry/discovery, documentation, playgrounds/examples, portable stories,
  migration guidance and proportionate verification for all affected surfaces.

Excluded: Ozone branding/palette/radius, OzoneLoader, a new Table component,
authentication, role interpretation, backend transport, application routes, other
UI catalog installations, and unrelated website redesigns. No relative-time clock,
live timestamp updates, or minimum-loading-time hook is introduced.

## 3. Architecture and defaults

Use the current React 19, TypeScript, Tailwind 4, Base UI, Motion and registry
foundations. Keep distributable source separate from `components/ui`, the website's
internal primitives. No Ozone workspace import, auth SDK, router package, or new
date library may enter distributed source.

Use Vandor semantic tokens, native semantics, public dependency APIs, and `cn`
merging. Do not import Ozone's `vandor-dark` variant or its CSS wholesale. Register
all required consumer CSS/tokens instead of relying on the website stylesheet.

## 4. AppShell

### R1: Layout and controls

- Main content has no default page padding. PageContainer owns padding, centering
  and maximum width. PageContainer defaults become 16px below `sm`, 24px from `sm`,
  and 48px from `lg` (`p-4 sm:p-6 lg:p-12`).
- Root/content surface uses background; sidebar uses the sidebar token. Active
  navigation uses the Ozone-style background/foreground contrast, adapted to
  Vandor tokens in light/dark themes.
- `showHeader` defaults to `true`, matching Ozone. Header, actions and optional
  search remain in the topbar in that mode.
- `showHeader={false}` removes the topbar. Desktop collapse controls live in the
  sidebar. Collapsed rail shows brand identity until hover or keyboard focus
  reveals the expand icon; its accessible name and tooltip remain available.
- Headerless mobile uses a fixed top-attached brand tab with concave upper
  transitions and rounded lower corners, a separate floating menu control, and a
  right-side navigation drawer. No full-width header background is introduced.
- Header mode retains left-side mobile navigation. Safe-area insets and initial
  content clearance prevent headerless controls from covering page titles.
- Preserve controlled/uncontrolled collapse, navigation-context direction,
  long-navigation scrolling, Escape dismissal, focus return, and reduced motion.
- With no header, header/actions/search UI is not relocated implicitly. The
  documented search shortcut remains enabled only when `onSearch` is supplied.
- Add configurable labels for skip-to-content, sidebar, opening/closing navigation,
  and expanding/collapsing sidebar, with English defaults. Retain existing search
  and navigation labels.
- Footer render state receives both `collapsed` and `closeNavigation`.

### R2: Custom-control tooltips

The current shell's `renderControl` branch bypasses tooltip composition; BO router
links all use that branch. Standard and custom navigation must receive a label
tooltip on collapsed desktop rails, on hover and keyboard focus. Expanded/mobile
navigation must not gain redundant tooltips.

Preserve one interactive control, native link behavior, consumer refs/handlers,
accessible naming, active/disabled state, and router ownership. Do not solve this
with nested buttons, forced button semantics on links, or a new focusable wrapper.
If the render contract needs adjustment to compose trigger props/ref correctly,
document and migrate it explicitly; breaking changes are permitted. Do not claim
support for arbitrary custom markup without defining the required control contract.

### R3: Integrated user menu

- Provide an optional AppShell `user` configuration for display name, optional
  description (for example email or role), optional avatar, menu items, pending
  state, and localized accessible menu text. Missing avatar falls back to initials.
- Menu configuration reuses the existing Dropdown public item contract rather than
  introducing a second action DSL. Applications supply real navigation controls
  and action callbacks; do not hardcode account/logout or a particular router.
- AppShell renders this built-in user footer when `user` is supplied and no custom
  `sidebarFooter` is supplied. An explicit custom footer overrides it, avoiding
  duplicate account controls. Without either, no user footer is rendered.
- Expanded mode shows identity/description; collapsed mode shows the avatar and
  an identity tooltip with an accessible trigger name. Menu placement adapts to
  available space and rail mode.
- AppShell owns drawer closure for user-menu navigation/actions. Synchronous menu
  interaction and action callback order must not destroy link navigation or
  Dropdown pending/error behavior. Do not unconditionally unmount a pending or
  rejected asynchronous action; honor existing Dropdown close-on-select semantics.
- Pending disables repeat user-menu interaction and exposes busy state without
  inventing authentication, successful logout, persistence or error handling.
- Keep any implementation helper internal to AppShell's dependency closure.
  No `nav-user` registry item, separate install command, or separate docs page.

## 5. R4: DateTime family

DateTime renders a semantic `<time>` for instants, not calendar-only dates such as
birthdays. Public props are `value`, `locale`, `timeZone`, `format`, `fallback`,
and applicable native time-element props/ref, excluding caller-owned `dateTime`
and children because the component derives them.

- Accept timezone-qualified ISO timestamps with seconds (including fractional
  seconds and explicit offsets), valid Date objects, epoch milliseconds, null and
  undefined. Do not guess timezone for timezone-less strings or accept date-only
  strings as instants. Reject impossible dates rather than normalizing them.
- Empty/invalid input displays `fallback`, default `—`, without an invalid
  machine-readable timestamp. Valid input produces an ISO UTC `dateTime` value.
- Locale defaults to `en-US`; examples include `id-ID`. Without an explicit
  timezone, formatting follows the browser's timezone.
- Default format includes numeric day/year, short month, and two-digit hours and
  minutes using a 24-hour cycle. Explicit `format` replaces defaults, allowing
  dateStyle/timeStyle or date-only/time-only display without conflicting options.
- Explicit `timeZone` takes precedence over a timezone inside `format`. Invalid
  Intl configuration is a developer error and is not silently converted to an
  invalid-input fallback.
- SSR and initial hydration display identical fallback text. After hydration,
  browser formatting is shown. Do not suppress hydration warnings, read server
  timezone/preferences, or introduce global mutable formatting configuration.
- Ship as a folder under the configured components alias, with `index.ts` as the
  public component entry and colocated required component/helper modules. No
  `@repo/ui-utils` import, query adapter, schema entry, or new date dependency.
- Add DateTime to the existing family installer/distribution conventions and
  narrowly update the documented family exception, currently limited to
  Autocomplete/DataGrid. Do not assume stock CLI supports arbitrary nested aliases.
- Provide separate optional `date-time-stories`, with no core overwrite or
  Storybook dependency in ordinary installation.

## 6. R5–R7: Fields and metrics

### Select

Add `label` and `labelStyle="floating" | "static"`, floating by default when a
label is supplied. Visible labels must name the trigger accessibly and preserve
explicit caller ARIA naming overrides. Custom triggers retain ownership of their
label layout; document this boundary. Existing unlabeled usage remains supported.
Verify focus, invalid, disabled, long-label/value and native form semantics.

### Autocomplete

Replace the opaque floating-label background patch with a real outline notch.
Track focus across the entire input group, including clear/trigger/chip controls,
so labels do not drop while interacting within the control. Raise labels for
focus, entered text or selected values, preserving single/multiple modes.

Give the isolated popup positioner the correct overlay layer (`z-50` as in Select)
so suggestions are visible and interactive inside Drawer/Dialog. Keep collision,
scrolling, dismissal and accessible focus behavior intact. Shared field-outline
helpers must be distributed with every component requiring them, without
overwriting unrelated consumer primitives or breaking Input's existing outline.

### StatsCard

Balance items across full-width responsive rows with at most four columns on
desktop: five items become 3+2, six become 3+3, seven become 4+3. Tablet uses at
most two columns, except exactly three items can share a row; mobile stacks.
Separators follow each actual row, including shorter rows. Preserve source order,
accessible metric markup, empty/single cases and reduced-motion value rendering.

## 7. R8: DataGrid

Keep `useDataGrid` as the Query-managed adapter and add `useDataGridSource` for
consumer-owned paginated data. Both use one shared request/controller and renderer,
not duplicated filtering/pagination/selection implementations.

The source supplies typed contract output or undefined, optional error, loading
and refreshing signals, and a refetch callback. It must not call `useQuery`, fetch
independently, create a Query cache, or require a QueryClient provider at runtime.
This does not promise removal of existing package installation dependencies.

Preserve schema-derived row/filter/request inference, controlled/uncontrolled
request state, reset/apply/debounce, sorting, page/cursor pagination, selection,
and all-matching descriptors. The consumer remains responsible for supplying data
corresponding to the current request and for its cache/auth/query lifecycle; do
not present a source adapter as automatic stale-response arbitration.

Distinguish initial loading, refreshing, error and empty data meaningfully. Test
both adapters for shared-state regressions and prove source-only use works without
a QueryClient provider. Keep query-specific returned information on `useDataGrid`
accurate rather than fabricating a full Query result for the source adapter.

Hide the page-size selector when `pageSizes` has only one option (or none), while
retaining pagination/range announcements and navigation. Do not invent backend
sorting, page-size negotiation, or API contracts.

## 8. R9: Small reusable improvements

- InputPassword adds `showPasswordLabel` and `hidePasswordLabel`, retaining English
  defaults, current visibility behavior, disabled handling and `aria-pressed`.
- Button destructive text uses `text-destructive-foreground`. Declare the required
  consumer token and verify readable contrast in both themes; do not equate a
  website token with installed-component setup.
- DateRangePicker reexports `dateRangeIndonesianLocale` from the installed DayPicker
  locale entry. Do not change the default locale or add another date dependency.
  Apply/cancel/clear and shortcut copy remain consumer-owned as currently supported.

## 9. R10: Product and distribution completeness

Update affected registry entries, generated artifacts (through registry build),
installation dependency closure, docs metadata/discovery, API references, examples
and portable stories. Document breaking spacing, custom-control contract changes
if needed, built-in user footer precedence, and replacement of Ozone-only imports.

AppShell retains its approved interactive-state/examples exception instead of a
props playground. Its documentation/stories cover header/headerless, expanded/
collapsed, mobile, custom router controls, localized labels, user menus, custom
footer, hierarchy, long content and reduced motion.

DateTime and updated configurable components provide real typed playgrounds with
meaningful controls, fresh Reset, synchronized generated code and Copy. Include
complete runnable snippets and narrow gallery demos. DateTime covers locales,
timezones, formats, invalid input and hydration. DataGrid includes source-owned
data examples; field examples show labels, focus and overlay composition.

Portable stories remain separate optional installs, typed against real Storybook
types, self-contained and without website imports or production APIs. Preserve
customized core components during stories-only installation.

## 10. Acceptance and verification

Implementation is accepted only with fresh evidence proportional to these risks:

1. Native TypeScript checks for public source, stories, examples/playgrounds and
   positive/negative consumer type contracts where inference changes.
2. Focused durable tests for shell/user-menu state and callback semantics, custom
   control tooltip hover/focus, field labeling/focus and overlay regressions,
   balanced metric layout, date parsing/formatting/hydration, and both grid adapters.
3. Playground configuration/generated-code parity, Reset and serialization checks.
4. Registry artifact parity and isolated consumer compilation; actual family CLI
   installation for default/divergent/src layouts, source/helper dependency closure,
   client boundaries and stories-only customized-source preservation where affected.
5. Scoped formatting/lint and registry/production builds when compilation,
   packaging and route integration are changed.
6. Browser inspection on the user's agreed primary dev server: desktop/mobile,
   light/dark, long content, keyboard focus/tooltips, menus/drawers, safe areas,
   reduced motion and DateTime hydration/rendering. Ask for the URL when needed;
   never guess a port or start/restart a server without approval.

Follow `.agent/frontend-workflow.md` memory safety: inherited test heap 512 MiB,
serial tests, finite process-tree deadlines with forced-kill grace, no heavy checks
in parallel, no unbounded DOM/React failure output. Other Node checks use explicit
budgets no greater than 2048 MiB by default and finite deadlines. Stop on OOM or
timeout; do not retry unchanged or raise budgets without approval.

No Storybook server exists in this project. Type/portable composition checks do
not prove Storybook appearance; report Storybook UI as not verified without
requiring a new server. Playwright/alternative browser automation needs explicit
approval. Missing browser/CLI evidence remains an explicit unresolved gate, not a
passing claim.

## 11. Planning and execution boundary

After approval, the implementation plan must map R1–R10 to explicit execution
batches with dependencies and acceptance gates, and exactly one final integrated
audit batch. It must preserve every constraint and distinguish source, artifact,
CLI, type, runtime and visual evidence.

Branch/execution profile, commit/merge/push authority and any additional scope
remain separate decisions. Do not start implementation while the written-spec
review is pending.
