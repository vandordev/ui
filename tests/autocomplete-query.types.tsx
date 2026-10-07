import { infiniteQueryOptions, queryOptions, skipToken, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { AutocompleteQueryBinding } from "../registry/new-york/autocomplete-query-types";
import { Autocomplete } from "../registry/new-york/autocomplete";
import { useAutocompleteQuery, useAutocompleteInfiniteQuery } from "../registry/new-york/autocomplete-query";

interface Person { id: string; name: string }
const people: Person[] = [{ id: "a", name: "Ada" }];

export function HookInferenceProbe() {
  const single = useAutocompleteQuery({ mode: "selection", queryOptions: ({ search }) => queryOptions({ queryKey: ["people", search], queryFn: async () => ({ users: people }), select: (data) => data.users }), getItems: (data) => data });
  const infinite = useAutocompleteInfiniteQuery({ mode: "selection", multiple: true, queryOptions: ({ search }) => infiniteQueryOptions({ queryKey: ["pages", search], initialPageParam: null as string | null, queryFn: async ({ pageParam }) => ({ users: people, next: pageParam }), getNextPageParam: (page) => page.next ?? undefined, select: (data) => ({ ...data, pages: data.pages.map((page) => ({ items: page.users })) }) }), getItems: (page) => page.items, getItemValue: (item) => item.id });
  return <>
    <Autocomplete {...single.autocompleteProps} value={people[0]} getItemLabel={(item) => item.name} getItemValue={(item) => item.id} onValueChange={(value: Person | null) => value?.id} />
    <Autocomplete {...infinite.autocompleteProps} value={people} getItemLabel={(item) => item.name} getItemValue={(item) => item.id} onValueChange={(value: Person[]) => value.map((item) => item.id)} />
  </>;
}

export function NativeQueryContractProbe() {
  const ordinary = useQuery(queryOptions({ queryKey: ["people", "a"] as const, queryFn: async () => ({ users: people }), select: (data) => data.users, enabled: (query) => query.state.dataUpdatedAt === 0 }));
  const selected: Person[] | undefined = ordinary.data;
  const infinite = useInfiniteQuery(infiniteQueryOptions({ queryKey: ["pages", "a"] as const, initialPageParam: null as string | null, queryFn: async ({ pageParam, signal }) => ({ users: people, next: pageParam, aborted: signal.aborted }), getNextPageParam: (page) => page.next ?? undefined, select: (data) => ({ ...data, pages: data.pages.map((page) => ({ items: page.users })) }) }));
  const page: Person[] | undefined = infinite.data?.pages[0]?.items;
  useQuery(queryOptions({ queryKey: ["skip"] as const, queryFn: skipToken }));
  return <span>{selected?.length}{page?.length}</span>;
}

export function BindingProbe({ free, tags, single, multiple }: {
  free: AutocompleteQueryBinding<string, "free-text", false>;
  tags: AutocompleteQueryBinding<string, "free-text", true>;
  single: AutocompleteQueryBinding<Person, "selection", false>;
  multiple: AutocompleteQueryBinding<Person, "selection", true>;
}) {
  return <>
    <Autocomplete {...free} />
    <Autocomplete {...tags} value={["React"]} onValueChange={(value: string[]) => value.map(String)} />
    <Autocomplete {...single} value={people[0]} getItemLabel={(item) => item.name} getItemValue={(item) => item.id} onValueChange={(value: Person | null) => value?.id} />
    <Autocomplete {...multiple} value={people} getItemLabel={(item) => item.name} getItemValue={(item) => item.id} onValueChange={(value: Person[]) => value.map((item) => item.id)} />
  </>;
}
