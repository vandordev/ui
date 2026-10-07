"use client";

import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
} from "@tanstack/react-query";
import { useState } from "react";

import { Autocomplete } from "../registry/new-york/autocomplete";
import { useAutocompleteQuery } from "../registry/new-york/autocomplete-query";

const names = [
  "Ada Lovelace",
  "Grace Hopper",
  "Margaret Hamilton",
  "Katherine Johnson",
  "Alan Turing",
  "Barbara Liskov",
];
export const searchAutocompletePeople = async (
  search: string,
  signal: AbortSignal
) => {
  await new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    const timer = setTimeout(
      () => {
        signal.removeEventListener("abort", abort);
        resolve();
      },
      search === "slow" ? 600 : 100
    );
    if (signal.aborted) {
      abort();
    } else {
      signal.addEventListener("abort", abort, { once: true });
    }
  });
  return names
    .map((name, index) => ({ id: String(index), name }))
    .filter(
      (person) =>
        search === "slow" ||
        search === "error" ||
        person.name.toLowerCase().includes(search.toLowerCase())
    );
};
type Person = { id: string; name: string };
const QueryExample = () => {
  const [selected, setSelected] = useState<Person | null>(null);
  const [failed, setFailed] = useState(false);
  const suggestions = useAutocompleteQuery({
    mode: "selection",
    minSearchLength: 2,
    queryOptions: ({ search }) =>
      queryOptions({
        queryKey: ["demo-people", search],
        retry: false,
        queryFn: async ({ signal }) => {
          if (search === "error" && !failed) {
            setFailed(true);
            throw new Error("Predictable initial failure");
          }
          return searchAutocompletePeople(search, signal);
        },
      }),
    getItems: (data) => data,
  });
  return (
    <div className="grid w-80 max-w-full gap-2">
      <Autocomplete
        {...suggestions.autocompleteProps}
        label="Person"
        value={selected}
        onValueChange={setSelected}
        getItemLabel={(person) => person.name}
        getItemValue={(person) => person.id}
        loadingProps={{ variant: "dots", size: 16 }}
      />
      <p className="text-xs text-muted-foreground">
        Type “error” once to exercise Retry, or “slow” for delayed results.
      </p>
    </div>
  );
};
export const AutocompleteQueryDemo = () => {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <QueryExample />
    </QueryClientProvider>
  );
};
