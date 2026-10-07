# Autocomplete Query integration and feature-family installation

Date: 2026-10-07
Status: Written specification approved by the user in conversation.

## Outcome

Extend the existing four-mode Autocomplete with optional TanStack Query hooks and
agnostic infinite-pagination UI. Install Autocomplete and DataGrid as component
families outside the consumer's `ui/` directory, with public `index.ts` entries.
Preserve existing selection, tags, keyboard, form, and DataGrid runtime contracts.

This specification extends the original autocomplete specification; it does not
replace unrelated behavior. The newly approved loading, pagination, optional
Query integration, and installation rules supersede the earlier defaults where
they differ.

## Approved decisions

- Two hooks: `useAutocompleteQuery` and `useAutocompleteInfiniteQuery`.
- Hooks run Query using an application-supplied query-options factory; no backend
  endpoint, response shape, or cache-key convention is imposed.
- Core UI and pagination remain Query-agnostic; Query installation is optional.
- Hooks bind search/open and provide mode-aware `autocompleteProps`. Committed
  selections and tags remain application-owned.
- Fetch is enabled by default only when popup is open, search meets its minimum,
  debounce is settled, and application options permit fetching.
- Infinite pagination supports automatic near-end scroll loading plus an
  accessible Load more button. Failed next-page loading requires explicit Retry.
- Use the public registry `Loading` component, not `LoadingArc` or a new spinner.
  Installing the entire loading catalog is explicitly accepted by the user.
- Error and empty UI are custom compact autocomplete feedback. Do not depend on
  registry `ErrorState` or `Empty` for this component.
- Default family directories are `components/autocomplete/` and
  `components/data-grid/`, with `index.ts` entries.
- DataGrid changes are installation/import/docs/stories/verification changes only,
  not a redesign, new data behavior, or public API rewrite.

## Existing integration boundary

Current autocomplete accepts items, text/query bindings, open state, loading/error,
and `filter={null}`. Its root gates suggestion commits when loading/error is active,
and the convenience list suppresses these results. Consequently next-page loading
or errors must not map to its existing blocking initial loading/error flags.

Current DataGrid and autocomplete files are registered as `registry:ui` without
family installation targets. Current relative sibling imports assume common UI
placement. Moving a family therefore requires actual dependency import rewriting
and target verification, not merely replacing example import strings.

## Hook API and ownership

Illustrative API fragments:

```tsx
const suggestions = useAutocompleteQuery({
  mode: "selection",
  queryOptions: ({ search }) =>
    queryOptions({
      queryKey: ["users", "autocomplete", search],
      queryFn: ({ signal }) => searchUsers({ search, signal }),
      staleTime: 30_000,
    }),
  getItems: (data) => data.users,
  debounceMs: 300,
  minSearchLength: 0,
});

const suggestions = useAutocompleteInfiniteQuery({
  mode: "selection",
  multiple: true,
  queryOptions: ({ search }) =>
    infiniteQueryOptions({
      queryKey: ["users", "autocomplete", search],
      initialPageParam: null as string | null,
      queryFn: ({ pageParam, signal }) =>
        searchUsers({ search, cursor: pageParam, signal }),
      getNextPageParam: (page) => page.nextCursor ?? undefined,
    }),
  getItems: (page) => page.users,
  getItemValue: (user) => user.id,
});

<Autocomplete
  {...suggestions.autocompleteProps}
  value={assignees}
  onValueChange={setAssignees}
  getItemLabel={(user) => user.name}
  getItemValue={(user) => user.id}
  label="Assignees"
/>;
```

Delivered examples must be independently runnable with imports, provider, request
implementation, types and state. These fragments do not imply a shared declaration
scope or a final TypeScript signature.

### Inputs

- `mode` defaults `free-text`; `multiple` defaults false. Both retain the original
  four-way value contract and infer correct JSX/callback types without casts.
- `queryOptions({ search })` receives debounced search, not the raw draft. Standard
  Query options and infinite options infer data, error, key, and page-param types.
- `getItems(data)` maps selected query data to readonly items. Infinite
  `getItems(page)` maps each page in the post-`select` infinite data collection;
  `select` must preserve the `pages`/`pageParams` structure. Do not infer item types
  from raw data when `select` changes the returned page shape.
- Infinite `getItemValue(item)` supplies stable string IDs for deduplication.
  String items may use their string value without an accessor. Preserve first-seen
  order and first-seen item for duplicate IDs; do not mutate Query cached pages.
- `debounceMs` defaults 300 and `minSearchLength` defaults 0. Invalid negative or
  nonfinite timing/length inputs must not create uncontrolled timers or requests.
- `search`/`defaultSearch`/`onSearchChange` and
  `open`/`defaultOpen`/`onOpenChange` allow controlled or uncontrolled hook state.
  Preserve caller-controlled authority. Expose current search/open and setters.
- The application determines query keys, request/filter scope, retry, cache,
  `getNextPageParam`, and `initialPageParam`. Query key must include search and
  other request identity; documentation makes this responsibility explicit.
- Query cancellation uses TanStack Query lifecycle and a query function consuming
  `signal`; merely closing a popup does not promise request abortion.
- Runtime-disabled or read-only fields must not trigger interactive pagination.
  Provide a hook-level enable gate for such application conditions in addition to
  the query options' enabled setting.

### Outputs and mode-aware bindings

- Expose native Query result as `query`, plus current search/open/setters and
  `autocompleteProps`; infinite additionally exposes agnostic pagination bindings.
- `autocompleteProps` includes literal mode/multiple, items, `filter={null}`,
  appropriate text binding, open binding, initial/search state and pagination.
- Selection single/multiple and free-text multiple bind `inputValue` and
  `onInputValueChange`; the props do not own their committed `value` callbacks.
- Free-text single binds `value` and `onValueChange` because text is the application
  value. Application ownership is available through controlled `search`; there is
  no conflicting `inputValue` on this mode. Docs show both ownership paths.
- No fetching hook silently changes committed selected objects/tags as results,
  pages, filters, or cache entries change. Original label-restoration/reset/form
  behavior remains intact when bindings are applied.
- Compound compositions consume the same bindings through `AutocompleteRoot` and
  the public feedback/pagination parts; no separate fetching implementation.
- Query `Error` objects are not passed unformatted as React children. Safe default
  messages and application error formatting handle initial and page errors.

## Fetch eligibility, debounce and query changes

Effective automatic fetching is the intersection of open popup, minimum length,
settled debounce, hook-level enable gate, and Query options' enabled semantics.
Honor boolean and function enabled settings supported by installed Query, and
`skipToken` where applicable. Never force an application-disabled query to fetch.

Retries and Load more respect eligibility and availability; explicit UI actions
must not bypass the minimum-length/disabled/closed gate via a Query refetch call.
Native Query methods remain accessible to an application making its own decisions.

When raw search differs from debounced search, previous-search results cannot be
selected as if they belong to the new query. Show a compact searching state while
waiting. Do not clear committed choices. When closed, do not show loading for an
inactive query solely because Query is pending without an active request.

Distinct query keys prevent out-of-order search results mixing into a new search.
Placeholder data from a different key/search is not selectable. Same-search cache
data may be displayed immediately when valid. Background refetch does not block
selection of same-search data unless data identity no longer matches the request.

Minimum-length gating displays a configurable hint, not an empty-results claim.
Clearing or resetting search updates bindings and debounce safely. Cleanup timers
on unmount and avoid stale state writes. No new endpoint or custom request cache.

## Agnostic pagination and compact feedback

Core receives pagination information independent of TanStack Query: whether more
items exist, whether another page is loading, any page-error message, and callable
load/retry actions. Define a bounded typed pagination prop and compound footer part
during planning; keep initial/search state distinct from page state.

| Condition                                   | Presentation and interaction                                     |
| ------------------------------------------- | ---------------------------------------------------------------- |
| Below minimum search length                 | Compact hint, no selectable old suggestions                      |
| Debouncing/initial search                   | `Loading` with compact text, previous-search suggestions blocked |
| No results after successful eligible search | Custom compact empty message                                     |
| Initial error with no usable results        | Custom compact error and Retry                                   |
| Same-search background refetch              | Existing valid options retained; small `Loading` indicator       |
| Loading next page                           | Existing options retained; `Loading` in footer                   |
| Error next page                             | Existing options retained; compact footer error + Retry          |
| More pages available                        | Accessible Load more, in addition to auto-scroll                 |
| No more pages                               | No Load more control                                             |

Use `loadingProps` matching the existing public `LoadingProps`, including variant
and variant-specific props, with compact size defaults suitable for popup/footer.
Do not invent a parallel variant union or substitute another spinner. Registry
dependency must install the complete Loading graph and licenses. Avoid duplicate
live announcements from nested Loading/status regions.

Hint/loading/empty/error/Retry/Load more text is customizable. Keep error messages
safe, descriptions concise, controls accessibly named, and existing theme tokens.
Custom feedback content remains available through compound composition. No
ErrorState/Empty dependency, large illustrations, additional card shells, or new
unrelated colors.

### Pagination triggers and race safety

- Observe the actual popup list scroll viewport. Never use document scroll as the
  result-list pagination boundary.
- Auto-load responds to user scroll near the end, not mere initial mounting or a
  sentinel that continuously fills a short container until every page is fetched.
- Keep one load operation in flight; guard against next-page fetch and conflicting
  background refetch, absent next cursor, obsolete query generation, closed popup,
  disabled/read-only, and duplicate trigger events.
- Append pages without resetting selection/highlight/focus or scroll position.
  Stable option IDs preserve accessibility relationships and selected state.
- Next-page error suppresses further automatic retry until explicit Retry succeeds
  or query identity changes. No observer/render retry loops.
- Footer controls remain keyboard reachable outside selectable option semantics.
  Load more/Retry do not commit input, select an option, or submit the owning form.
  Retain predictable focus while loading/appending and announce relevant progress.
- User keyboard/touch can load through the button. Auto-fetch on arrow navigation
  is not mandatory; do not wrap/clobber Base UI keyboard behavior to simulate it.
- Dedupe items using IDs, never label equality for object selections. Exhausted or
  empty pages follow the application's next-page contract, not guessed totals.

## Installation families and entry boundaries

### Autocomplete

Default consumer layout:

```text
components/autocomplete/
  index.ts
  autocomplete.tsx
  autocomplete-root.tsx
  autocomplete-types.ts
  autocomplete-utils.ts
  autocomplete-feedback.tsx
  autocomplete-pagination.tsx
  query.ts
  use-autocomplete-query.ts
  use-autocomplete-infinite-query.ts
  autocomplete.stories.tsx
```

The last four files are installed only by relevant optional Query/stories items.
Supporting query-state/types modules may be added when necessary without widening
scope. UI entry `index.ts` exports public UI/types only, no runtime Query import or
re-export. Query entry exports the two hooks and related public types, not another
copy of core UI. Do not mix server-safe data types with hook execution unnecessarily.

- Registry `autocomplete`: core family, feedback and pagination, required Loading
  graph and any actually used shared action primitive.
- Registry `autocomplete-query`: optional query hooks/entry, Query version floor
  matching tested public API, dependency on core autocomplete.
- Registry `autocomplete-stories`: stories only; no core/Query dependency installs
  or overwrites. Core stories stay Query-free. Query examples are runnable docs
  examples; any separate Query stories require explicitly installed prerequisites.

Default public imports:

```tsx
import { Autocomplete, AutocompleteRoot } from "@/components/autocomplete";
import {
  useAutocompleteQuery,
  useAutocompleteInfiniteQuery,
} from "@/components/autocomplete/query";
```

Ordinary UI imports must compile/run without TanStack Query installed. Query
examples require a consumer-owned `QueryClientProvider`; never install a hidden
global Query client/provider.

### DataGrid

Install DataGrid-owned UI, hooks, state, columns, controls, feedback, labels and
selection modules under `components/data-grid/`. Provide `index.ts` exporting the
existing public UI/hook/column API without renaming behavior. Provide `schema.ts`
as a server-safe entry to its existing contract/schema functions and types.

Registry `data-grid-schema` installs only schema modules/entry and Zod requirements;
it must not require React/TanStack Query/Table or install the full UI. Registry
`data-grid` depends on this compatible schema item, and stories install beside the
public family without reinstalling it. Do not duplicate divergent `index.ts`
targets across schema-only and full items.

Shared Button/Checkbox/Select/Dropdown/InputSearch/Loading and error foundation
files, where used by DataGrid today, are not automatically migrated as part of the
family. Fix imports to their actual dependency install locations and validate
aliases. Shared target content must agree between registry items.

### Alias handling and migration

Use the consumer's configured components alias/layout; do not hard-code `@/` or
assume the UI alias equals the family directory. The exact supported registry file
types/targets/rewrite mechanism must be proven against installed shadcn CLI in the
plan's earliest packaging task. A default directory example is not permission to
silently break nondefault components/UI aliases.

Update the project distribution guidance with a narrowly scoped family-installation
convention, including stories colocated outside UI; do not silently violate the
current blanket stories `registry:ui`/no-fixed-target convention. Ordinary primitive
items keep their existing policy. Verify family entry/client boundaries with real
CLI installation and an independent Next.js consumer, not source-only alias maps.

Keep registry names/URLs stable where possible. Update docs/examples/generated
snippets/manual setup/stories discovery to new imports. CLI migration does not
delete old consumer `ui/` files: explain review, customization transfer and deliberate
old-copy removal. Never remove or overwrite user customizations automatically.
Installing stories-only after custom core changes must preserve every core checksum.

## Delivery surfaces

- Extend Autocomplete docs with query and infinite examples, state table, ownership,
  enabled/query-key/cancellation/provider rules, pagination and Loading customization.
- Real playground controls demonstrate status and pagination; code and preview
  share typed config and Reset clears interaction/draft/pagination scenario state.
- Portable core stories cover compact initial/empty/error, next-page loading/error,
  Load more/retry and custom Loading variant, without site dependencies/providers.
- Deterministic examples cover cursor search, cancellation/out-of-order responses,
  initial and next-page failure, cached refetch, single/multiple and free-text binding.
- Query integration has discoverable registry install/dependency instructions without
  promising installation that silently upgrades an existing Query setup.
- DataGrid docs, examples, stories and server schema snippets adopt family imports
  without unrelated copy/API redesign. Historical specs remain historical.

## Verification and acceptance

Follow all `.agent/` standards, including bounded serial Node verification and
OpenChamber browser-first rules. Evidence must cover:

1. All four hook binding types, native query-options factory inference including
   `select`/infinite page params, controlled search/open, absence of invalid
   `inputValue` on single free-text, and original selected-item callback types.
2. Real QueryClient + mounted React/Base UI integration: debounce/open/minimum/
   enabled/skipToken gates, cancellation signal usage, out-of-order queries,
   placeholder-data safety, query-key page separation and unchanged committed values.
3. Infinite dedupe, one request at a time, retained items during background/page
   loading or page error, retry latch, no short-list draining, actual list scroll
   trigger and accessible footer interactions.
4. Existing autocomplete refs/events/form/reset/IME/chip tests and DataGrid behavior
   regression evidence. No API changes concealed as packaging.
5. Playground preview/code/control parity, complete generated-code compilation,
   actual story types/composition, doc/gallery/navigation correctness.
6. Generated manifest/source parity and dependency graph, default plus nondefault
   aliases, independent CLI installs of core/Query/DataGrid/schema/stories items,
   missing-Query-free core import, schema-only server import and client boundaries,
   customized files unchanged by stories-only installs. Durable checks run in CI.
7. Desktop/mobile/light/dark/reduced-motion browser states, list scroll/popup layering,
   keyboard/footer focus, retry, long lists/chips, Loading variants and native forms
   through the user's agreed primary server. Ask for URL; do not guess or start a
   server/Playwright. Record missing evidence rather than claim visual completion.

Tests inherit 512 MiB heap with serial concurrency and process-tree deadlines.
Other Node checks have explicit budgets at most 2048 MiB, finite deadlines and
conservative workers. Heavy checks sequential; no connected DOM assertion output,
unsafe OOM retry or automatic heap increases. Storybook UI is not verified because
no server exists, an accepted repository limitation, not proof of appearance.

## Non-goals

Virtualization, backend endpoints, user-list business logic, selected-value ownership
inside fetching hooks, DataGrid redesign/runtime feature work, moving unrelated
primitive families, trimming the Loading catalog, hidden Query providers, automatic
deletion of legacy consumer files, and new Storybook/preview/browser servers.

## Next gate

User reviews this written specification before an implementation plan is produced.
The plan must explicitly batch core feedback/pagination, hooks/integration, family
packaging including DataGrid, delivery surfaces, and final integrated acceptance.
High-risk typing/CLI-rewrite proof occurs before dependent commitments. Exactly one
final batch owns the full-spec audit and repository-wide gate. Execution mode and
branch remain unselected; no component implementation begins during spec writing.
