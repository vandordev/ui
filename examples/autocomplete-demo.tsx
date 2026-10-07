"use client";

import { useState } from "react";

import { Autocomplete } from "@/registry/new-york/autocomplete";

const frameworks = ["React", "Vue", "Svelte", "Solid"];
export const autocompleteUsers = [
  { id: "ada", name: "Ada Lovelace", team: "Engineering" },
  { id: "bea", name: "Bea Chen", team: "Design" },
  { id: "cam", name: "Cam Rivera", team: "Engineering" },
];
export type AutocompleteUser = (typeof autocompleteUsers)[number];
const identity = {
  getItemLabel: (user: AutocompleteUser) => user.name,
  getItemValue: (user: AutocompleteUser) => user.id,
};

export const AutocompleteDemo = () => {
  const [value, setValue] = useState("");
  return (
    <div className="grid w-64 max-w-full gap-2">
      <Autocomplete
        items={frameworks}
        label="Framework"
        placeholder="Search or type a framework"
        value={value}
        onValueChange={setValue}
        clearable
      />
      <output className="text-xs break-words text-muted-foreground">
        Text: {value || "(empty)"}
      </output>
    </div>
  );
};
export const AutocompleteFreeTextMultipleDemo = () => {
  const [tags, setTags] = useState<string[]>([]);
  return (
    <div className="grid w-80 max-w-full gap-2">
      <Autocomplete
        multiple
        items={frameworks}
        label="Tags"
        placeholder="Type and press Enter"
        value={tags}
        onValueChange={setTags}
        clearable
      />
      <output className="text-xs break-words text-muted-foreground">
        Committed: {JSON.stringify(tags)}
      </output>
    </div>
  );
};
export const AutocompleteSelectionDemo = () => {
  const [user, setUser] = useState<AutocompleteUser | null>(null);
  const [query, setQuery] = useState("");
  return (
    <div className="grid w-80 max-w-full gap-2">
      <Autocomplete
        mode="selection"
        items={autocompleteUsers}
        {...identity}
        value={user}
        onValueChange={setUser}
        inputValue={query}
        onInputValueChange={setQuery}
        label="Assignee"
        placeholder="Find a person"
        clearable
      />
      <output className="text-xs break-words text-muted-foreground">
        Committed ID: {user?.id ?? "null"}; query: {JSON.stringify(query)}
      </output>
    </div>
  );
};
export const AutocompleteSelectionMultipleDemo = () => {
  const [users, setUsers] = useState<AutocompleteUser[]>([]);
  return (
    <div className="grid w-80 max-w-full gap-2">
      <Autocomplete
        mode="selection"
        multiple
        items={autocompleteUsers}
        {...identity}
        value={users}
        onValueChange={setUsers}
        label="Assignees"
        placeholder="Find people"
        clearable
      />
      <output className="text-xs break-words text-muted-foreground">
        IDs in order: {JSON.stringify(users.map((user) => user.id))}
      </output>
    </div>
  );
};
