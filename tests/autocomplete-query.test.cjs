/* eslint-disable global-require */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createAutocompleteFixture } = require("./autocomplete-ui-fixture.cjs");

test("real Query gates closed search, preserves controlled authority and debounce", async () => {
  const f = await createAutocompleteFixture();
  const { QueryClient, QueryClientProvider, queryOptions, skipToken } = require("@tanstack/react-query");
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  try {
    const { useAutocompleteQuery } = f.jiti("../registry/new-york/use-autocomplete-query.ts");
    let latest;
    const requests = [];
    const Demo = ({ enabled = true, skip = false, controlled }) => {
      latest = useAutocompleteQuery({ mode: "selection", search: controlled, minSearchLength: 2, debounceMs: 10, enabled, queryOptions: ({ search }) => queryOptions({ queryKey: ["people", search], queryFn: skip ? skipToken : async () => { requests.push(search); return [{ id: search }]; } }), getItems: (data) => data });
      return null;
    };
    const render = (props) => f.render(f.React.createElement(QueryClientProvider, { client }, f.React.createElement(Demo, props)));
    const wait = () => f.React.act(async () => { await new Promise((resolve) => setTimeout(resolve, 35)); });
    await render({});
    await f.React.act(async () => latest.setSearch("ada"));
    await wait();
    assert.equal(requests.length, 0, "Closed popup does not fetch");
    await f.React.act(async () => latest.setOpen(true));
    await wait();
    assert.equal(requests.join(","), "ada");
    await f.React.act(async () => latest.setSearch("grace"));
    assert.equal(latest.autocompleteProps.items.length, 0, "Unsettled search blocks old options");
    await wait();
    assert.equal(requests.join(","), "ada,grace");
    await render({ enabled: false });
    await f.React.act(async () => latest.setSearch("disabled"));
    await wait();
    await f.React.act(async () => latest.autocompleteProps.onRetry());
    assert.equal(requests.length, 2, "Retry cannot bypass hook gate");
    await render({ skip: true });
    await wait();
    assert.equal(requests.length, 2, "skipToken is respected");
    await render({ controlled: "owned", enabled: false });
    await f.React.act(async () => latest.setSearch("ignored"));
    assert.equal(latest.search, "owned", "Controlled state remains authoritative");
  } finally { await f.cleanup(); client.clear(); }
});
