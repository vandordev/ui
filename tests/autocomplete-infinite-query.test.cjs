/* eslint-disable global-require */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createAutocompleteFixture } = require("./autocomplete-ui-fixture.cjs");

test("next page dedupes, latches error and requires explicit retry", async () => {
  const f = await createAutocompleteFixture();
  const { QueryClient, QueryClientProvider, infiniteQueryOptions } = require("@tanstack/react-query");
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  try {
    const { useAutocompleteInfiniteQuery } = f.jiti("../registry/new-york/use-autocomplete-infinite-query.ts");
    let latest;
    let requests = 0;
    let fail = true;
    const Demo = () => {
      latest = useAutocompleteInfiniteQuery({ mode: "selection", defaultOpen: true, debounceMs: 0, queryOptions: ({ search }) => infiniteQueryOptions({ queryKey: ["pages", search], initialPageParam: 0, queryFn: async ({ pageParam }) => { requests += 1; if (pageParam === 1 && fail) { throw new Error("Page failure"); } return { items: pageParam === 0 ? [{ id: "a", label: "first" }] : [{ id: "a", label: "duplicate" }, { id: "b", label: "second" }], next: pageParam === 0 ? 1 : undefined }; }, getNextPageParam: (page) => page.next }), getItems: (page) => page.items, getItemValue: (item) => item.id });
      return null;
    };
    const wait = () => f.React.act(async () => { await new Promise((resolve) => setTimeout(resolve, 20)); });
    await f.render(f.React.createElement(QueryClientProvider, { client }, f.React.createElement(Demo)));
    await wait();
    assert.equal(requests, 1, "No mount draining");
    await f.React.act(async () => { await Promise.all([latest.pagination.onLoadMore(), latest.pagination.onLoadMore()]); });
    await wait();
    assert.equal(requests, 2, "Only one next-page request");
    assert.equal(latest.autocompleteProps.items.length, 1, "Retain items on page error");
    assert.equal(latest.pagination.error, "Could not load more suggestions.");
    await f.React.act(async () => latest.pagination.onLoadMore());
    assert.equal(requests, 2, "Automatic retry latched");
    fail = false;
    await f.React.act(async () => latest.pagination.onRetry());
    await wait();
    assert.equal(requests, 3);
    assert.equal(latest.autocompleteProps.items.map((item) => item.label).join(","), "first,second");
    assert.equal(latest.pagination.hasNextPage, false);
  } finally { await f.cleanup(); client.clear(); }
});
