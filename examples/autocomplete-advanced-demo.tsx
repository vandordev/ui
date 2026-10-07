"use client";

import {
  Autocomplete,
  AutocompleteRoot,
  AutocompleteInput,
  AutocompleteContent,
  AutocompleteList,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteItem,
  AutocompleteEmpty,
} from "@/registry/new-york/autocomplete";

const people = [
  {
    description: "Analytical engines",
    id: "ada",
    name: "Ada Lovelace",
    team: "Engineering",
  },
  {
    description: "Product systems",
    id: "bea",
    name: "Bea Chen",
    team: "Design",
  },
  {
    description: "Unavailable",
    disabled: true,
    id: "cam",
    name: "Cam Rivera",
    team: "Engineering",
  },
];
export const AutocompleteAdvancedDemo = () => (
  <div className="grid w-80 max-w-full gap-5">
    <Autocomplete
      mode="selection"
      items={people}
      getItemLabel={(person) => person.name}
      getItemValue={(person) => person.id}
      groupBy={(person) => person.team}
      isItemDisabled={(person) => Boolean(person.disabled)}
      label="Team member"
      renderItem={(person) => (
        <span className="grid gap-0.5">
          <span>{person.name}</span>
          <span className="text-xs text-muted-foreground">
            {person.description}
          </span>
        </span>
      )}
    />
    <AutocompleteRoot items={["React", "Vue", "Svelte"]}>
      <label htmlFor="composed-framework" className="text-sm font-medium">
        Composed framework
      </label>
      <AutocompleteInput id="composed-framework" placeholder="Search or type" />
      <AutocompleteContent>
        <AutocompleteEmpty />
        <AutocompleteList>
          <AutocompleteGroup>
            <AutocompleteGroupLabel>Frameworks</AutocompleteGroupLabel>
            {["React", "Vue", "Svelte"].map((item) => (
              <AutocompleteItem key={item} value={item}>
                {item}
              </AutocompleteItem>
            ))}
          </AutocompleteGroup>
        </AutocompleteList>
      </AutocompleteContent>
    </AutocompleteRoot>
  </div>
);
