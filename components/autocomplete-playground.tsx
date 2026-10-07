"use client";

import {
  autocompleteProps,
  getAutocompleteCode,
  getAutocompleteDefaults,
  getAutocompletePreviewConfig,
} from "../lib/autocomplete-playground";
import type { AutocompletePlaygroundValues } from "../lib/autocomplete-playground";
import { Autocomplete } from "../registry/new-york/autocomplete";
import { ComponentPlayground } from "./component-playground";

export const AutocompletePreview = ({
  values,
}: {
  values: AutocompletePlaygroundValues;
}) => {
  const config = getAutocompletePreviewConfig(values);
  // Remount only when the committed value's shape changes, not on ordinary edits.
  return <Autocomplete key={`${config.mode}:${config.multiple}`} {...config} />;
};
export const AutocompletePlayground = () => (
  <ComponentPlayground
    title="Autocomplete"
    definitions={autocompleteProps}
    initialValues={getAutocompleteDefaults()}
    getCode={getAutocompleteCode}
    hint="Code reproduces configuration, not live values or drafts. Enter creates free-text tags; Reset clears configuration, committed values and drafts."
    renderPreview={(values) => <AutocompletePreview values={values} />}
  />
);
