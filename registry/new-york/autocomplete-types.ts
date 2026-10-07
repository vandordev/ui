import type { Combobox } from "@base-ui/react/combobox";
import type { ComponentProps, ReactNode, Ref } from "react";
import type { LoadingProps } from "./loading";

export interface AutocompletePaginationProps {
  hasNextPage: boolean;
  fetchingNextPage: boolean;
  error?: ReactNode;
  disabled?: boolean;
  automatic?: boolean;
  onLoadMore: () => void | Promise<unknown>;
  onRetry?: () => void | Promise<unknown>;
  loadMoreLabel?: string;
  retryLabel?: string;
  loadingMessage?: ReactNode;
}

export type AutocompleteMode = "free-text" | "selection";
export type AutocompleteValue<
  Item,
  Mode extends AutocompleteMode,
  Multiple extends boolean,
> = Mode extends "selection"
  ? Multiple extends true
    ? Item[]
    : Item | null
  : Multiple extends true
    ? string[]
    : string;

export type AutocompleteInputProps = Omit<
  ComponentProps<"input">,
  | "children"
  | "value"
  | "defaultValue"
  | "name"
  | "form"
  | "disabled"
  | "readOnly"
  | "required"
  | "size"
  | "type"
>;
export type AutocompleteContentProps = Omit<
  Combobox.Popup.Props,
  "children" | "render"
> &
  Pick<
    Combobox.Positioner.Props,
    | "side"
    | "sideOffset"
    | "align"
    | "alignOffset"
    | "collisionBoundary"
    | "collisionPadding"
  >;

type Identity<Item> = [Item] extends [string]
  ? {
      getItemLabel?: (item: Item) => string;
      getItemValue?: (item: Item) => string;
    }
  : {
      getItemLabel: (item: Item) => string;
      getItemValue: (item: Item) => string;
    };

export type AutocompleteCommonProps<Item> = Identity<Item> & {
  items: readonly Item[];
  label?: string;
  labelStyle?: "static" | "floating";
  placeholder?: string;
  size?: "default" | "sm";
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  form?: string;
  invalid?: boolean;
  loading?: boolean;
  backgroundLoading?: boolean;
  loadingProps?: LoadingProps;
  hintMessage?: ReactNode;
  onRetry?: () => void | Promise<unknown>;
  retryLabel?: string;
  pagination?: AutocompletePaginationProps;
  error?: ReactNode;
  emptyMessage?: ReactNode;
  loadingMessage?: ReactNode;
  clearLabel?: string;
  removeLabel?: (label: string) => string;
  clearable?: boolean;
  showTrigger?: boolean;
  autoHighlight?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  filter?: ((item: Item, query: string) => boolean) | null;
  animated?: boolean;
  className?: string;
  inputProps?: AutocompleteInputProps;
  contentProps?: AutocompleteContentProps;
  ref?: Ref<HTMLInputElement>;
  renderItem?: (item: Item) => ReactNode;
  groupBy?: (item: Item) => string;
  isItemDisabled?: (item: Item) => boolean;
};

interface ValueProps<Value> {
  value?: Value;
  defaultValue?: Value;
  onValueChange?: (value: Value) => void;
}
interface QueryProps {
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (value: string) => void;
}
type FreeSingle = ValueProps<string> & {
  mode?: "free-text";
  multiple?: false;
  inputValue?: never;
  defaultInputValue?: never;
  onInputValueChange?: never;
};
type FreeMultiple = ValueProps<string[]> &
  QueryProps & { mode?: "free-text"; multiple: true };
type SelectionSingle<Item> = ValueProps<Item | null> &
  QueryProps & { mode: "selection"; multiple?: false };
type SelectionMultiple<Item> = ValueProps<Item[]> &
  QueryProps & { mode: "selection"; multiple: true };

export type AutocompleteProps<Item = string> = AutocompleteCommonProps<Item> &
  (
    | FreeSingle
    | FreeMultiple
    | SelectionSingle<NoInfer<Item>>
    | SelectionMultiple<NoInfer<Item>>
  ) & { children?: never };
export type AutocompleteRootProps<Item = string> =
  AutocompleteCommonProps<Item> &
    (
      | FreeSingle
      | FreeMultiple
      | SelectionSingle<NoInfer<Item>>
      | SelectionMultiple<NoInfer<Item>>
    ) & { children?: ReactNode };
