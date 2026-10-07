import type { ReactNode } from "react";
import type { AutocompleteCommonProps, AutocompleteMode } from "./autocomplete-types";

export interface AutocompleteQueryStateOptions {
  search?: string;
  defaultSearch?: string;
  onSearchChange?: (search: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  enabled?: boolean;
  debounceMs?: number;
  minSearchLength?: number;
  hintMessage?: ReactNode;
}

export type AutocompleteQueryBinding<
  Item,
  Mode extends AutocompleteMode,
  Multiple extends boolean,
> = Pick<AutocompleteCommonProps<Item>, "items" | "filter" | "open" | "onOpenChange" | "loading" | "error"> & {
  mode: Mode;
  multiple: Multiple;
} & (Mode extends "free-text"
  ? Multiple extends false
    ? { value: string; onValueChange: (value: string) => void; inputValue?: never; onInputValueChange?: never }
    : { inputValue: string; onInputValueChange: (value: string) => void }
  : { inputValue: string; onInputValueChange: (value: string) => void });
