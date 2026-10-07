"use client";

import { QueryClient, QueryClientProvider, infiniteQueryOptions } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Autocomplete } from "../registry/new-york/autocomplete";
import { useAutocompleteInfiniteQuery } from "../registry/new-york/autocomplete-query";
import { searchAutocompletePeople } from "./autocomplete-query-demo";

const InfiniteExample = () => {
  const [selected, setSelected] = useState<{ id: string; name: string }[]>([]);
  const failed = useRef(false);
  const suggestions = useAutocompleteInfiniteQuery({ mode: "selection", multiple: true, queryOptions: ({ search }) => infiniteQueryOptions({ queryKey: ["demo-pages", search], retry: false, initialPageParam: 0, queryFn: async ({ pageParam, signal }) => { const people = await searchAutocompletePeople(search, signal); if (pageParam === 2 && !failed.current) { failed.current = true; throw new Error("Predictable page failure"); } return { people: people.slice(pageParam, pageParam + 2), next: pageParam + 2 < people.length ? pageParam + 2 : undefined }; }, getNextPageParam: (page) => page.next }), getItems: (page) => page.people, getItemValue: (person) => person.id });
  return <div className="grid w-80 max-w-full gap-2"><Autocomplete {...suggestions.autocompleteProps} label="People" value={selected} onValueChange={setSelected} getItemLabel={(person) => person.name} getItemValue={(person) => person.id} /><p className="text-xs text-muted-foreground">Second page fails once. Retry keeps your selections and first-page results.</p></div>;
};
export const AutocompleteInfiniteDemo = () => {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}><InfiniteExample /></QueryClientProvider>;
};
