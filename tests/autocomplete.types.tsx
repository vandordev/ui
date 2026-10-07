import {
  Autocomplete,
  AutocompleteRoot,
} from "../registry/new-york/autocomplete";
import type { AutocompleteValue } from "../registry/new-york/autocomplete";
interface User {
  id: string;
  name: string;
}
const users: readonly User[] = [{ id: "ada", name: "Ada" }];
const accessors = {
  getItemLabel: (user: User) => user.name,
  getItemValue: (user: User) => user.id,
};

export const free = (
  <Autocomplete
    items={["React"]}
    onValueChange={(next) => {
      const value: string = next;
      return value;
    }}
  />
);
export const tags = (
  <Autocomplete
    multiple
    items={["React"]}
    onValueChange={(next) => {
      const value: string[] = next;
      return value;
    }}
  />
);
export const selected = (
  <Autocomplete
    mode="selection"
    items={users}
    {...accessors}
    onValueChange={(next) => {
      const value: User | null = next;
      return value;
    }}
  />
);
export const selectedMany = (
  <Autocomplete
    mode="selection"
    multiple
    items={users}
    {...accessors}
    onValueChange={(next) => {
      const value: User[] = next;
      return value;
    }}
  />
);
export const objectSuggestions = (
  <Autocomplete
    items={users}
    {...accessors}
    onValueChange={(next) => {
      const value: string = next;
      return value;
    }}
  />
);
export const compound = (
  <AutocompleteRoot
    mode="selection"
    multiple
    items={users}
    {...accessors}
    onValueChange={(next) => {
      const value: User[] = next;
      return value;
    }}
  >
    <span />
  </AutocompleteRoot>
);
export const conditional: AutocompleteValue<User, "selection", true> = [
  ...users,
];
export const wrongTags = (
  // @ts-expect-error Multiple free text must be string[].
  <Autocomplete multiple items={["React"]} value="React" />
);
// @ts-expect-error Single free text has no separate query.
export const competingQuery = <Autocomplete items={["React"]} inputValue="R" />;
// @ts-expect-error Objects require explicit stable identity and label accessors.
export const noAccessors = <Autocomplete mode="selection" items={users} />;
export const wrongSelection = (
  // @ts-expect-error Selection must return the original item, not an ID.
  <Autocomplete mode="selection" items={users} {...accessors} value="ada" />
);
export const wrongChildren = (
  <Autocomplete items={["React"]}>
    {/* @ts-expect-error Convenience assembly owns children. */}
    <span />
  </Autocomplete>
);
export const inputConflict = (
  // @ts-expect-error Managed query cannot be supplied through inputProps.
  <Autocomplete items={["React"]} inputProps={{ value: "R" }} />
);
