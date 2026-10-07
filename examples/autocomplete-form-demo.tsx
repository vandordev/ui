"use client";

import { useRef, useState } from "react";

import { Autocomplete } from "@/registry/new-york/autocomplete";

export const AutocompleteFormDemo = () => {
  const [text, setText] = useState("React");
  const [result, setResult] = useState("Submit to inspect committed entries.");
  const ref = useRef<HTMLInputElement | null>(null);
  return (
    <form
      className="grid w-80 max-w-full gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setResult(
          JSON.stringify([...new FormData(event.currentTarget).entries()])
        );
      }}
      onReset={() => {
        setText("React");
        setResult("Defaults restored.");
      }}
    >
      <Autocomplete
        mode="selection"
        items={["React", "Vue", "Svelte"]}
        name="framework"
        label="Required framework"
        required
        inputProps={{ "aria-describedby": "autocomplete-form-help" }}
        ref={ref}
      />
      <p id="autocomplete-form-help" className="text-xs text-muted-foreground">
        Searching is not selecting. Required checks the committed choice.
      </p>
      <Autocomplete
        multiple
        items={["React", "Vue"]}
        name="tags"
        label="Uncontrolled tags"
        defaultValue={["React"]}
        defaultInputValue="draft"
        clearable
      />
      <Autocomplete
        items={["React", "Vue"]}
        name="controlled"
        label="Controlled text"
        value={text}
        onValueChange={setText}
      />
      <Autocomplete
        items={[]}
        name="reference"
        label="Read-only reference"
        value="Editable source"
        readOnly
      />
      <Autocomplete
        items={[]}
        name="excluded"
        label="Disabled (not submitted)"
        defaultValue="Excluded"
        disabled
      />
      <div className="flex flex-wrap gap-3">
        <button type="submit" className="text-sm underline">
          Submit
        </button>
        <button type="reset" className="text-sm underline">
          Reset
        </button>
        <button
          type="button"
          className="text-sm underline"
          onClick={() => ref.current?.focus()}
        >
          Focus framework
        </button>
      </div>
      <output className="text-xs break-words text-muted-foreground">
        {result}
      </output>
    </form>
  );
};
