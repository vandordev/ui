# Vandor UI DataGrid design

Date: 2026-10-07

Status: written specification approved by the user on 2026-10-07; amended with the
user's explicit TypeScript/type-safety and minimal-duplication requirements.
Implementation planning is authorized; implementation is not yet authorized.

## 1. Goal

Deliver a production-oriented, server-driven DataGrid using TanStack Table v9,
TanStack Query v5, and public Zod v4 contracts. Server-driven means that backend
requests perform pagination, sorting, and filtering; it does not mean React Server
Components or a particular server-function framework.

Support React applications in Next.js, TanStack Start, and Vite. The consumer owns
transport, authentication, authorization, tenant scope, and backend implementation.
DataGrid provides typed contracts, state transitions, Query integration, and a
composable Vandor UI renderer.

ReUI DataGrid and the user's existing DataTable are references, not templates to
copy wholesale. Favor concise common usage, one source of truth per concern, and
explicit advanced customization over a root component with dozens of unrelated
props.

### TypeScript and concise consumption

All public source is TypeScript (`.ts`/`.tsx`) with strict typechecking. Infer row,
filter, sorting, request, response, and accessor-value types from their source
schemas/helpers. Common consumer usage must not require duplicate interfaces,
repeated type arguments, `any`, or casts to connect the contract, columns, filters,
query factory, and renderer. Export inferred types for backend reuse without
making consumers restate those shapes.

Keep a single source of truth for request/output definitions, column
configuration, state transitions, shared styles, and playground configuration.
Advanced composition remains optional; do not introduce a second configuration
DSL or an abstraction merely to hide a few lines of JSX. Validate concision with
complete runnable consumer examples as well as positive/negative type tests.

## 2. Release scope

### Included

- Page and cursor pagination, with distinct contracts and navigation.
- Public, server-safe Zod v4 schema builders and domain contracts.
- A native query-options factory consumed by one DataGrid controller hook.
- TanStack Table v9 server processing, without client-side processing row models.
- Typed accessor, computed, and display columns; header labels and column order.
- Three-state sorting and multi-sort.
- Custom toolbar controls and typed filter bindings.
- Immediate filters with optional debounce and transactional Apply filters.
- Controlled/uncontrolled request state, column preferences, and selection.
- Column visibility, sticky headers, and native horizontal/vertical overflow.
- Explicit ID selection across pages and opt-in all-matching selection.
- Column, Row, and Cell rendering primitives and render customization.
- Default, striped, bordered, and plain variants; compact/comfortable density.
- Initial loading, refreshing, placeholder data, empty, error, disabled-query, and
  network-paused states; localization and accessibility.
- Documentation, a real playground, runnable examples, portable stories,
  registry packaging, and durable regression protection.

### Deferred

- Infinite scroll and `infiniteQueryOptions` integration.
- Virtualization, column resizing/pinning, and drag-and-drop.
- Tree/grouped rows and grouped headers.
- Spreadsheet range selection, clipboard workflows, inline editing, and CRUD engines.
- Backend bulk-action execution, exports, jobs, and snapshot infrastructure.

All-matching selection is included as a descriptor and UI affordance, not as an
implementation of backend bulk operations. A million backend records do not imply
loading a million rows or require virtualization for a page of 25–100 rows.

## 3. Architecture and ownership

| Layer          | Responsibility                                                                       | Does not own                               |
| -------------- | ------------------------------------------------------------------------------------ | ------------------------------------------ |
| Contract       | Zod input/output, row/filter/sort schemas, pagination mode                           | React, transport, query cache, UI          |
| Controller     | Request state, atomic transitions, column preferences, selection, Query/Table wiring | Backend authorization, a second data cache |
| TanStack Query | Remote data/cache, retries, cancellation, freshness, background requests             | Grid presentation and column preferences   |
| TanStack Table | Table structure and registered feature APIs                                          | Client-side processing of server results   |
| Vandor UI      | Rendering, controls, variants, accessible feedback                                   | Transport or backend mutations             |

Distributable modules are kept under `registry/new-york/` and must not import the
website's internal UI, routes, helpers, or providers. Schema-only modules have no
`"use client"` directive and no React/Query/Table runtime dependency. Client hooks
and interactive UI declare their client boundaries explicitly.

Use only public dependency exports. At research time npm reported stable
`@tanstack/react-table` 9.2.6; verify exact installed public exports and declarations
before implementing. Do not use stale v8 or alpha API assumptions.

## 4. Public contract API

The intended API is:

```ts
const usersGrid = createDataGridContract({
  pagination: "page",
  row: userSchema,
  filters: filtersSchema,
  sortBy: z.enum(["name", "email", "createdAt"]),
});
```

Expose `input`, `output`, `pagination`, `sorting`, `filters`, and `row` as actual
Zod schemas. Also export reusable page-pagination, cursor-pagination, sorting, and
page/cursor-output builders, allowing domains to compose schemas independently.
Builders return normal Zod schemas rather than an opaque validation API.

Provide inferred public input/output/row types. Respect the distinction between
`z.input` and `z.output`: the query factory receives parsed/normalized input, and
rendering consumes the declared output row type. Transforms must not be silently
applied twice.

Amendment approved during inline implementation: controlled request state holds
normalized `z.output` values; filter controls edit raw `z.input` drafts. Retain
known raw drafts without re-parsing applied output. Reconstructing a draft after
an external controlled filter restoration uses public Zod v4 encode. Filters
with transforms that need this inverse must use reversible Zod codecs; a one-way
transform without an inverse produces a clear diagnostic, never a second parse.
Ordinary filters and row/transport transforms are unaffected. Draft bindings infer
their field/value types from the raw filter input schema.

Filter request values and cursors are serializable. Date filters use explicitly
chosen date-only strings or timestamps; no implicit locale/timezone inference.
Do not derive sortable fields or filter permissions from all row fields.

The default page size is 25, with a default maximum of 100. Builders allow a
domain to configure these limits. Page indexes and sizes are safe integers;
indexes are non-negative, sizes positive, and counts non-negative safe integers.
Sorting IDs are allowlisted by the supplied schema, with duplicate sort IDs
rejected. Defaults include an empty sorting array. Initial filters must produce a
valid value under the supplied filter schema; required filter fields are supplied
by the application or Zod defaults, not invented by DataGrid.

### Page mode

```ts
// Input
{
  pagination: { pageIndex: 0, pageSize: 25 },
  sorting: [{ id: "name", desc: false }],
  filters: { status: "active" },
}

// Output
{
  rows: [...],
  rowCount: 100000,
}
```

Page index is zero-based in the contract and one-based in displayed labels.
`rowCount` means total rows matching the applied filter, not the loaded page size
or the entire database. Numbered pagination derives page count from this total.
No duplicate `recordCount`, `total`, or consumer-supplied page count is needed.

Handle zero results without displaying page zero or negative ranges. When a
successful response proves the requested page out of range, transition once to
the last valid page and request it; do not display unrelated old rows as that page
or enter a correction loop.

### Cursor mode

```ts
// Input
{
  pagination: { cursor: null, pageSize: 25 },
  sorting: [],
  filters: {},
}

// Output
{
  rows: [...],
  nextCursor: "opaque-token", // null at end
}
```

Cursors are opaque strings, never parsed or constructed by DataGrid. `null`
requests the initial page. Next is available only when the successful current
response has a next cursor; previous uses the instance's visited cursor history.
History stores cursors, not rows, and forward history is truncated when a new
branch is visited. Do not append history merely because a request was attempted.
Failed requests remain retryable and do not claim successfully visited pages.

Filter, sorting, or page-size changes clear history and return to a null cursor.
There is no arbitrary page jump, last-page control, or fabricated total. Cursor
selection labels say "all matching results" without a number. History is local to
the grid instance; a remount/deep link does not promise previous-page navigation
unless the application restores the history explicitly.

### Backend reuse and extension

Use the same schemas in tRPC `.input(contract.input)` and
`.output(contract.output)`, or corresponding server-function validation.
Domain schemas may extend shared builders for endpoint metadata/context. The
grid's reserved pagination/sorting/filter/row fields retain their meanings; extra
endpoint context is supplied by the query factory and is part of its query key.
No automatic database-query construction or security guarantees are implied.

## 5. Columns and rendering

```tsx
const column = createDataGridColumnHelper(usersGrid);

const columns = [
  column.accessor("name", {
    header: "Nama pengguna",
    sortBy: "name",
    cell: ({ value, row }) => <UserIdentity name={value} email={row.email} />,
  }),
  column.accessor("email", { header: "Alamat email" }),
  column.display({
    id: "actions",
    header: "Tindakan",
    cell: ({ row }) => <UserActions user={row} />,
  }),
];
```

Accessor overloads support a key and a computed function; computed accessors have
an explicit stable ID. Value types follow the actual accessor result, not an
unrelated field read from the original row. Display columns have an explicit ID
and do not need a data key. Duplicate column IDs are rejected clearly.

Header label, column ID, accessor, and backend sort key are separate concepts.
`sortBy` is optional and checked against the contract; no `sortBy` means not
sortable. A backend field need not appear in the output row. Display/computed
columns can declare a valid backend sort key. Multiple columns mapping to the
same backend key cannot create duplicate entries in a request.

Prefer TanStack-compatible naming and native helper behavior under the wrapper.
Expose the underlying table as an escape hatch, not a cast-heavy alternate public
API. Columns remain stable when results are empty; never infer visible fields from
`rows[0]` or auto-expose new backend fields.

Array order defines the initial display order. `columnOrder` is separate mutable
preference state for reorder/restoration. Unlisted known columns append in
definition order; obsolete saved IDs are ignored. Visibility controls use the
display label, including an explicit text label for non-text headers.

Plain values have conservative defaults: null/undefined show the empty-value
placeholder; strings/numbers display directly. Do not guess currency, dates,
locale, timezone, or complex object rendering. Format these explicitly in cells.

## 6. Controller and Query integration

```tsx
const grid = useDataGrid({
  contract: usersGrid,
  columns,
  getRowId: (row) => row.id,
  queryOptions: (input) => trpc.users.list.queryOptions(input),
  initialState: {
    pagination: { pageIndex: 0, pageSize: 25 },
    sorting: [],
    filters: {},
  },
});
```

The native query-options factory is called with normalized input and may capture
the current tRPC client, tenant, and application context from hooks. It is not
required to live at module scope. Its selected data must satisfy the grid output
contract, with types preserved through native Query `select` where used. DataGrid
does not overwrite `select`, query key, retry, stale time, enabled, or placeholder
options silently. Do not mutate a caller-owned options object.

The application supplies an existing QueryClientProvider. Do not create a private
QueryClient or layer a grid cache over Query. All request inputs and authorization
scope affecting results belong in the native query key. Document and test this
requirement; do not modify tRPC keys or claim to prove arbitrary custom key
completeness at runtime.

Expose `grid.table`, `grid.query`, applied request state, and documented actions.
Data remains in Query and is not synchronized into local state via effects.
Register only supported Table features. Server processing is enforced: omit
client-side sorting/filtering/pagination row-model factories and configure manual
behavior as required by the stable v9 API. Render backend results in returned order.

Request transitions are atomic: a filter/sort/page-size change and pagination
reset happen together, with no intermediate request for the old page and new
filters. Multi-sort priority follows array order. Header cycling is
unsorted -> ascending -> descending -> unsorted; `sorting: []` requests the
backend's default order. Backend ordering must be deterministic, including a
tie-breaker where necessary.

### Controlled state

Use per-slice `state` and `onStateChange` ownership for request state, column
preferences, and selection. When a slice is controlled, its supplied value is
authoritative and a change emits the proposed transition rather than updating a
competing internal value. Controlled request state contains pagination, sorting,
and applied filters together so dependent resets can be emitted atomically.
`initialState` initializes uncontrolled state once and is the reset baseline; it
is not an effect-driven controlled value.

URL serialization and router adapters are application-owned. The controller is
framework-neutral and supports restoring valid state, not automatic persistence.
Scope changes must reset selection, cursor history, and any incompatible draft;
the application can explicitly remount the grid with a scope key when tenant or
resource identity changes. Placeholder data must not cross an authorization scope.

## 7. Filter bindings and toolbar

Toolbar children are arbitrary React content. Bindings never require a particular
Select, DateRangePicker, or other control implementation.

```tsx
<DataGridFilter grid={grid} field="status">
  {({ value, onChange, reset, error }) => (
    <CustomStatusControl
      value={value}
      onChange={onChange}
      onReset={reset}
      error={error}
    />
  )}
</DataGridFilter>
```

An explicit typed `grid` prop on binding components carries domain inference:
React context alone cannot infer a generic field/value type from a JSX parent.
`DataGridSearch` similarly receives `grid` and a string-compatible field. Earlier
conversation examples without this prop were conceptual, not a promise of
context-based TypeScript inference. Verify invalid fields and values with consumer
compile-time tests; do not solve inference failures with consumer casts.

Bindings supply `value`, `onChange`, `reset`, and validation error. Custom controls
can map their own representation explicitly, especially Date values versus
serializable request strings. Existing DateRangePicker already has a commit/cancel
model; map its committed value into the grid draft rather than sending transient
calendar interaction to the backend.

### Immediate mode (default)

Control changes validate and apply immediately, except optional field debounce.
Search defaults to a 300 ms debounce; other controls default to no debounce.
Invalid input is retained for correction with an error and is not sent to Query.
Pending field changes merge into current filters when committed, rather than
overwriting unrelated newer changes. Clear/reset cancels pending timers.

### Apply mode

Configure one filter group at the grid level with `filterMode: "apply"`.
Controls edit a draft, with no request until Apply. Apply validates and commits the
whole draft plus pagination reset in one transition. Invalid drafts show errors
without issuing a request. Apply uses the visible draft immediately; it does not
wait for a search debounce. Provide `DataGridApplyFilters` and
`DataGridResetFilters` controls plus controller actions.

Reset restores the captured valid initial-filter baseline, removes draft errors
and pending debounces, and resets pagination. It clears selection when effective
applied filters change. Field reset restores that field's baseline value. External
controlled filter changes rebase the draft and cancel pending edits, avoiding a
stale draft silently overwriting externally restored URL state.

## 8. Selection

Use the existing Vandor Checkbox for row and header controls. Stable unique row
IDs are required; never use page-local indexes as selection IDs.

```ts
// Explicit selection across visited pages
{ mode: "explicit", ids: ["user-1", "user-2"] }

// Opt-in all matching results
{
  mode: "allMatching",
  filters: { status: "active" },
  excludedIds: ["user-3"],
}
```

Expose a server-safe selection-schema builder alongside the contract for validating
bulk endpoints. Consumers supply their row-ID schema when building this descriptor
schema; UI row IDs are stable strings. Expose selection state and change callbacks,
not an automatic backend mutation.

The header checkbox selects/deselects the visible page. Its checked/indeterminate
state reflects visible-page membership, even with off-page explicit selections.
In all-matching mode deselecting a page adds its IDs to exclusions; selecting it
removes them. Use Set-like deduplication internally without serializing million-ID
lists. Paging and sorting preserve selection. Effective applied-filter changes
reset selection; draft-only edits do not.

All-matching is opt-in, intended only for applications with compatible bulk
endpoints. Show a separate explicit action after page selection:

> 100 rows on this page selected. Select all 100,000 matching results.

Then display an all-matching status with a clear-selection action. Cursor mode
does not invent the total. Counts based on backend totals are informational, not
authorization or an exact bulk-action preview. Exclusions may refer to changed or
deleted rows; do not promise an exact selected count without backend confirmation.

All-matching stores a snapshot of applied filters, excluding pagination/sorting.
It means matching rows at action execution time, not a frozen dataset. The backend
must revalidate filters/IDs, enforce authorization/tenant scope, and handle
destructive confirmation. Exact-time selection requires application-owned backend
snapshot/token infrastructure and is deferred.

Bulk operations must receive the descriptor, not only loaded row objects. Avoid
advertising `getSelectedRowModel()` as the full selection when remote rows are
unloaded. Disable interaction with rows representing another request's placeholder
results. Clear selection remains available. Per-row eligibility that cannot be
enforced for unloaded rows is incompatible with all-matching unless the backend
contract encodes that eligibility in the matching scope.

## 9. UI API, variants, and primitives

```tsx
<DataGrid grid={grid} variant="default" density="comfortable">
  <DataGridToolbar>
    <DataGridSearch grid={grid} field="search" />
    <DataGridColumnVisibility />
  </DataGridToolbar>
  <DataGridSelectionBar />
  <DataGridViewport className="max-h-96">
    <DataGridTable aria-label="Users" stickyHeader />
  </DataGridViewport>
  <DataGridPagination pageSizes={[25, 50, 100]} />
</DataGrid>
```

Viewport is optional: default Table rendering provides native overflow. An explicit
Viewport becomes the sole scroll container; do not produce competing nested
scroll regions. Root owns variant/density and context; pagination and toolbar are
optional presentation elements. Omitting pagination controls does not remove
server pagination from the data contract.

| Variant  | Treatment                                         |
| -------- | ------------------------------------------------- |
| default  | Horizontal separators and a subtle header surface |
| striped  | Alternating row surfaces                          |
| bordered | Horizontal and vertical cell borders              |
| plain    | Minimal chrome for embedding                      |

Density is `comfortable` (default) or `compact`. Variant/density do not enable or
disable sorting, selection, sticky header, or request behavior. Preserve hover,
selected state, focus, and feedback readability in every combination.

Expose DataGridColumn (a header cell), DataGridRow, and DataGridCell as rendering
primitives, not hidden declarative registration components. Column definitions
remain the single source of configuration. Default Table uses these internally;
`renderColumn`, `renderRow`, and `renderCell` callbacks receive typed default
primitive props which consumers can spread and customize. Default Row renders its
configured cells when not explicitly replaced. Document the semantic/ref/event
responsibilities when replacing children or an entire rendering primitive.

Use native attributes/refs and compose caller event handlers. Sorting controls
are keyboard-accessible buttons; selection checkboxes and other child controls do
not accidentally activate row actions. Do not implement row navigation by making
an inaccessible click-only `tr`. Customization must not require runtime child
registration effects or repeated column declarations in JSX.

## 10. Async presentation and existing registry dependencies

Use existing `Empty` and `ErrorState` compositions for default feedback.

| State                                                     | Presentation                                                    |
| --------------------------------------------------------- | --------------------------------------------------------------- |
| Initial active request, no data                           | Internal skeleton rows with stable headers                      |
| Successful response, no results and baseline filters      | Empty: no data                                                  |
| Successful response, no results with non-baseline filters | Empty: no matches, reset-filter action                          |
| Initial/request-key error without current data            | Centered ErrorState and retry                                   |
| Same-input background refetch error with current data     | Keep rows, inline ErrorState and retry                          |
| Same-input background refetch                             | Keep rows with refreshing indicator                             |
| Other-input placeholder data                              | Mark updating; do not present it as current results             |
| Query disabled, no data                                   | Neutral inactive state, not endless loading or successful empty |
| Query network-paused                                      | Explicit waiting/offline feedback; no endless active spinner    |

Centered feedback sits inside one `td` with `colSpan` based on visible columns,
minimum one; headers stay visible. Provide `renderEmpty` and `renderError` hooks
with relevant context, including filtered state, reset, and retry. Do not expose
raw backend error messages/stacks by default; custom error handling remains an
application decision. Empty/error rendering does not need a new registry item.

Dependency graph must reflect actual imports. Reuse Checkbox, Button, Select for
page-size controls, Dropdown for visibility, InputSearch for the built-in search,
and Empty/ErrorState. Using Select in pagination is distinct from requiring Select
for every custom filter. DateRangePicker, custom filter controls, and Dialog bulk
confirmation are example/application dependencies, not unconditional core imports.
Do not pull ErrorStateDetails or unrelated feature catalogs into the installed
grid accidentally; inspect the existing transitive graph.

Packaging amendment approved during inline implementation: Button's default Arc
spinner is a small licensed supporting primitive rather than a dependency on the
entire Loading variant catalog. Preserve Button's API, default visual/state and
reduced-motion behavior; leave explicit full Loading installation available.

## 11. Accessibility, responsive behavior, and localization

- Default to native table semantics, not `role="grid"` without a complete keyboard
  grid model. Require a meaningful accessible table name or caption in examples.
- Use semantic headers, sorting buttons, `aria-sort`, labeled checkboxes, and
  visible keyboard focus. Announce selection and loading results without noisy
  per-row live regions.
- Header checkbox supports indeterminate through the existing Checkbox API.
- All labels, plural/count/range messages, page/cursor navigation, filter actions,
  empty/error feedback, and accessible names are localizable from one root labels
  configuration with function-based count formatters, not English string parsing.
- Scope wide-table scrolling inside the table container; toolbar/actions wrap on
  narrow viewports. Long labels/cells do not cause page-level horizontal overflow.
- Use established theme tokens and `cn` merging. Verify light/dark, compact/default,
  sticky behavior, RTL layout, reduced motion, and long-content states.
- Native table/scroll rendering does not require a separate Table, Pagination,
  Skeleton, or ScrollArea registry prerequisite.

## 12. Distribution and documentation

Deliver a `data-grid` UI registry item with its complete source/dependency graph,
and a separate `data-grid-schema` reusable item so backend contracts can be
installed without React runtime dependencies. Share schema file targets
consistently and avoid incompatible duplicate installation content. Provide
`data-grid-stories` as an optional stories-only item, not a dependency of core.

Document React/styling requirements, TanStack Table v9, Query v5, Zod v4, required
QueryClientProvider, portable import targets, and safe client/server boundaries.
Declare minimum dependency versions based on verified public APIs during planning
and implementation, rather than untested broad ranges.

Use the established generated docs and playground shell. Include runnable page
and cursor remote-data examples, native queryOptions and tRPC-style integration
guidance, custom Select/DateRangePicker filters, Apply behavior, all-matching
selection, variants, rendering customization, and controlled-state usage. Mock
backend examples process only the requested page through an async Query function;
make clear they are simulations, not a backend/database implementation.

Playground controls include variant, density, pagination mode, filter mode,
selection mode, sticky header, and representative async states. Generated code
and preview share typed configuration; Reset restores configuration, interaction,
draft, selection, and cursor history. The gallery default demo remains usable in a
narrow card. Portable stories use only distributed files and consumer dependencies.

## 13. Acceptance evidence

### Contract and typing

- Zod validation of pagination limits, counts, cursor shape, sort keys/duplicates,
  filters, outputs, and selection descriptors.
- Shared schema-only consumption without a React/client import graph.
- Consumer compile tests for field/value inference, computed accessors, display
  columns, sort-key mapping, page/cursor distinctions, and selected Query outputs.
- Invalid fields/values must fail compilation; no consumer `any`/casts required.

### Behavior

- Atomic resets and complete query-key examples; backend order preserved.
- Immediate/debounced filters, pending edits, Apply validation, baseline resets,
  controlled state, external restoration, and cleanup on unmount.
- Cursor next/previous, response failure/retry, branching, and history reset.
- Page correction after changing backend counts without a request loop.
- Explicit cross-page selection, all-matching/exclusions, indeterminate header,
  filter reset, scope remount, and placeholder interaction safety.
- Query initial/refresh/error/paused/disabled states, retry, and no duplicate cache.
- Existing registry controls and custom render hooks retain labels, refs, handlers,
  and meaningful interaction behavior.

### Delivery

- Playground control/preview/generated-code parity, valid generated consumer TSX,
  Reset, Copy, representative stories, and discovery integration.
- Registry artifacts and real CLI installation in an isolated consumer with a
  non-default alias; schema-only and Next.js client-boundary consumption.
- Fresh relevant typecheck, focused runtime tests, formatting/lint, registry build,
  production build, and final integrated checks proportional to risk.
- Browser evidence on the user's approved primary dev server for desktop/mobile,
  keyboard, light/dark, variants/density, sticky/overflow, custom filters, and async
  states. Ask for the server URL when needed; do not guess or start another server.
- Storybook UI is not verified because this repository has no Storybook server;
  type/composition checks do not claim Storybook visual verification.

All heavy checks run sequentially under `.agent/frontend-workflow.md` memory-safety
rules: inherited heap limits, finite process-tree deadlines, focused serial tests,
bounded assertion output, and no automatic escalation after OOM or timeout.

## 14. Workflow and references

After user approval of this written spec, create an implementation plan with
explicit execution batches, dependencies, and acceptance gates. Exactly one final
batch owns the full-plan audit and repository-wide integrated gate. Offer the
required five execution modes after plan approval; branch choice precedes
implementation. Do not implement, delegate, create a worktree, merge, or push as a
side effect of specification approval.

References used for design judgment, not wholesale source adaptation:

- ReUI: https://reui.io/docs/components/base/data-grid
- MUI: https://mui.com/x/react-data-grid/server-side-data/
- AG Grid: https://www.ag-grid.com/react-data-grid/column-definitions/
- Mantine React Table: https://www.mantine-react-table.com/docs/examples/react-query
- React Aria: https://react-aria.adobe.com/Table
- TanStack Table: https://tanstack.com/table/v9/docs/framework/react/guide/composable-tables
- TanStack Query: https://tanstack.com/query/latest/docs/framework/react/guides/query-options
- tRPC: https://trpc.io/docs/client/tanstack-react-query/usage
- Zod: https://zod.dev/api
- User reference: `/home/alfarizi/dev/work/jogiia/project-rnd/project-rnd-frontend/components/data-table/`

Source adaptations, if any are later proposed, require accurate attribution and
license preservation. Project ownership, existing registry conventions, and
agreed behavior take precedence over reference-library API details.
