"use client";

// Timer-backed cancellable mock service needs a Promise constructor.
/* eslint-disable promise/avoid-new */

import { useEffect, useState } from "react";

import { Autocomplete } from "@/registry/new-york/autocomplete";

import { autocompleteUsers } from "./autocomplete-demo";
import type { AutocompleteUser } from "./autocomplete-demo";

// Simulated service: deterministic delay/failure, cancellable timer. Applications
// replace this with fetch(url, { signal }) and retain the same ownership boundary.
const searchPeople = (
  query: string,
  signal: AbortSignal
  // Timer-backed cancellable mock service needs a Promise constructor.
  // eslint-disable-next-line promise/avoid-new
): Promise<AutocompleteUser[]> =>
  new Promise((resolve, reject) => {
    const abort = () => {
      // The callback runs after the timer is initialized.
      // eslint-disable-next-line no-use-before-define
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    const timer = setTimeout(
      () => {
        signal.removeEventListener("abort", abort);
        if (query.toLowerCase() === "error") {
          reject(
            new Error("Suggestions unavailable. Change the query to retry.")
          );
        } else {
          resolve(
            query === "slow"
              ? [autocompleteUsers[0]]
              : autocompleteUsers.filter((person) =>
                  person.name.toLowerCase().includes(query.toLowerCase())
                )
          );
        }
      },
      query === "slow" ? 700 : 120
    );
    signal.addEventListener("abort", abort, { once: true });
  });
export const AutocompleteAsyncDemo = () => {
  const [value, setValue] = useState<AutocompleteUser | null>(null);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<AutocompleteUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestionError, setError] = useState<string | undefined>();
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(undefined);
    const search = async () => {
      try {
        const results = await searchPeople(query, controller.signal);
        if (!controller.signal.aborted) {
          setItems(results);
          setLoading(false);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(
            error instanceof Error ? error.message : "Suggestions unavailable."
          );
          setLoading(false);
        }
      }
    };
    const timer = setTimeout(() => {
      void search();
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);
  return (
    <div className="grid w-80 max-w-full gap-2">
      <Autocomplete
        mode="selection"
        items={items}
        getItemLabel={(person) => person.name}
        getItemValue={(person) => person.id}
        value={value}
        onValueChange={setValue}
        inputValue={query}
        onInputValueChange={setQuery}
        filter={null}
        loading={loading}
        error={suggestionError}
        label="Async assignee"
        placeholder='Search people or type "error"'
        clearable
      />
      <output className="text-xs text-muted-foreground">
        Committed: {value?.id ?? "null"}
      </output>
      <p className="text-xs text-muted-foreground">
        300ms debounce, deterministic local service. “slow” simulates a delayed
        result; “error” fails predictably.
      </p>
    </div>
  );
};
