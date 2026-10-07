"use client";

// The four public contracts intentionally branch inside one primitive adapter.
/* eslint-disable complexity, no-nested-ternary */

import { Autocomplete as BaseAutocomplete } from "@base-ui/react/autocomplete";
import { Combobox } from "@base-ui/react/combobox";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import type {
  AutocompleteCommonProps,
  AutocompleteRootProps,
} from "./autocomplete-types";
import { normalizeAutocompleteTag } from "./autocomplete-utils";

interface Option {
  id: string;
  label: string;
  item: unknown;
  disabled: boolean;
}
type Configuration = Omit<
  AutocompleteCommonProps<unknown>,
  | "getItemLabel"
  | "getItemValue"
  | "isItemDisabled"
  | "filter"
  | "groupBy"
  | "renderItem"
>;
interface Adapter {
  config: Configuration;
  selection: boolean;
  multiple: boolean;
  textSingle: boolean;
  text: string;
  selected: { id: string; label: string }[];
  options: Option[];
  resolveOption: (item: unknown) => Option | undefined;
  open: boolean;
  setOpen: (next: boolean) => void;
  restore: () => void;
  clear: () => void;
  createTag: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
  chipsRef: RefObject<HTMLDivElement | null>;
  actionsRef: RefObject<Combobox.Root.Actions | null>;
  composing: RefObject<boolean>;
  endingComposition: RefObject<boolean>;
}
const AdapterContext = createContext<Adapter | null>(null);
export const useAutocomplete = () => {
  const adapter = useContext(AdapterContext);
  if (!adapter) {
    throw new Error("Autocomplete parts require AutocompleteRoot.");
  }
  return adapter;
};

export const AutocompleteRoot = <Item,>(props: AutocompleteRootProps<Item>) => {
  const selection = props.mode === "selection";
  const multiple = props.multiple === true;
  const textSingle = !selection && !multiple;
  const getLabel = (item: Item) => props.getItemLabel?.(item) ?? String(item);
  const getId = (item: Item) => props.getItemValue?.(item) ?? String(item);
  const initial = useRef(
    props.defaultValue ?? (multiple ? [] : selection ? null : "")
  );
  const [uncontrolled, setUncontrolled] = useState<
    Item | Item[] | string | string[] | null
  >(initial.current);
  const value = props.value === undefined ? uncontrolled : props.value;
  const selected = selection
    ? (multiple
        ? (value as Item[])
        : value === null
          ? []
          : [value as Item]
      ).map((item) => ({ id: getId(item), label: getLabel(item) }))
    : multiple
      ? (value as string[]).map((tag) => ({ id: tag, label: tag }))
      : [];
  const initialQuery = useRef(
    props.defaultInputValue ??
      (selection && !multiple ? (selected[0]?.label ?? "") : "")
  );
  const [draft, setDraft] = useState(initialQuery.current);
  const text = textSingle ? String(value ?? "") : (props.inputValue ?? draft);
  const [localOpen, setLocalOpen] = useState(props.defaultOpen ?? false);
  const open = props.open ?? localOpen;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const chipsRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<Combobox.Root.Actions | null>(null);
  const composing = useRef(false);
  const endingComposition = useRef(false);
  const blocked = Boolean(props.disabled || props.readOnly);
  const stale = Boolean(props.loading || props.error);
  const { contains } = Combobox.useFilter({ sensitivity: "base" });
  const allOptions: Option[] = [];
  const seen = new Set<string>();
  for (const item of props.items) {
    const label = getLabel(item);
    const id = selection ? getId(item) : multiple ? label.trim() : label;
    if (!seen.has(id)) {
      seen.add(id);
      allOptions.push({
        disabled: Boolean(props.isItemDisabled?.(item)),
        id,
        item,
        label,
      });
    }
  }
  const filterOption = (option: Option) => {
    if (props.filter === null) {
      return true;
    }
    if (props.filter) {
      const customFilter = props.filter;
      return customFilter(option.item as Item, text);
    }
    return contains(option.label, text);
  };
  const options = allOptions.filter(filterOption);
  const labels = new Map(
    [...selected, ...allOptions].map((entry) => [entry.id, entry.label])
  );

  const requestValue = (next: typeof value) => {
    if (blocked) {
      return;
    }
    if (props.value === undefined) {
      setUncontrolled(next);
    }
    // Only the bridge erases value types. Public discriminants still determine
    // callback types; IDs are resolved to original source objects before emission.
    if (props.mode === "selection") {
      if (props.multiple) {
        props.onValueChange?.(next as Item[]);
      } else {
        props.onValueChange?.(next as Item | null);
      }
    } else if (props.multiple) {
      props.onValueChange?.(next as string[]);
    } else {
      props.onValueChange?.(next as string);
    }
  };
  const requestText = (next: string) => {
    if (blocked || next === text) {
      return;
    }
    if (textSingle) {
      requestValue(next);
    } else {
      if (props.inputValue === undefined) {
        setDraft(next);
      }
      props.onInputValueChange?.(next);
    }
  };
  const setOpen = (next: boolean) => {
    if (props.open === undefined) {
      setLocalOpen(next);
    }
    if (open !== next) {
      props.onOpenChange?.(next);
    }
  };
  const restore = () => {
    if (selection) {
      requestText(multiple ? "" : (selected[0]?.label ?? ""));
    }
  };
  const clear = () => {
    if (blocked) {
      return;
    }
    if (
      multiple
        ? selected.length > 0
        : selection
          ? value !== null
          : text.length > 0
    ) {
      requestValue(multiple ? [] : selection ? null : "");
    }
    if (!textSingle) {
      requestText("");
    }
    inputRef.current?.focus();
  };
  const createTag = () => {
    if (blocked || selection || !multiple) {
      return;
    }
    const tag = normalizeAutocompleteTag(text, value as string[]);
    if (tag !== null) {
      requestValue([...(value as string[]), tag]);
      requestText("");
      setOpen(true);
    }
  };
  const receiveIds = (
    next: string[] | string | null,
    details: Combobox.Root.ChangeEventDetails
  ) => {
    if (
      blocked ||
      details.reason === "input-clear" ||
      details.reason === "escape-key"
    ) {
      details.cancel();
      return;
    }
    const ids = [
      ...new Set(Array.isArray(next) ? next : next === null ? [] : [next]),
    ];
    const added = ids.filter(
      (id) => !selected.some((entry) => entry.id === id)
    );
    if (multiple && details.reason === "item-press" && added.length === 0) {
      details.cancel();
      return;
    }
    if (
      added.some(
        (id) => stale || allOptions.find((entry) => entry.id === id)?.disabled
      )
    ) {
      details.cancel();
      return;
    }
    if (multiple) {
      if (
        JSON.stringify(ids) !==
        JSON.stringify(selected.map((entry) => entry.id))
      ) {
        if (selection) {
          const old = value as Item[];
          const nextItems = ids.flatMap((id) => {
            // Preserve existing committed instances. New selections use current source.
            const item =
              old.find((entry) => getId(entry) === id) ??
              (allOptions.find((entry) => entry.id === id)?.item as
                | Item
                | undefined);
            return item === undefined ? [] : [item];
          });
          requestValue(nextItems);
        } else {
          const tags: string[] = [];
          for (const id of ids) {
            const tag = normalizeAutocompleteTag(id, tags);
            if (tag !== null) {
              tags.push(tag);
            }
          }
          requestValue(tags);
        }
      }
      if (added.length > 0) {
        requestText("");
        setOpen(true);
      }
    } else if (selection) {
      const option = allOptions.find((entry) => entry.id === next);
      if (option) {
        if (option.id !== selected[0]?.id) {
          requestValue(option.item as Item);
        }
        requestText(option.label);
        setOpen(false);
      }
    }
  };

  const committedLabel =
    selection && !multiple ? (selected[0]?.label ?? "") : "";
  const previousLabel = useRef(committedLabel);
  const resetting = useRef(false);
  useEffect(() => {
    if (
      previousLabel.current !== committedLabel &&
      !resetting.current &&
      props.inputValue === undefined
    ) {
      setDraft(committedLabel);
    }
    previousLabel.current = committedLabel;
    resetting.current = false;
  }, [committedLabel, props.inputValue, draft]);
  useEffect(() => {
    const missing =
      props.required && (textSingle ? !text : selected.length === 0);
    inputRef.current?.setCustomValidity(
      missing && !blocked ? "Please enter or select a value." : ""
    );
  });
  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) {
      return;
    }
    const reset = (event: Event) => {
      queueMicrotask(() => {
        if (!event.defaultPrevented) {
          if (props.value === undefined) {
            resetting.current = true;
            setUncontrolled(initial.current);
          }
          if (props.inputValue === undefined) {
            setDraft(initialQuery.current);
          }
          if (props.open === undefined) {
            setLocalOpen(false);
          }
          composing.current = false;
          endingComposition.current = false;
          actionsRef.current?.unmount();
        }
      });
    };
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  }, [props.form, props.value, props.inputValue, props.open]);

  const bridge = {
    actionsRef,
    autoHighlight: props.autoHighlight ?? false,
    disabled: props.disabled,
    filter: null,
    filteredItems: stale ? [] : options.map((entry) => entry.id),
    form: props.form,
    items: allOptions.map((entry) => entry.id),
    onOpenChange(next: boolean, details: Combobox.Root.ChangeEventDetails) {
      if (
        !next &&
        ["escape-key", "focus-out", "outside-press"].includes(details.reason)
      ) {
        restore();
      }
      if (!(multiple && details.reason === "item-press")) {
        setOpen(next);
      }
    },
    open,
    readOnly: props.readOnly,
  };
  const formValues = textSingle
    ? [text]
    : multiple
      ? selected.map((entry) => entry.id)
      : [selected[0]?.id ?? ""];
  const children = (
    <>
      {props.children}
      {props.name &&
        formValues.map((entry, index) => (
          <input
            key={`${index}:${entry}`}
            type="hidden"
            name={props.name}
            form={props.form}
            value={entry}
            disabled={props.disabled}
          />
        ))}
    </>
  );
  const adapter: Adapter = {
    actionsRef,
    chipsRef,
    clear,
    composing,
    config: props,
    createTag,
    endingComposition,
    inputRef,
    multiple,
    open,
    options,
    resolveOption: (item) => {
      const id = selection ? getId(item as Item) : getLabel(item as Item);
      return options.find(
        (option) => option.id === (multiple && !selection ? id.trim() : id)
      );
    },
    restore,
    selected,
    selection,
    setOpen,
    text,
    textSingle,
  };
  const queryChanged = (
    next: string,
    details: Combobox.Root.ChangeEventDetails
  ) => {
    if (details.reason === "input-change") {
      requestText(next);
    }
  };
  return (
    <AdapterContext.Provider value={adapter}>
      {textSingle ? (
        <BaseAutocomplete.Root
          {...bridge}
          value={text}
          itemToStringValue={(id) => labels.get(id) ?? id}
          onValueChange={(next, details) => {
            if (blocked || (stale && details.reason === "item-press")) {
              details.cancel();
            } else {
              requestText(next);
            }
          }}
        >
          {children}
        </BaseAutocomplete.Root>
      ) : multiple ? (
        <Combobox.Root<string, true>
          {...bridge}
          multiple
          value={selected.map((entry) => entry.id)}
          inputValue={text}
          itemToStringLabel={(id) => labels.get(id) ?? id}
          onInputValueChange={queryChanged}
          onValueChange={receiveIds}
        >
          {children}
        </Combobox.Root>
      ) : (
        <Combobox.Root<string>
          {...bridge}
          value={selected[0]?.id ?? null}
          inputValue={text}
          itemToStringLabel={(id) => labels.get(id) ?? id}
          onInputValueChange={queryChanged}
          onValueChange={receiveIds}
        >
          {children}
        </Combobox.Root>
      )}
    </AdapterContext.Provider>
  );
};
